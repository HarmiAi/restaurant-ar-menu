import mongoose, { Schema, type Document } from 'mongoose'

export interface IBranding {
  logoUrl?: string
  primaryColor: string
  accentColor: string
  theme: 'dark' | 'light' | 'auto'
  fontFamily?: string
}

export interface IRestaurant extends Document {
  name: string
  slug: string
  tagline: string
  description?: string
  whatsappNumber: string
  currency: string
  branding: IBranding
  tableNumbersEnabled: boolean
  paymentEnabled: boolean
  stripeAccountId?: string
  qrCodeUrl?: string
  customDomain?: string
  plan: 'free' | 'pro' | 'enterprise'
  isActive: boolean
  ownerId: mongoose.Types.ObjectId
  settings: {
    aiEnabled: boolean
    analyticsEnabled: boolean
    maxDishes: number
  }
  createdAt: Date
  updatedAt: Date
}

const brandingSchema = new Schema<IBranding>(
  {
    logoUrl: String,
    primaryColor: { type: String, default: '#c9a962' },
    accentColor: { type: String, default: '#e8d5a3' },
    theme: { type: String, enum: ['dark', 'light', 'auto'], default: 'dark' },
    fontFamily: { type: String, default: 'Cormorant Garamond' },
  },
  { _id: false },
)

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, default: '' },
    description: String,
    whatsappNumber: { type: String, default: '0000000000' },
    currency: { type: String, default: '₹' },
    branding: { type: brandingSchema, default: () => ({}) },
    tableNumbersEnabled: { type: Boolean, default: true },
    paymentEnabled: { type: Boolean, default: false },
    stripeAccountId: String,
    qrCodeUrl: String,
    customDomain: String,
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    isActive: { type: Boolean, default: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    settings: {
      aiEnabled: { type: Boolean, default: true },
      analyticsEnabled: { type: Boolean, default: true },
      maxDishes: { type: Number, default: 50 },
    },
  },
  { timestamps: true },
)

restaurantSchema.index({ slug: 1 })
restaurantSchema.index({ ownerId: 1 })
restaurantSchema.index({ customDomain: 1 }, { sparse: true })

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema)
