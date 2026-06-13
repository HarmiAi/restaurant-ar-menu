import { Router } from 'express'
import multer from 'multer'
import { authenticate, requireRestaurantAccess } from '../middleware/auth.js'
import { uploadImage } from '../services/cloudinary.js'
import { uploadModel } from '../services/s3.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

router.post(
  '/:restaurantId/image',
  authenticate,
  requireRestaurantAccess,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError(400, 'No image file provided')
      const result = await uploadImage(
        req.file.buffer,
        req.restaurantId!,
        `${Date.now()}-${req.file.originalname}`,
      )
      res.json({ url: result.url, publicId: result.publicId })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/:restaurantId/model',
  authenticate,
  requireRestaurantAccess,
  upload.single('model'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError(400, 'No model file provided')
      const ext = req.file.originalname.endsWith('.gltf') ? 'gltf' : 'glb'
      const key = `models/${req.restaurantId}/${Date.now()}.${ext}`
      const url = await uploadModel(req.file.buffer, key, req.file.mimetype)
      res.json({ url, key, size: req.file.size })
    } catch (err) {
      next(err)
    }
  },
)

export default router
