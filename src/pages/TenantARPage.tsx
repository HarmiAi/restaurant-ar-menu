import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { TenantProvider, useTenant } from '../context/TenantContext'
import { useAnalytics } from '../hooks/useAnalytics'
import { useStore } from '../store/useStore'
import type { FoodCategory, FoodItem, ModelType } from '../types'

const ARViewer = lazy(() => import('../components/ar/ARViewer'))

function TenantARContent() {
  const { id, slug } = useParams<{ id: string; slug: string }>()
  const { dishes, restaurant, isLoading } = useTenant()
  const { trackARStart, trackARPlace } = useAnalytics()
  const addToCart = useStore((s) => s.addToCart)
  const fallbackMenu = useStore((s) => s.menu)

  const dish = dishes.find((d) => d._id === id)
  const fallbackItem = fallbackMenu.find((m) => m.id === id)

  useEffect(() => {
    if (dish) trackARStart(dish._id)
  }, [dish, trackARStart])

  if (isLoading) return null
  if (!restaurant || (!dish && !fallbackItem)) return <Navigate to={`/r/${slug}`} replace />

  const item: FoodItem = dish
    ? {
        id: dish._id,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: (typeof dish.categoryId === 'object' ? dish.categoryId.slug : 'pizza') as FoodCategory,
        image: dish.imageUrl,
        modelType: dish.modelType as ModelType,
        modelUrl: dish.modelUrl,
      }
    : fallbackItem!

  const analyticsDishId = dish?._id ?? item.id

  return (
    <div className="fixed inset-0 flex flex-col luxury-bg">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 glass-card border-b border-[var(--color-luxury-border)] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link to={`/r/${slug}`} className="flex items-center gap-2 text-white/50 hover:text-white">
            <ArrowLeft size={18} />
            <span className="text-sm">Menu</span>
          </Link>
          <div className="text-center flex-1 px-4">
            <h1 className="font-display text-lg text-white truncate">{item.name}</h1>
            <p className="text-xs text-[var(--color-gold)]">{restaurant.currency}{item.price}</p>
          </div>
          <button
            onClick={() => addToCart(item)}
            className="p-2.5 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)]"
          >
            <Plus size={18} />
          </button>
        </div>
      </motion.header>

      <div className="flex-1 relative min-h-0">
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><div className="h-10 w-10 rounded-full border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] animate-spin" /></div>}>
          <ARViewer item={item} onPlaced={() => trackARPlace(analyticsDishId)} />
        </Suspense>
      </div>
    </div>
  )
}

export default function TenantARPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return null
  return (
    <TenantProvider slug={slug}>
      <TenantARContent />
    </TenantProvider>
  )
}
