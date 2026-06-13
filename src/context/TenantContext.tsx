import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type RestaurantPublic, type DishPublic, type CategoryPublic } from '../lib/api'
import { getSessionId } from '../lib/session'

interface TenantContextValue {
  slug: string
  restaurant: RestaurantPublic | null
  dishes: DishPublic[]
  categories: CategoryPublic[]
  isLoading: boolean
  error: string | null
  track: (eventType: string, dishId?: string, metadata?: Record<string, unknown>) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantPublic | null>(null)
  const [dishes, setDishes] = useState<DishPublic[]>([])
  const [categories, setCategories] = useState<CategoryPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getRestaurant(slug),
      api.getMenu(slug),
      api.getCategories(slug),
    ])
      .then(([r, d, c]) => {
        setRestaurant(r)
        setDishes(d)
        setCategories(c)
        api.track(slug, { eventType: 'page_view', sessionId: getSessionId() }).catch(() => {})
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [slug])

  const track = (eventType: string, dishId?: string, metadata?: Record<string, unknown>) => {
    api.track(slug, { eventType, sessionId: getSessionId(), dishId, metadata }).catch(() => {})
  }

  return (
    <TenantContext.Provider value={{ slug, restaurant, dishes, categories, isLoading, error, track }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
