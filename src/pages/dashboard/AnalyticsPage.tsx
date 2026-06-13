import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { api, type AnalyticsDashboard } from '../../lib/api'

export default function AnalyticsPage() {
  const { restaurants } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null)
  const [days, setDays] = useState(30)
  const restaurant = restaurants[0]

  useEffect(() => {
    if (restaurant) {
      api.getAnalytics(restaurant._id, days).then(setAnalytics).catch(() => {})
    }
  }, [restaurant, days])

  const eventLabels: Record<string, string> = {
    qr_scan: 'QR Scans',
    page_view: 'Page Views',
    dish_view: 'Dish Views',
    ar_start: 'AR Sessions',
    ar_place: 'AR Placements',
    add_to_cart: 'Add to Cart',
    order_submit: 'Orders',
    search: 'Searches',
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {analytics?.events &&
          Object.entries(analytics.events).map(([key, count]) => (
            <div key={key} className="glass-card rounded-xl p-4 flex justify-between items-center">
              <span className="text-white/70">{eventLabels[key] ?? key}</span>
              <span className="text-xl font-semibold text-[var(--color-gold-light)]">{count}</span>
            </div>
          ))}

        <div className="glass-card rounded-2xl p-6 mt-8">
          <h2 className="text-white font-display text-lg mb-2">Conversion Funnel</h2>
          <p className="text-3xl font-bold text-[var(--color-gold-light)]">
            {analytics?.conversionRate ?? 0}%
          </p>
          <p className="text-sm text-white/40 mt-1">Session → Order conversion rate</p>
        </div>
      </motion.div>
    </div>
  )
}
