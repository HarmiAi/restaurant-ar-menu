import mongoose from 'mongoose'
import { env } from './env.js'

let isConnected = false

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => {
    isConnected = true
    console.log('MongoDB connected')
  })

  mongoose.connection.on('disconnected', () => {
    isConnected = false
    console.warn('MongoDB disconnected')
  })

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
  })
  isConnected = true
}

export function getDbStatus(): 'connected' | 'disconnected' {
  return isConnected && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}
