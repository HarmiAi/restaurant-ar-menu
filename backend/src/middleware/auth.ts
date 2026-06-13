import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt.js'
import { AppError } from './errorHandler.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      restaurantId?: string
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'Authentication required'))
    return
  }
  try {
    req.user = verifyToken(header.slice(7))
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token'))
  }
}

export function requireRole(...roles: JwtPayload['role'][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'))
      return
    }
    next()
  }
}

export function requireRestaurantAccess(req: Request, _res: Response, next: NextFunction): void {
  const restaurantId = req.params.restaurantId || req.body.restaurantId
  if (!req.user) {
    next(new AppError(401, 'Authentication required'))
    return
  }
  if (req.user.role === 'superadmin') {
    req.restaurantId = restaurantId
    next()
    return
  }
  if (!restaurantId || !req.user.restaurantIds.includes(restaurantId)) {
    next(new AppError(403, 'Access denied to this restaurant'))
    return
  }
  req.restaurantId = restaurantId
  next()
}
