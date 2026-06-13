import type { Request, Response, NextFunction } from 'express'
import { Restaurant } from '../models/Restaurant.js'
import { AppError } from './errorHandler.js'

export async function resolveTenant(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug
    if (!slug) {
      next(new AppError(400, 'Restaurant slug required'))
      return
    }
    const restaurant = await Restaurant.findOne({ slug, isActive: true })
    if (!restaurant) {
      next(new AppError(404, 'Restaurant not found'))
      return
    }
    req.restaurantId = restaurant._id.toString()
    ;(req as Request & { restaurant: typeof restaurant }).restaurant = restaurant
    next()
  } catch (err) {
    next(err)
  }
}
