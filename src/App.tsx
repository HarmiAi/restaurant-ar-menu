import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/auth/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const TenantMenuPage = lazy(() => import('./pages/TenantMenuPage'))
const ARPage = lazy(() => import('./pages/ARPage'))
const TenantARPage = lazy(() => import('./pages/TenantARPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'))
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage'))
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'))

export default function App() {
  const isLoading = useStore((s) => s.isLoading)
  const setLoading = useStore((s) => s.setLoading)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [setLoading])

  if (isLoading) return <LoadingScreen />

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Marketing / demo landing */}
        <Route path="/" element={<HomePage />} />

        {/* Multi-tenant public menu */}
        <Route path="/r/:slug" element={<TenantMenuPage />} />
        <Route path="/r/:slug/ar/:id" element={<TenantARPage />} />

        {/* Legacy single-tenant routes */}
        <Route path="/ar/:id" element={<ARPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* SaaS CMS Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="dishes" element={<AdminPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
