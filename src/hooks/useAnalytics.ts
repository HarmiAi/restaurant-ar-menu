import { useTenant } from '../context/TenantContext'

export function useAnalytics() {
  const { track, slug } = useTenant()

  return {
    trackDishView: (dishId: string) => track('dish_view', dishId),
    trackARStart: (dishId: string) => track('ar_start', dishId),
    trackARPlace: (dishId: string) => track('ar_place', dishId),
    trackAddToCart: (dishId: string) => track('add_to_cart', dishId),
    trackSearch: (query: string) => track('search', undefined, { query }),
    trackQRScan: () => track('qr_scan'),
    slug,
  }
}
