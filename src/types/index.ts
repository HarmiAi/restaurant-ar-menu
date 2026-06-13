export type FoodCategory =
  | 'pizza'
  | 'burger'
  | 'pasta'
  | 'sandwich'
  | 'biryani'
  | 'dessert'
  | 'drinks'

export type ModelType = FoodCategory

export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  category: FoodCategory
  image: string
  modelType: ModelType
  modelUrl?: string
  calories?: number
  prepTime?: string
  featured?: boolean
}

export interface CartItem {
  item: FoodItem
  quantity: number
}

export interface RestaurantConfig {
  name: string
  tagline: string
  whatsappNumber: string
  currency: string
}

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  pizza: 'Pizza',
  burger: 'Burgers',
  pasta: 'Pasta',
  sandwich: 'Sandwiches',
  biryani: 'Biryani',
  dessert: 'Desserts',
  drinks: 'Drinks',
}

export const ALL_CATEGORIES: FoodCategory[] = [
  'pizza',
  'burger',
  'pasta',
  'sandwich',
  'biryani',
  'dessert',
  'drinks',
]
