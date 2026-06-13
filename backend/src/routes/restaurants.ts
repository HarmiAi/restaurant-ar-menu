import { Router } from 'express'
import QRCode from 'qrcode'
import { z } from 'zod'
import { Restaurant } from '../models/Restaurant.js'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { resolveTenant } from '../middleware/tenant.js'
import { env } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

const brandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  fontFamily: z.string().optional(),
})

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  whatsappNumber: z.string().optional(),
  currency: z.string().optional(),
  branding: brandingSchema.optional(),
  tableNumbersEnabled: z.boolean().optional(),
  paymentEnabled: z.boolean().optional(),
})

// Public: get restaurant by slug (tenant menu)
router.get('/public/:slug', resolveTenant, async (req, res) => {
  const restaurant = (req as typeof req & { restaurant: InstanceType<typeof Restaurant> }).restaurant
  res.json({
    id: restaurant._id,
    name: restaurant.name,
    slug: restaurant.slug,
    tagline: restaurant.tagline,
    description: restaurant.description,
    whatsappNumber: restaurant.whatsappNumber,
    currency: restaurant.currency,
    branding: restaurant.branding,
    tableNumbersEnabled: restaurant.tableNumbersEnabled,
    paymentEnabled: restaurant.paymentEnabled,
    qrCodeUrl: restaurant.qrCodeUrl,
  })
})

// Dashboard: update restaurant
router.patch(
  '/:restaurantId',
  authenticate,
  requireRestaurantAccess,
  async (req, res, next) => {
    try {
      const data = updateSchema.parse(req.body)
      const restaurant = await Restaurant.findByIdAndUpdate(req.restaurantId, data, { new: true })
      if (!restaurant) throw new AppError(404, 'Restaurant not found')
      res.json(restaurant)
    } catch (err) {
      next(err)
    }
  },
)

// Generate QR code for restaurant menu
router.post(
  '/:restaurantId/qr',
  authenticate,
  requireRestaurantAccess,
  async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findById(req.restaurantId)
      if (!restaurant) throw new AppError(404, 'Restaurant not found')

      const menuUrl = `${env.FRONTEND_URL}/r/${restaurant.slug}`
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: { dark: '#0a0a0f', light: '#ffffff' },
      })

      restaurant.qrCodeUrl = qrDataUrl
      await restaurant.save()

      res.json({ menuUrl, qrCodeUrl: qrDataUrl })
    } catch (err) {
      next(err)
    }
  },
)

export default router
