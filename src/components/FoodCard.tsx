import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FoodItem } from '../types'
import { useStore } from '../store/useStore'

interface FoodCardProps {
  item: FoodItem
  index: number
  basePath?: string
}

export default function FoodCard({ item, index, basePath = '' }: FoodCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const config = useStore((s) => s.config)
  const addToCart = useStore((s) => s.addToCart)
  const setSelectedItem = useStore((s) => s.setSelectedItem)

  const isChefPick = item.featured
  const isPopular = !isChefPick && (item.name.length % 3 === 0)
  const isTrending = !isChefPick && !isPopular && (item.name.length % 3 === 1)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group glass-card rounded-2xl overflow-hidden hover:border-[var(--color-gold)]/30 transition-all duration-500"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => setSelectedItem(item)}
      >
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {isChefPick && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-gold)]/20 backdrop-blur-sm border border-[var(--color-gold)]/30 text-[10px] font-medium text-[var(--color-gold-light)] uppercase tracking-wider">
            <Sparkles size={10} />
            Chef&apos;s Pick
          </div>
        )}

        {isPopular && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-[10px] font-medium text-red-300 uppercase tracking-wider">
            Popular
          </div>
        )}

        {isTrending && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-[10px] font-medium text-blue-300 uppercase tracking-wider">
            Trending
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="font-display text-xl text-white">{item.name}</span>
          <span className="text-lg font-semibold text-[var(--color-gold-light)]">
            {config.currency}{item.price}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-white/50 line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex gap-2">
          <Link
            to={`${basePath}/ar/${item.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-sm font-medium text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/20 transition-all"
          >
            <Eye size={16} />
            View in AR
          </Link>
          <button
            onClick={() => addToCart(item)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}
