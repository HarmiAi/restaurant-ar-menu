import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function OnboardingBanner() {
  const { restaurants } = useAuth()
  const restaurant = restaurants[0]

  const steps = [
    { label: 'Account created', done: true },
    { label: 'Add WhatsApp number in Settings', done: false, link: '/dashboard/settings' },
    { label: 'Add your first dish', done: false, link: '/dashboard/dishes' },
    { label: 'Generate QR code', done: false, link: '/dashboard/settings' },
    { label: 'Share menu link', done: false, link: restaurant ? `/r/${restaurant.slug}` : '#' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 lg:mx-10 mt-6 glass-card rounded-2xl p-5 border border-[var(--color-gold)]/20"
    >
      <h2 className="font-display text-lg text-white mb-1">Welcome! Quick setup guide</h2>
      <p className="text-xs text-white/40 mb-4">
        Follow these steps to launch your AR menu in minutes.
      </p>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2 text-sm">
            {step.done ? (
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            ) : (
              <Circle size={16} className="text-white/20 shrink-0" />
            )}
            {step.link && !step.done ? (
              <Link to={step.link} className="text-white/60 hover:text-[var(--color-gold)] transition-colors">
                {step.label}
              </Link>
            ) : (
              <span className={step.done ? 'text-white/50' : 'text-white/70'}>{step.label}</span>
            )}
          </div>
        ))}
      </div>
      {restaurant && (
        <p className="mt-4 text-xs text-[var(--color-gold)]/70">
          Your menu link: <strong>/r/{restaurant.slug}</strong>
        </p>
      )}
    </motion.div>
  )
}
