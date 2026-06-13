import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function BurgerModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.2
  })

  return (
    <group ref={group} scale={0.12}>
      {/* Bottom bun */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1, 1.1, 0.3, 24]} />
        <meshStandardMaterial color="#c8956c" roughness={0.8} />
      </mesh>
      {/* Lettuce */}
      <mesh position={[0, 0.35, 0]} rotation={[0, 0.3, 0]}>
        <torusGeometry args={[0.95, 0.06, 8, 24]} />
        <meshStandardMaterial color="#4a9c2d" roughness={0.7} />
      </mesh>
      {/* Patty */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.2, 24]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* Cheese */}
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1.6, 0.04, 1.6]} />
        <meshStandardMaterial color="#f4a020" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Tomato */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.08, 24]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
      {/* Top bun */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d4a574" roughness={0.75} />
      </mesh>
      {/* Sesame seeds */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 0.5 + Math.random() * 0.3
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, 1.05, Math.sin(angle) * r]}
            rotation={[Math.random(), Math.random(), Math.random()]}
          >
            <boxGeometry args={[0.04, 0.02, 0.02]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}
