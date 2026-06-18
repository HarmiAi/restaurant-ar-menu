import mongoose, { Schema, type Document } from 'mongoose'
 
export type ModelType =
  | 'pizza' | 'burger' | 'pasta' | 'sandwich' | 'biryani' | 'dessert' | 'drinks' | 'custom'
 
export interface IDish extends Document {
  restaurantId: mongoose.Types.ObjectId
  categoryId: mongoose.Types.ObjectId
  name: string
  description: string
  aiDescription?: string
  price: number
  aiSuggestedPrice?: number
  imageUrl: string
  modelType: ModelType
  modelUrl?: string
  modelSize?: number
  calories?: number
  prepTime?: string
  featured: boolean
  isAvailable: boolean
  viewCount: number
  orderCount: number
  arViewCount: number
  tags: string[]
  sortOrder: number
  width?: number
  height?: number
  depth?: number
  unit?: string
  createdAt: Date
  updatedAt: Date
}
 
const dishSchema = new Schema<IDish>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    aiDescription: String,
    price: { type: Number, required: true, min: 0 },
    aiSuggestedPrice: Number,
    imageUrl: { type: String, required: true },
    modelType: {
      type: String,
      enum: ['pizza', 'burger', 'pasta', 'sandwich', 'biryani', 'dessert', 'drinks', 'custom'],
      default: 'pizza',
    },
    modelUrl: String,
    modelSize: Number,
    calories: Number,
    prepTime: String,
    featured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    arViewCount: { type: Number, default: 0 },
    tags: [String],
    sortOrder: { type: Number, default: 0 },
    width: Number,
    height: Number,
    depth: Number,
    unit: { type: String, default: 'cm' },
  },
  { timestamps: true },
)
 
dishSchema.index({ restaurantId: 1, categoryId: 1 })
dishSchema.index({ restaurantId: 1, featured: 1 })
dishSchema.index({ restaurantId: 1, viewCount: -1 })
dishSchema.index({ restaurantId: 1, orderCount: -1 })
 
export const Dish = mongoose.model<IDish>('Dish', dishSchema)
