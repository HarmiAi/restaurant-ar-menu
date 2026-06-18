import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame, Eye, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CATEGORY_LABELS } from '../types'

interface ProductModalProps {
  basePath?: string
}

export default function ProductModal({ basePath = '' }: ProductModalProps) {
  const selectedItem = useStore((s) => s.selectedItem)
  const setSelectedItem = useStore((s) => s.setSelectedItem)
  const config = useStore((s) => s.config)
  const addToCart = useStore((s) => s.addToCart)

  const menu = useStore((s) => s.menu)
  const recommendations = useMemo(() => {
    if (!selectedItem) return []
    return menu
      .filter((item) => item.id !== selectedItem.id && item.category !== selectedItem.category)
      .slice(0, 2)
  }, [selectedItem, menu])

  return (
    <AnimatePresence>
      {selectedItem && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 mx-auto max-w-lg sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full glass-card rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="relative aspect-video">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-luxury-surface)] via-transparent to-black/20" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-xs uppercase tracking-widest text-[var(--color-gold)]">
                  {CATEGORY_LABELS[selectedItem.category]}
                </span>
                <h2 className="font-display text-3xl text-white mt-1">
                  {selectedItem.name}
                </h2>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-semibold text-[var(--color-gold-light)]">
                  {config.currency}{selectedItem.price}
                </span>
                <div className="flex gap-4 text-sm text-white/40">
                  {selectedItem.calories && (
                    <span className="flex items-center gap-1">
                      <Flame size={14} />
                      {selectedItem.calories} cal
                    </span>
                  )}
                  {selectedItem.prepTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {selectedItem.prepTime}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-white/55 leading-relaxed mb-6">
                {selectedItem.description}
              </p>

              <div className="flex gap-3">
                <Link
                  to={`${basePath}/ar/${selectedItem.id}`}
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Eye size={18} />
                  View in AR
                </Link>
                <button
                  onClick={() => {
                    addToCart(selectedItem)
                    setSelectedItem(null)
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl glass-card text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  <Plus size={18} />
                  Add to Order
                </button>
              </div>

              {recommendations.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-6">
                  <h4 className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-3">
                    Customers also order
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {recommendations.map((recItem) => (
                      <div
                        key={recItem.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <img
                          src={recItem.image}
                          alt={recItem.name}
                          className="h-10 w-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{recItem.name}</p>
                          <p className="text-[10px] text-[var(--color-gold-light)] font-semibold">
                            {config.currency}{recItem.price}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(recItem)}
                          className="p-1 rounded bg-[var(--color-gold)]/10 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)] hover:text-black transition-colors shrink-0"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
