import { Suspense, lazy } from 'react'
import { Center } from '@react-three/drei'
import type { ModelType } from '../../types'
import type { Group } from 'three'

const PizzaModel = lazy(() => import('./models/PizzaModel'))
const BurgerModel = lazy(() => import('./models/BurgerModel'))
const PastaModel = lazy(() => import('./models/PastaModel'))
const SandwichModel = lazy(() => import('./models/SandwichModel'))
const BiryaniModel = lazy(() => import('./models/BiryaniModel'))
const DessertModel = lazy(() => import('./models/DessertModel'))
const DrinksModel = lazy(() => import('./models/DrinksModel'))
const GLBModel = lazy(() => import('./GLBModel'))

interface FoodModel3DProps {
  modelType: ModelType
  modelUrl?: string
}

function ModelByType({ modelType }: { modelType: ModelType }) {
  switch (modelType) {
    case 'pizza': return <PizzaModel />
    case 'burger': return <BurgerModel />
    case 'pasta': return <PastaModel />
    case 'sandwich': return <SandwichModel />
    case 'biryani': return <BiryaniModel />
    case 'dessert': return <DessertModel />
    case 'drinks': return <DrinksModel />
    default: return <PizzaModel />
  }
}

export default function FoodModel3D({ modelType, modelUrl }: FoodModel3DProps) {
  return (
    <Suspense fallback={null}>
      <Center>
        {modelUrl ? (
          <GLBModel url={modelUrl} />
        ) : (
          <ModelByType modelType={modelType} />
        )}
      </Center>
    </Suspense>
  )
}

export type FoodModelRef = Group
