import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
})

console.log("ENV FILE MONGODB:", process.env.MONGODB_URI)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(16).default('dev-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
})

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env)
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error('❌ Environment validation failed:')
    err.errors.forEach((e) => {
      console.error(`   - ${e.path.join('.')}: ${e.message}`)
    })
  } else {
    console.error('❌ Environment validation error:', err)
  }
  process.exit(1)
}

export const env = parsedEnv

