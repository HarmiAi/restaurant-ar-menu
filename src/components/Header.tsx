import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Settings, Sun, Moon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const config = useStore((s) => s.config)
  const cart = useStore((s) => s.cart)
  const setCartOpen = useStore((s) => s.setCartOpen)

  const { theme, toggleTheme } = useTheme()
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 glass-card border-b border-[var(--color-luxury-border)]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="group">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold gold-gradient-text tracking-wide">
            {config.name}
          </h1>
          <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-white/35 group-hover:text-white/50 transition-colors">
            {config.tagline}
          </p>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-white/40 hover:text-[var(--color-gold)] hover:bg-white/5 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link
            to="/dashboard"
            className="p-2.5 rounded-xl text-white/40 hover:text-[var(--color-gold)] hover:bg-white/5 transition-all"
            aria-label="Admin panel"
          >
            <Settings size={20} />
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/20 transition-all"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline text-sm font-medium">Order</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-gold)] text-[10px] font-bold text-black">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  )
}
