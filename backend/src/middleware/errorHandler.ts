import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

function isMongoError(err: Error): boolean {
  return (
    err.name === 'MongoServerError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongooseError' ||
    err.message.includes('ECONNREFUSED') ||
    err.message.includes('buffering timed out')
  )
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  if (err instanceof ZodError) {
    const first = err.errors[0]
    const field = first?.path.join('.') ?? 'field'
    res.status(400).json({
      error: `Invalid ${field}: ${first?.message ?? 'validation failed'}`,
      details: err.flatten(),
    })
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors)[0]
    res.status(400).json({ error: first?.message ?? 'Validation failed' })
    return
  }

  // Duplicate key (email or slug already exists)
  if (err.name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
    const key = JSON.stringify((err as { keyPattern?: object }).keyPattern ?? '')
    if (key.includes('email')) {
      res.status(409).json({ error: 'This email is already registered. Please sign in instead.' })
      return
    }
    if (key.includes('slug')) {
      res.status(409).json({ error: 'This restaurant name is already taken. Try a different name.' })
      return
    }
    res.status(409).json({ error: 'This record already exists.' })
    return
  }

  if (isMongoError(err)) {
    console.error('Database error:', err.message)
    res.status(503).json({
      error: 'Database is not available. Please start MongoDB first (run: npm run setup).',
      code: 'DB_UNAVAILABLE',
    })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}
