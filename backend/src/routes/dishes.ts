import { Router } from 'express'
import { z } from 'zod'
import { Dish } from '../models/Dish.js'
import { Category } from '../models/Category.js'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { resolveTenant } from '../middleware/tenant.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

const dishSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  categoryId: z.string(),
  imageUrl: z.string().url(),
  modelType: z.enum(['pizza', 'burger', 'pasta', 'sandwich', 'biryani', 'dessert', 'drinks', 'custom']).optional(),
  modelUrl: z.string().optional(),
  calories: z.number().optional(),
  prepTime: z.string().optional(),
  featured: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  unit: z.enum(['cm', 'in']).optional(),
})

// Public menu dishes for tenant
router.get('/public/:slug', resolveTenant, async (req, res, next) => {
  try {
    const dishes = await Dish.find({
      restaurantId: req.restaurantId,
      isAvailable: true,
    })
      .populate('categoryId', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
    res.json(dishes)
  } catch (err) {
    next(err)
  }
})

// Dashboard CRUD
router.get('/:restaurantId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const dishes = await Dish.find({ restaurantId: req.restaurantId })
      .populate('categoryId', 'name slug')
      .sort({ sortOrder: 1 })
    res.json(dishes)
  } catch (err) {
    next(err)
  }
})

router.post('/:restaurantId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const data = dishSchema.parse(req.body)
    const category = await Category.findOne({ _id: data.categoryId, restaurantId: req.restaurantId })
    if (!category) throw new AppError(400, 'Invalid category')

    const dish = await Dish.create({ ...data, restaurantId: req.restaurantId })
    res.status(201).json(dish)
  } catch (err) {
    next(err)
  }
})

router.patch('/:restaurantId/:dishId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const data = dishSchema.partial().parse(req.body)
    const dish = await Dish.findOneAndUpdate(
      { _id: req.params.dishId, restaurantId: req.restaurantId },
      data,
      { new: true },
    )
    if (!dish) throw new AppError(404, 'Dish not found')
    res.json(dish)
  } catch (err) {
    next(err)
  }
})

router.delete('/:restaurantId/:dishId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const dish = await Dish.findOneAndDelete({
      _id: req.params.dishId,
      restaurantId: req.restaurantId,
    })
    if (!dish) throw new AppError(404, 'Dish not found')
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

export default router
