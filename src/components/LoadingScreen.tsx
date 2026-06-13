import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center luxury-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <motion.div
          className="mx-auto mb-8 h-20 w-20 rounded-full border border-[var(--color-gold)]/30 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="h-14 w-14 rounded-full border-2 border-transparent border-t-[var(--color-gold)]" />
        </motion.div>

        <h1 className="font-display text-5xl font-semibold gold-gradient-text tracking-wider">
          Lumière
        </h1>
        <p className="mt-3 text-sm tracking-[0.3em] uppercase text-white/40">
          Augmented Dining Experience
        </p>

        <motion.div
          className="mt-10 h-0.5 w-48 mx-auto rounded-full overflow-hidden bg-white/5"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
