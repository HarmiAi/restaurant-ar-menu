import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen luxury-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-8"
      >
        <h1 className="font-display text-3xl gold-gradient-text text-center mb-2">Lumière</h1>
        <p className="text-center text-white/40 text-sm mb-8">Restaurant CMS Login</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-white/40 uppercase tracking-wider">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/40 uppercase tracking-wider">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
            />
          </label>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] text-black font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          No account?{' '}
          <Link to="/register" className="text-[var(--color-gold)] hover:underline">
            Register restaurant
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
