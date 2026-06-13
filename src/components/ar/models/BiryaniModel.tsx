import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function BiryaniModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={group} scale={0.14}>
      {/* Pot */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1, 0.85, 0.5, 32]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Lid rim */}
      <mesh position={[0, 0.52, 0]}>
        <torusGeometry args={[1.05, 0.04, 8, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Rice mound */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.85} />
      </mesh>
      {/* Saffron layer */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#e8a838" roughness={0.7} />
      </mesh>
      {/* Garnish - fried onions */}
      {[
        [0.3, 0.85, 0.1],
        [-0.2, 0.9, 0.25],
        [0.1, 0.88, -0.3],
        [-0.35, 0.82, -0.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <torusGeometry args={[0.08, 0.02, 6, 12]} />
          <meshStandardMaterial color="#8b6914" roughness={0.8} />
        </mesh>
      ))}
      {/* Mint garnish */}
      <mesh position={[0, 1.0, 0]} rotation={[0.2, 0, 0.3]} castShadow>
        <boxGeometry args={[0.12, 0.01, 0.06]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.7} />
      </mesh>
    </group>
  )
}
