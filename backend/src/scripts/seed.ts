import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import { User } from '../models/User.js'
import { Restaurant } from '../models/Restaurant.js'
import { Category } from '../models/Category.js'
import { Dish } from '../models/Dish.js'

const CATEGORIES = [
  { name: 'Pizza', slug: 'pizza', sortOrder: 0 },
  { name: 'Burgers', slug: 'burger', sortOrder: 1 },
  { name: 'Pasta', slug: 'pasta', sortOrder: 2 },
  { name: 'Sandwiches', slug: 'sandwich', sortOrder: 3 },
  { name: 'Biryani', slug: 'biryani', sortOrder: 4 },
  { name: 'Desserts', slug: 'dessert', sortOrder: 5 },
  { name: 'Drinks', slug: 'drinks', sortOrder: 6 },
]

const DEMO_DISHES = [
  { name: 'Truffle Margherita', category: 'pizza', price: 649, modelType: 'pizza', featured: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    description: 'San Marzano tomatoes, buffalo mozzarella, black truffle oil, fresh basil.' },
  { name: 'Wagyu Signature', category: 'burger', price: 899, modelType: 'burger', featured: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    description: 'A5 wagyu patty, brioche bun, aged cheddar, truffle aioli.' },
  { name: 'Lobster Linguine', category: 'pasta', price: 1299, modelType: 'pasta', featured: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
    description: 'Fresh Maine lobster, saffron cream, cherry tomatoes.' },
]

async function seed() {
  await connectDB()

  await Promise.all([User.deleteMany({}), Restaurant.deleteMany({}), Category.deleteMany({}), Dish.deleteMany({})])

  const passwordHash = await bcrypt.hash('demo12345', 12)
  const user = await User.create({
    email: 'demo@lumiere.app',
    passwordHash,
    name: 'Demo Owner',
    role: 'owner',
    restaurantIds: [],
  })

  const restaurant = await Restaurant.create({
    name: 'Lumière',
    slug: 'lumiere',
    tagline: 'Where Culinary Art Meets Reality',
    whatsappNumber: '919876543210',
    currency: '₹',
    ownerId: user._id,
  })

  user.restaurantIds.push(restaurant._id)
  await user.save()

  const cats = await Category.insertMany(
    CATEGORIES.map((c) => ({ ...c, restaurantId: restaurant._id })),
  )

  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c._id]))

  await Dish.insertMany(
    DEMO_DISHES.map((d) => ({
      restaurantId: restaurant._id,
      categoryId: catMap[d.category],
      name: d.name,
      description: d.description,
      price: d.price,
      imageUrl: d.image,
      modelType: d.modelType,
      featured: d.featured,
    })),
  )

  console.log('Seed complete!')
  console.log('Login: demo@lumiere.app / demo12345')
  console.log('Menu: /r/lumiere')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
