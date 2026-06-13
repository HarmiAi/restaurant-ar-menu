import { Router } from 'express'
import { z } from 'zod'
import { Category } from '../models/Category.js'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { resolveTenant } from '../middleware/tenant.js'
import { toSlug } from '../utils/slug.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

router.get('/public/:slug', resolveTenant, async (req, res, next) => {
  try {
    const categories = await Category.find({
      restaurantId: req.restaurantId,
      isActive: true,
    }).sort({ sortOrder: 1 })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

router.get('/:restaurantId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const categories = await Category.find({ restaurantId: req.restaurantId }).sort({ sortOrder: 1 })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

router.post('/:restaurantId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body)
    const category = await Category.create({
      ...data,
      slug: toSlug(data.name),
      restaurantId: req.restaurantId,
    })
    res.status(201).json(category)
  } catch (err) {
    next(err)
  }
})

router.patch('/:restaurantId/:categoryId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body)
    if (data.name) (data as { slug?: string }).slug = toSlug(data.name)
    const category = await Category.findOneAndUpdate(
      { _id: req.params.categoryId, restaurantId: req.restaurantId },
      data,
      { new: true },
    )
    if (!category) throw new AppError(404, 'Category not found')
    res.json(category)
  } catch (err) {
    next(err)
  }
})

router.delete('/:restaurantId/:categoryId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.categoryId,
      restaurantId: req.restaurantId,
    })
    if (!category) throw new AppError(404, 'Category not found')
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

export default router
