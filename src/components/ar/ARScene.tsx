import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { IfInSessionMode, NotInXR, useRequestXRAnchor, useXR } from '@react-three/xr'
import { Matrix4, Quaternion, Vector3, type Group } from 'three'
import { useHitTest } from '../../hooks/useHitTest'
import {
  applyPlacementPose,
  clampFoodScale,
  normalizeFoodModelScale,
  type PlacementPose,
} from '../../utils/modelPlacement'
import FoodModel3D from './FoodModel3D'
import type { FoodItem } from '../../types'

interface ARSceneProps {
  item: FoodItem
  onPlaced?: () => void
  onPlacementStateChange?: (isPlaced: boolean) => void
  onSurfaceStateChange?: (hasSurface: boolean) => void
}

interface ARTransformDetail {
  rotateDelta?: number
  scaleMultiplier?: number
}

const anchorMatrix = new Matrix4()
const anchorPosition = new Vector3()
const anchorQuaternion = new Quaternion()
const yawQuaternion = new Quaternion()
const yAxis = new Vector3(0, 1, 0)

function Reticle({ pose, visible }: { pose: PlacementPose | null; visible: boolean }) {
  const ref = useRef<Group>(null)

  useEffect(() => {
    if (!ref.current || !pose) return
    applyPlacementPose(ref.current, pose)
  }, [pose])

  return (
    <group ref={ref} visible={visible && pose !== null}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.105, 0.125, 48]} />
        <meshBasicMaterial color="#f7d37a" transparent opacity={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 32]} />
        <meshBasicMaterial color="#f7d37a" transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

