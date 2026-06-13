import { Router } from 'express'
import { z } from 'zod'
import { Order } from '../models/Order.js'
import { Dish } from '../models/Dish.js'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { resolveTenant } from '../middleware/tenant.js'
import { generateOrderNumber } from '../utils/slug.js'
import { trackEvent } from '../services/analytics.js'
import { createPaymentIntent } from '../services/stripe.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

const orderItemSchema = z.object({
  dishId: z.string(),
  quantity: z.number().min(1),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  tableNumber: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['whatsapp', 'stripe', 'cash']).default('whatsapp'),
  sessionId: z.string().optional(),
})

// Public: create order
router.post('/public/:slug', resolveTenant, async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body)
    const restaurant = (req as typeof req & { restaurant: { currency: string; _id: unknown } }).restaurant

    const dishIds = data.items.map((i) => i.dishId)
    const dishes = await Dish.find({ _id: { $in: dishIds }, restaurantId: req.restaurantId })
    if (dishes.length !== data.items.length) throw new AppError(400, 'Invalid dish in order')

    const items = data.items.map((item) => {
      const dish = dishes.find((d) => d._id.toString() === item.dishId)!
      return { dishId: dish._id, name: dish.name, price: dish.price, quantity: item.quantity }
    })

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const tax = Math.round(subtotal * 0.05)
    const total = subtotal + tax

    const order = await Order.create({
      restaurantId: req.restaurantId,
      orderNumber: generateOrderNumber(),
      items,
      subtotal,
      tax,
      total,
      tableNumber: data.tableNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      whatsappSent: data.paymentMethod === 'whatsapp',
    })

    if (data.sessionId) {
      await trackEvent(req.restaurantId!, 'order_submit', data.sessionId, {
        metadata: { orderId: order._id.toString(), total },
      })
    }

    let payment: { clientSecret: string; id: string } | null = null
    if (data.paymentMethod === 'stripe') {
      payment = await createPaymentIntent(total, restaurant.currency, {
        orderId: order._id.toString(),
        restaurantId: req.restaurantId!,
      })
      if (payment) {
        order.stripePaymentIntentId = payment.id
        await order.save()
      }
    }

    res.status(201).json({ order, payment })
  } catch (err) {
    next(err)
  }
})

// Public: track order status
router.get('/public/:slug/:orderNumber', resolveTenant, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      restaurantId: req.restaurantId,
      orderNumber: req.params.orderNumber,
    }).select('-stripePaymentIntentId')
    if (!order) throw new AppError(404, 'Order not found')
    res.json(order)
  } catch (err) {
    next(err)
  }
})

// Dashboard: list orders
router.get('/:restaurantId', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined
    const filter: Record<string, unknown> = { restaurantId: req.restaurantId }
    if (status) filter.status = status

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100)
    res.json(orders)
  } catch (err) {
    next(err)
  }
})

router.patch('/:restaurantId/:orderId/status', authenticate, requireRestaurantAccess, async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
    }).parse(req.body)

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, restaurantId: req.restaurantId },
      { status },
      { new: true },
    )
    if (!order) throw new AppError(404, 'Order not found')
    res.json(order)
  } catch (err) {
    next(err)
  }
})

export default router
