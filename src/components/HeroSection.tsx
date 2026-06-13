import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative py-16 sm:py-24 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-gold)] mb-4">
          Premium Dining Experience
        </p>
        <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold text-white leading-tight">
          Taste Before
          <br />
          <span className="gold-gradient-text">You Order</span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
          Explore our curated menu in stunning augmented reality.
          See every dish at real-world scale on your table.
        </p>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,98,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </section>
  )
}
