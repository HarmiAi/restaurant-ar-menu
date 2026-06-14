process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
})

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB, getDbStatus } from './config/db.js'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'


import authRoutes from './routes/auth.js'
import restaurantRoutes from './routes/restaurants.js'
import dishRoutes from './routes/dishes.js'
import categoryRoutes from './routes/categories.js'
import orderRoutes from './routes/orders.js'
import analyticsRoutes from './routes/analytics.js'
import aiRoutes from './routes/ai.js'
import uploadRoutes from './routes/uploads.js'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(compression())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
if (env.FRONTEND_URL) {
  const splitOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim())
  allowedOrigins.push(...splitOrigins)
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || env.NODE_ENV !== 'production') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 })
app.use('/api', limiter)
app.use('/api/analytics/public', trackLimiter)

app.get('/health', (_req, res) => {
  const db = getDbStatus()
  res.status(db === 'connected' ? 200 : 503).json({
    status: db === 'connected' ? 'ok' : 'degraded',
    database: db,
    version: '1.0.0',
  })
})

app.get('/api/status', (_req, res) => {
  const db = getDbStatus()
  res.status(db === 'connected' ? 200 : 503).json({
    status: db === 'connected' ? 'ok' : 'degraded',
    database: db,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: env.NODE_ENV,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/dishes', dishRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/uploads', uploadRoutes)

app.use(errorHandler)

async function start() {
  try {
    await connectDB()
    app.listen(env.PORT, () => {
      console.log(`API running on http://localhost:${env.PORT}`)
      console.log(`Health: http://localhost:${env.PORT}/health`)
    })
  } catch (err) {
    console.error('\n❌ Failed to start — MongoDB is not running!')
    console.error('   Run from project root:  npm run setup')
    console.error('   Then start API:         npm run dev:api\n')
    process.exit(1)
  }
}

start()
