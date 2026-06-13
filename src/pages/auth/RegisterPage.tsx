import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurantName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password.length < 8) {
      setError('Password at least 8 characters hovo joie.')
      setLoading(false)
      return
    }

    if (form.restaurantName.trim().length < 2) {
      setError('Restaurant name at least 2 characters lakho.')
      setLoading(false)
      return
    }

    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen luxury-bg flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-8"
      >
        <h1 className="font-display text-3xl gold-gradient-text text-center mb-2">Start Free Trial</h1>
        <p className="text-center text-white/40 text-sm mb-6">
          Create your restaurant account in 30 seconds
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-white/40 uppercase tracking-wider">Restaurant Name</span>
            <input
              type="text"
              value={form.restaurantName}
              onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
              placeholder="e.g. Spice Garden"
              required
              minLength={2}
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
            />
          </label>

          <label className="block">
            <span className="text-xs text-white/40 uppercase tracking-wider">Your Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Patel"
              required
              minLength={2}
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
            />
          </label>

          <label className="block">
            <span className="text-xs text-white/40 uppercase tracking-wider">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@restaurant.com"
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
            />
          </label>

          <label className="block">
            <span className="text-xs text-white/40 uppercase tracking-wider">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
            />
          </label>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] text-black font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating your restaurant...' : 'Create Restaurant'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-gold)] hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
