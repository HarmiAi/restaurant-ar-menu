import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models/User.js'
import { Restaurant } from '../models/Restaurant.js'
import { signToken } from '../utils/jwt.js'
import { toSlug } from '../utils/slug.js'
import { seedDefaultCategories } from '../utils/seedRestaurant.js'
import { authenticate } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  restaurantName: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', async (req, res, next) => {
  let createdUserId: string | null = null
  try {
    const data = registerSchema.parse(req.body)
    const existing = await User.findOne({ email: data.email })
    if (existing) throw new AppError(409, 'This email is already registered. Please sign in.')

    const passwordHash = await bcrypt.hash(data.password, 12)
    const slug = toSlug(data.restaurantName)

    if (!slug || slug.length < 2) {
      throw new AppError(400, 'Please enter a valid restaurant name (at least 2 characters).')
    }

    const slugExists = await Restaurant.findOne({ slug })
    if (slugExists) throw new AppError(409, 'This restaurant name is already taken. Try another name.')

    const user = await User.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: 'owner',
      restaurantIds: [],
    })
    createdUserId = user._id.toString()

    const restaurant = await Restaurant.create({
      name: data.restaurantName,
      slug,
      tagline: 'Where Culinary Art Meets Reality',
      whatsappNumber: '0000000000',
      currency: '₹',
      ownerId: user._id,
    })

    user.restaurantIds.push(restaurant._id)
    await user.save()
    await seedDefaultCategories(restaurant._id)

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      restaurantIds: [restaurant._id.toString()],
    })

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      restaurant: { id: restaurant._id, slug: restaurant.slug, name: restaurant.name },
    })
  } catch (err) {
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {})
    }
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await User.findOne({ email: data.email, isActive: true })
    if (!user) throw new AppError(401, 'Invalid credentials')

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'Invalid credentials')

    user.lastLoginAt = new Date()
    await user.save()

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      restaurantIds: user.restaurantIds.map((id) => id.toString()),
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantIds: user.restaurantIds,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.userId).select('-passwordHash')
    if (!user) throw new AppError(404, 'User not found')
    const restaurants = await Restaurant.find({ _id: { $in: user.restaurantIds } })
    res.json({ user, restaurants })
  } catch (err) {
    next(err)
  }
})

export default router
