import mongoose from 'mongoose'
import { env } from './env.js'

let isConnected = false

export async function connectDB(retries = 5, delayMs = 5000): Promise<void> {
  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => {
    isConnected = true
    console.log('MongoDB connected successfully')
  })

  mongoose.connection.on('disconnected', () => {
    isConnected = false
    console.warn('MongoDB disconnected')
  })

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Connecting to MongoDB Atlas (Attempt ${attempt}/${retries})...`)
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      })

      console.log("Using Mongo URI:", env.MONGODB_URI)
      console.log("Connected Database:", mongoose.connection.name)

      isConnected = true
      return
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err instanceof Error ? err.message : err)
      if (attempt === retries) {
        throw err
      }
      console.log(`Retrying to connect to MongoDB in ${delayMs / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export function getDbStatus(): 'connected' | 'disconnected' {
  return isConnected && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}
