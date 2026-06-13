import { Router } from 'express'
import { z } from 'zod'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { Category } from '../models/Category.js'
import { Dish } from '../models/Dish.js'
import { Restaurant } from '../models/Restaurant.js'
import {
  generateDescription,
  suggestCategory,
  suggestPrice,
  getUpsellRecommendations,
} from '../services/ai.js'
import { enhanceImage } from '../services/cloudinary.js'

const router = Router()

router.post('/:restaurantId/description', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const { dishName, ingredients } = z.object({
      dishName: z.string(),
      ingredients: z.string().optional(),
    }).parse(req.body)
    const description = await generateDescription(dishName, ingredients)
    res.json({ description })
  } catch (err) {
    next(err)
  }
})

router.post('/:restaurantId/categorize', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const { dishName, description } = z.object({
      dishName: z.string(),
      description: z.string(),
    }).parse(req.body)
    const categories = await Category.find({ restaurantId: req.restaurantId, isActive: true })
    const names = categories.map((c) => c.name)
    const suggested = await suggestCategory(dishName, description, names)
    const match = categories.find((c) => c.name === suggested)
    res.json({ category: suggested, categoryId: match?._id })
  } catch (err) {
    next(err)
  }
})

router.post('/:restaurantId/price', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const { dishName, category } = z.object({
      dishName: z.string(),
      category: z.string(),
    }).parse(req.body)
    const restaurant = await Restaurant.findById(req.restaurantId)
    const price = await suggestPrice(dishName, category, restaurant?.currency ?? '₹')
    res.json({ suggestedPrice: price })
  } catch (err) {
    next(err)
  }
})

router.post('/:restaurantId/enhance-image', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const { imageUrl } = z.object({ imageUrl: z.string().url() }).parse(req.body)
    const enhancedUrl = await enhanceImage(imageUrl)
    res.json({ enhancedUrl })
  } catch (err) {
    next(err)
  }
})

router.post('/:restaurantId/upsell', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const { cartDishIds } = z.object({ cartDishIds: z.array(z.string()) }).parse(req.body)
    const cartDishes = await Dish.find({ _id: { $in: cartDishIds } })
    const allDishes = await Dish.find({ restaurantId: req.restaurantId, isAvailable: true })
    const recommendations = await getUpsellRecommendations(
      cartDishes.map((d) => d.name),
      allDishes.map((d) => ({
        name: d.name,
        category: d.modelType,
        price: d.price,
      })),
    )
    res.json({ recommendations })
  } catch (err) {
    next(err)
  }
})

export default router
