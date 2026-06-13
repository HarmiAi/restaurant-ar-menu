import { useGLTF } from '@react-three/drei'

interface GLBModelProps {
  url: string
}

export default function GLBModel({ url }: GLBModelProps) {
  const { scene } = useGLTF(url)
  return <primitive object={scene.clone()} />
}