function ARPlacement({
  item,
  onPlaced,
  onPlacementStateChange,
  onSurfaceStateChange,
}: ARSceneProps) {
  const placedGroupRef = useRef<Group>(null)
  const modelRef = useRef<Group>(null)
  const anchorRef = useRef<XRAnchor | null>(null)
  const fallbackPoseRef = useRef<PlacementPose | null>(null)
  const normalizedScaleRef = useRef<number | null>(null)
  const yawRef = useRef(0)
  const userScaleRef = useRef(1)
  const [isPlaced, setIsPlaced] = useState(false)
  const session = useXR((state) => state.session)
  const referenceSpace = useXR((state) => state.originReferenceSpace)
  const createAnchor = useRequestXRAnchor()
  const { hasSurface, pose, requestPlacementPose } = useHitTest(!isPlaced)

  useEffect(() => {
    onSurfaceStateChange?.(hasSurface)
  }, [hasSurface, onSurfaceStateChange])

  const updateVisibleScale = useCallback(() => {
    if (!modelRef.current || normalizedScaleRef.current === null) return
    modelRef.current.scale.setScalar(normalizedScaleRef.current * userScaleRef.current)
  }, [])

  const resetPlacement = useCallback(() => {
    anchorRef.current?.delete?.()
    anchorRef.current = null
    fallbackPoseRef.current = null
    yawRef.current = 0
    userScaleRef.current = 1
    normalizedScaleRef.current = null
    setIsPlaced(false)
    onPlacementStateChange?.(false)
    if (placedGroupRef.current) placedGroupRef.current.visible = false
  }, [onPlacementStateChange])

  const placeDish = useCallback(async () => {
    if (!modelRef.current || isPlaced) return

    const placement = await requestPlacementPose()
    if (!placement) return

    normalizedScaleRef.current = normalizeFoodModelScale(modelRef.current, item)
    updateVisibleScale()

    fallbackPoseRef.current = placement.pose
    if (placedGroupRef.current) {
      applyPlacementPose(placedGroupRef.current, placement.pose)
      placedGroupRef.current.visible = true
    }

    try {
      anchorRef.current = await createAnchor({
        relativeTo: 'hit-test-result',
        hitTestResult: placement.hitTestResult,
      }) ?? null
    } catch {
      anchorRef.current = null
    }

    setIsPlaced(true)
    onPlacementStateChange?.(true)
    onPlaced?.()
  }, [createAnchor, isPlaced, item, onPlaced, onPlacementStateChange, requestPlacementPose, updateVisibleScale])

  useEffect(() => {
    const handlePlace = () => {
      void placeDish()
    }
    const handleReset = () => {
      resetPlacement()
    }
    const handleTransform = (event: Event) => {
      const detail = (event as CustomEvent<ARTransformDetail>).detail
      if (!detail || !isPlaced) return

      if (detail.rotateDelta) {
        yawRef.current += detail.rotateDelta
      }
      if (detail.scaleMultiplier) {
        userScaleRef.current = clampFoodScale(userScaleRef.current * detail.scaleMultiplier)
        updateVisibleScale()
      }
    }

    window.addEventListener('ar-place', handlePlace)
    window.addEventListener('ar-reset-placement', handleReset)
    window.addEventListener('ar-transform-model', handleTransform)

    return () => {
      window.removeEventListener('ar-place', handlePlace)
      window.removeEventListener('ar-reset-placement', handleReset)
      window.removeEventListener('ar-transform-model', handleTransform)
    }
  }, [isPlaced, placeDish, resetPlacement, updateVisibleScale])

  useEffect(() => {
    return resetPlacement
  }, [resetPlacement, session])

  useFrame((_, __, frame?: XRFrame) => {
    if (!isPlaced || !placedGroupRef.current) return

    if (modelRef.current && normalizedScaleRef.current === null) {
      normalizedScaleRef.current = normalizeFoodModelScale(modelRef.current, item)
      updateVisibleScale()
    }

    let appliedAnchorPose = false
    if (frame && referenceSpace && anchorRef.current) {
      const pose = frame.getPose(anchorRef.current.anchorSpace, referenceSpace)
      if (pose) {
        anchorMatrix.fromArray(pose.transform.matrix)
        anchorPosition.setFromMatrixPosition(anchorMatrix)
        anchorQuaternion.setFromRotationMatrix(anchorMatrix)
        yawQuaternion.setFromAxisAngle(yAxis, yawRef.current)
        placedGroupRef.current.position.copy(anchorPosition)
        placedGroupRef.current.quaternion.copy(anchorQuaternion).multiply(yawQuaternion)
        appliedAnchorPose = true
      }
    }

    if (!appliedAnchorPose && fallbackPoseRef.current) {
      placedGroupRef.current.position.copy(fallbackPoseRef.current.position)
      yawQuaternion.setFromAxisAngle(yAxis, yawRef.current)
      placedGroupRef.current.quaternion.copy(fallbackPoseRef.current.quaternion).multiply(yawQuaternion)
    }
  })

  return (
    <>
      <Reticle pose={pose} visible={!isPlaced && hasSurface} />

      <group ref={placedGroupRef} visible={false}>
        <group ref={modelRef}>
          <FoodModel3D modelType={item.modelType} modelUrl={item.modelUrl} />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
          <circleGeometry args={[0.19, 48]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>
    </>
  )
}

function PreviewScene({ item }: { item: FoodItem }) {
  return (
    <NotInXR>
      <group position={[0, 0.05, 0]}>
        <FoodModel3D modelType={item.modelType} modelUrl={item.modelUrl} />
      </group>
      <ContactShadows position={[0, 0, 0]} opacity={0.65} scale={2} blur={2.6} far={1} />
      <OrbitControls
        enableDamping
        enablePan={false}
        enableZoom
        maxDistance={2.2}
        minDistance={0.35}
        target={[0, 0.05, 0]}
        makeDefault
      />
    </NotInXR>
  )
}

export default function ARScene({
  item,
  onPlaced,
  onPlacementStateChange,
  onSurfaceStateChange,
}: ARSceneProps) {
  const { gl } = useThree()
  const isPresenting = useXR((state) => state.session !== undefined)

  useEffect(() => {
    gl.setClearColor(0x0a0a0f, isPresenting ? 0 : 1)
  }, [gl, isPresenting])

  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#f7d37a" />
        <hemisphereLight intensity={0.45} groundColor="#1a1a1f" color="#fff8f0" />
      </>
    ),
    [],
  )

  return (
    <>
      {lights}

      <IfInSessionMode allow="immersive-ar">
        <ARPlacement
          item={item}
          onPlaced={onPlaced}
          onPlacementStateChange={onPlacementStateChange}
          onSurfaceStateChange={onSurfaceStateChange}
        />
      </IfInSessionMode>

      <PreviewScene item={item} />

      {!isPresenting && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[1.5, 48]} />
          <meshStandardMaterial color="#1a1a1f" roughness={0.9} />
        </mesh>
      )}
    </>
  )
}
