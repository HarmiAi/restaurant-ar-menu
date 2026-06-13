import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Utensils, BarChart3, ShoppingBag, Settings, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/dishes', icon: Utensils, label: 'Menu' },
  { to: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, restaurants, logout } = useAuth()
  const navigate = useNavigate()
  const restaurant = restaurants[0]

  return (
    <div className="min-h-screen luxury-bg flex">
      <aside className="w-64 glass-card border-r border-[var(--color-luxury-border)] hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-display text-xl gold-gradient-text">Lumière CMS</h1>
          <p className="text-xs text-white/30 mt-1 truncate">{restaurant?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold-light)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          {restaurant && (
            <a
              href={`/r/${restaurant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs text-white/40 hover:text-[var(--color-gold)]"
            >
              <ExternalLink size={14} />
              View Live Menu
            </a>
          )}
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 px-4 py-2 text-xs text-white/40 hover:text-red-400 w-full"
          >
            <LogOut size={14} />
            Sign Out ({user?.name})
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
