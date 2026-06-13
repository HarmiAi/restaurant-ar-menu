import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Utensils, Store, QrCode, Sparkles } from 'lucide-react'

export default function WelcomeGuide() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-10 glass-card rounded-3xl p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-3 text-center">
        Welcome to Lumière
      </p>
      <h2 className="font-display text-2xl sm:text-3xl text-white text-center mb-2">
        AR Restaurant Menu Platform
      </h2>
      <p className="text-center text-white/45 text-sm max-w-xl mx-auto mb-8">
        Customers scan QR → browse menu → view food in AR on table → order via WhatsApp.
        Restaurant owners manage everything from one dashboard.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/r/lumiere"
          className="group rounded-2xl p-5 bg-white/[0.03] border border-white/8 hover:border-[var(--color-gold)]/30 transition-all"
        >
          <Utensils size={22} className="text-[var(--color-gold)] mb-3" />
          <h3 className="text-white font-medium mb-1">I&apos;m a Customer</h3>
          <p className="text-xs text-white/40 leading-relaxed">
            Browse demo menu, try AR food viewer, and place a sample order.
          </p>
          <span className="inline-block mt-3 text-xs text-[var(--color-gold)] group-hover:underline">
            View Demo Menu →
          </span>
        </Link>

        <Link
          to="/register"
          className="group rounded-2xl p-5 bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/40 transition-all"
        >
          <Store size={22} className="text-[var(--color-gold)] mb-3" />
          <h3 className="text-white font-medium mb-1">I&apos;m a Restaurant Owner</h3>
          <p className="text-xs text-white/40 leading-relaxed">
            Create free account, add dishes, upload 3D models, get your QR code.
          </p>
          <span className="inline-block mt-3 text-xs text-[var(--color-gold)] group-hover:underline">
            Start Free Trial →
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-white/30">
        <span className="flex items-center gap-1.5"><QrCode size={14} /> QR Menu</span>
        <span className="flex items-center gap-1.5"><Sparkles size={14} /> AR Food View</span>
        <span className="flex items-center gap-1.5"><Utensils size={14} /> WhatsApp Orders</span>
      </div>
    </motion.section>
  )
}
