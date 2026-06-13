import { motion } from 'framer-motion'
import { ALL_CATEGORIES, CATEGORY_LABELS, type FoodCategory } from '../types'
import { useStore } from '../store/useStore'

const categories: Array<FoodCategory | 'all'> = ['all', ...ALL_CATEGORIES]

interface CategoryFilterProps {
  categories?: string[]
}

export default function CategoryFilter({ categories: customCats }: CategoryFilterProps) {
  const activeCategory = useStore((s) => s.activeCategory)
  const setActiveCategory = useStore((s) => s.setActiveCategory)

  const categoryList: Array<FoodCategory | 'all'> = customCats
    ? ['all', ...(customCats as FoodCategory[])]
    : categories

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
      {categoryList.map((cat) => {
        const isActive = activeCategory === cat
        const label = cat === 'all' ? 'All' : (CATEGORY_LABELS[cat as FoodCategory] ?? cat)

        return (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="relative shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                isActive ? 'text-[var(--color-gold-light)]' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
