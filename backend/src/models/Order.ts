import mongoose, { Schema, type Document } from 'mongoose'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'whatsapp' | 'stripe' | 'cash'

export interface IOrderItem {
  dishId: mongoose.Types.ObjectId
  name: string
  price: number
  quantity: number
}

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId
  orderNumber: string
  items: IOrderItem[]
  subtotal: number
  tax: number
  total: number
  tableNumber?: string
  customerName?: string
  customerPhone?: string
  notes?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  stripePaymentIntentId?: string
  whatsappSent: boolean
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    dishId: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    tableNumber: String,
    customerName: String,
    customerPhone: String,
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['whatsapp', 'stripe', 'cash'],
      default: 'whatsapp',
    },
    stripePaymentIntentId: String,
    whatsappSent: { type: Boolean, default: false },
  },
  { timestamps: true },
)

orderSchema.index({ restaurantId: 1, createdAt: -1 })
orderSchema.index({ restaurantId: 1, status: 1 })

export const Order = mongoose.model<IOrder>('Order', orderSchema)
