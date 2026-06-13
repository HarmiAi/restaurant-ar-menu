import mongoose, { Schema, type Document } from 'mongoose'

export interface ICategory extends Document {
  restaurantId: mongoose.Types.ObjectId
  name: string
  slug: string
  icon?: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    icon: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

categorySchema.index({ restaurantId: 1, slug: 1 }, { unique: true })

export const Category = mongoose.model<ICategory>('Category', categorySchema)
