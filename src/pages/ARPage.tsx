import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, ShoppingBag } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useStore } from '../store/useStore'

const ARViewer = lazy(() => import('../components/ar/ARViewer'))

export default function ARPage() {
  const { id } = useParams<{ id: string }>()
  const menu = useStore((s) => s.menu)
  const config = useStore((s) => s.config)
  const addToCart = useStore((s) => s.addToCart)

  const item = menu.find((m) => m.id === id)

  if (!item) return <Navigate to="/" replace />

  return (
    <div className="fixed inset-0 flex flex-col luxury-bg">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 glass-card border-b border-[var(--color-luxury-border)] px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Menu</span>
          </Link>
          <div className="text-center flex-1 px-4">
            <h1 className="font-display text-lg text-white truncate">{item.name}</h1>
            <p className="text-xs text-[var(--color-gold)]">
              {config.currency}{item.price}
            </p>
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
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] animate-spin" />
            </div>
          }
        >
          <ARViewer item={item} />
        </Suspense>
      </div>

      <div className="relative z-10 glass-card border-t border-[var(--color-luxury-border)] px-4 py-3">
        <p className="text-xs text-white/40 text-center mb-2 line-clamp-1">
          {item.description}
        </p>
        <button
          onClick={() => addToCart(item)}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-all"
        >
          <ShoppingBag size={16} />
          Add to Order — {config.currency}{item.price}
        </button>
      </div>
    </div>
  )
}
