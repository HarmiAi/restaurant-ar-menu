import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function PizzaModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15
  })

  return (
    <group ref={group} scale={0.28}>
      {/* Crust */}
      <mesh castShadow receiveShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[1, 1.05, 0.03, 32]} />
        <meshStandardMaterial color="#d4a056" roughness={0.7} />
      </mesh>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.02, 32]} />
        <meshStandardMaterial color="#e8c87a" roughness={0.6} />
      </mesh>
      {/* Sauce */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.01, 32]} />
        <meshStandardMaterial color="#c0392b" roughness={0.8} />
      </mesh>
      {/* Cheese */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.015, 32]} />
        <meshStandardMaterial color="#f5e6a3" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Toppings */}
      {[
        [0.3, 0.08, 0.2],
        [-0.25, 0.08, 0.3],
        [0.1, 0.08, -0.35],
        [-0.35, 0.08, -0.15],
        [0.4, 0.08, -0.1],
        [-0.1, 0.08, 0.4],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#c0392b' : '#27ae60'} roughness={0.6} />
        </mesh>
      ))}
      {/* Basil leaves */}
      {[
        [0, 0.09, 0.15],
        [-0.2, 0.09, -0.1],
        [0.15, 0.09, -0.25],
      ].map((pos, i) => (
        <mesh key={`basil-${i}`} position={pos as [number, number, number]} rotation={[0.3, i, 0.2]} castShadow>
          <boxGeometry args={[0.08, 0.005, 0.04]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
