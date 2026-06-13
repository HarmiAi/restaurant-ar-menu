import { useCallback, useMemo, useRef, useState } from 'react'
import { useXRHitTest, useXRRequestHitTest } from '@react-three/xr'
import { Matrix4 } from 'three'
import { createPlacementPose, type PlacementPose } from '../utils/modelPlacement'

const TRACKABLE_SURFACES: XRHitTestTrackableType[] = ['plane', 'mesh']

export function useHitTest(enabled = true) {
  const matrixRef = useRef(new Matrix4())
  const requestHitTest = useXRRequestHitTest()
  const [pose, setPose] = useState<PlacementPose | null>(null)
  const [hasSurface, setHasSurface] = useState(false)

  useXRHitTest(
    enabled
      ? (results, getWorldMatrix) => {
          if (results.length === 0) {
            setHasSurface(false)
            return
          }

          const matrix = matrixRef.current
          if (!getWorldMatrix(matrix, results[0])) {
            setHasSurface(false)
            return
          }

          setPose(createPlacementPose(matrix))
          setHasSurface(true)
        }
      : undefined,
    'viewer',
    TRACKABLE_SURFACES,
  )

  const requestPlacementPose = useCallback(async () => {
    const result = await requestHitTest('viewer', TRACKABLE_SURFACES)
    if (!result?.results.length) return null

    const matrix = matrixRef.current
    if (!result.getWorldMatrix(matrix, result.results[0])) return null

    return {
      hitTestResult: result.results[0],
      pose: createPlacementPose(matrix),
    }
  }, [requestHitTest])

  return useMemo(
    () => ({
      hasSurface,
      pose,
      requestPlacementPose,
    }),
    [hasSurface, pose, requestPlacementPose],
  )
}
