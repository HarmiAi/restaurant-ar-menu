import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function DessertModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15
  })

  return (
    <group ref={group} scale={0.1}>
      {/* Ramekin */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1, 0.85, 0.4, 32]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Soufflé rise */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.85, 0.9, 0.7, 32]} />
        <meshStandardMaterial color="#3d2314" roughness={0.7} />
      </mesh>
      {/* Top dome */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a2c17" roughness={0.65} />
      </mesh>
      {/* Gold leaf */}
      <mesh position={[0.3, 1.05, 0.2]} rotation={[0.5, 0.3, 0.2]}>
        <boxGeometry args={[0.15, 0.005, 0.1]} />
        <meshStandardMaterial color="#c9a962" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Powdered sugar dust */}
      <mesh position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.3} />
      </mesh>
      {/* Berry garnish */}
      <mesh position={[-0.2, 1.0, 0.3]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#8b0000" roughness={0.5} />
      </mesh>
    </group>
  )
}
