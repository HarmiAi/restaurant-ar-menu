import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, QrCode, Box, TrendingUp, DollarSign } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api, type AnalyticsDashboard } from '../../lib/api'
import OnboardingBanner from './OnboardingBanner'

export default function OverviewPage() {
  const { restaurants } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null)
  const restaurant = restaurants[0]

  useEffect(() => {
    if (restaurant) {
      api.getAnalytics(restaurant._id).then(setAnalytics).catch(() => {})
    }
  }, [restaurant])

  const stats = [
    { label: 'QR Scans', value: analytics?.qrScans ?? 0, icon: QrCode },
    { label: 'AR Views', value: analytics?.arInteractions ?? 0, icon: Box },
    { label: 'Conversion', value: `${analytics?.conversionRate ?? 0}%`, icon: TrendingUp },
    { label: 'Revenue', value: `₹${analytics?.revenue ?? 0}`, icon: DollarSign },
  ]

  return (
    <div className="max-w-6xl">
      <OnboardingBanner />
      <div className="p-6 lg:p-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm mb-8">{restaurant?.name} — Last 30 days</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-5">
              <Icon size={20} className="text-[var(--color-gold)] mb-3" />
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
              <Eye size={18} className="text-[var(--color-gold)]" />
              Most Viewed
            </h2>
            <div className="space-y-3">
              {(analytics?.topViewed ?? []).map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <img src={d.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{d.name}</p>
                    <p className="text-xs text-white/40">{d.viewCount} views</p>
                  </div>
                </div>
              ))}
              {!analytics?.topViewed?.length && (
                <p className="text-white/30 text-sm">No data yet</p>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-lg text-white mb-4">Most Ordered</h2>
            <div className="space-y-3">
              {(analytics?.topOrdered ?? []).map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <img src={d.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{d.name}</p>
                    <p className="text-xs text-white/40">{d.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
