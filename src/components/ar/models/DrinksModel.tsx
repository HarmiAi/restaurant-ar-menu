import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function DrinksModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={group} scale={0.12}>
      {/* Glass */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 1, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0}
          transmission={0.9}
          thickness={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Liquid */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.45, 0.42, 0.6, 32]} />
        <meshStandardMaterial color="#c0392b" roughness={0.2} transparent opacity={0.85} />
      </mesh>
      {/* Ice cubes */}
      {[
        [0.1, 0.55, 0.05],
        [-0.12, 0.5, -0.08],
        [0.05, 0.6, -0.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0.2, i, 0.3]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshPhysicalMaterial
            color="#e8f4f8"
            roughness={0.1}
            transmission={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* Orange peel garnish */}
      <mesh position={[0.35, 0.75, 0]} rotation={[0, 0, -0.5]} castShadow>
        <torusGeometry args={[0.12, 0.02, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#e67e22" roughness={0.6} />
      </mesh>
      {/* Cherry */}
      <mesh position={[-0.15, 0.85, 0.1]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#8b0000" roughness={0.4} />
      </mesh>
      {/* Stem */}
      <mesh position={[-0.15, 0.95, 0.1]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1, 4]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
    </group>
  )
}
