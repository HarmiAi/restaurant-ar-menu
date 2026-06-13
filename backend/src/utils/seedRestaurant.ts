import { Category } from '../models/Category.js'
import type { Types } from 'mongoose'

const DEFAULT_CATEGORIES = [
  { name: 'Pizza', slug: 'pizza', sortOrder: 0 },
  { name: 'Burgers', slug: 'burger', sortOrder: 1 },
  { name: 'Pasta', slug: 'pasta', sortOrder: 2 },
  { name: 'Sandwiches', slug: 'sandwich', sortOrder: 3 },
  { name: 'Biryani', slug: 'biryani', sortOrder: 4 },
  { name: 'Desserts', slug: 'dessert', sortOrder: 5 },
  { name: 'Drinks', slug: 'drinks', sortOrder: 6 },
]

export async function seedDefaultCategories(restaurantId: Types.ObjectId): Promise<void> {
  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, restaurantId, isActive: true })),
  )
}
