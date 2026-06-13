import { Router } from 'express'
import { z } from 'zod'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { resolveTenant } from '../middleware/tenant.js'
import { trackEvent, getDashboardAnalytics } from '../services/analytics.js'

const router = Router()

const trackSchema = z.object({
  eventType: z.enum([
    'qr_scan', 'page_view', 'dish_view', 'ar_start', 'ar_place',
    'add_to_cart', 'order_submit', 'payment_complete', 'search',
  ]),
  sessionId: z.string(),
  dishId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// Public: track events (rate-limited at app level)
router.post('/public/:slug/track', resolveTenant, async (req, res, next) => {
  try {
    const data = trackSchema.parse(req.body)
    await trackEvent(req.restaurantId!, data.eventType, data.sessionId, {
      dishId: data.dishId,
      metadata: data.metadata,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
    })
    res.json({ tracked: true })
  } catch (err) {
    next(err)
  }
})

// Dashboard analytics
router.get('/:restaurantId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const analytics = await getDashboardAnalytics(req.restaurantId!, days)
    res.json(analytics)
  } catch (err) {
    next(err)
  }
})

export default router
