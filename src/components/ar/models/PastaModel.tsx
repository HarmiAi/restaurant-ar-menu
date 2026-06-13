import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export default function PastaModel() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={group} scale={0.15}>
      {/* Bowl */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.2, 0.8, 0.4, 32, 1, true]} />
        <meshStandardMaterial color="#f5f0eb" roughness={0.3} metalness={0.1} side={2} />
      </mesh>
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.02, 32]} />
        <meshStandardMaterial color="#f5f0eb" roughness={0.3} />
      </mesh>
      {/* Pasta nest */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.4, 0.2 + i * 0.02, Math.sin(angle) * 0.4]}
            rotation={[0.3, angle, 0.5]}
            castShadow
          >
            <torusGeometry args={[0.25, 0.04, 8, 16]} />
            <meshStandardMaterial color="#f0d78c" roughness={0.6} />
          </mesh>
        )
      })}
      {/* Sauce */}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#c0392b" roughness={0.7} transparent opacity={0.85} />
      </mesh>
      {/* Garnish */}
      <mesh position={[0.3, 0.35, 0.2]} rotation={[0, 0.5, 0.3]} castShadow>
        <boxGeometry args={[0.15, 0.01, 0.05]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.7} />
      </mesh>
    </group>
  )
}
