import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function SandwichModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18
  })

  return (
    <group ref={group} scale={0.1} rotation={[0, 0.5, 0]}>
      {/* Bottom bread */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[2.5, 0.25, 2]} />
        <meshStandardMaterial color="#c8956c" roughness={0.8} />
      </mesh>
      {/* Lettuce */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.4, 0.08, 1.9]} />
        <meshStandardMaterial color="#4a9c2d" roughness={0.7} />
      </mesh>
      {/* Tomato */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[2.2, 0.1, 1.7]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
      {/* Cheese */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.3, 0.06, 1.8]} />
        <meshStandardMaterial color="#f4a020" roughness={0.4} />
      </mesh>
      {/* Meat */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[2.2, 0.15, 1.7]} />
        <meshStandardMaterial color="#8b4513" roughness={0.85} />
      </mesh>
      {/* Top bread */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[2.5, 0.3, 2]} />
        <meshStandardMaterial color="#d4a574" roughness={0.75} />
      </mesh>
      {/* Toothpick */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.5} />
      </mesh>
    </group>
  )
}
