import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'

const configured =
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET

if (configured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

export async function uploadImage(
  buffer: Buffer,
  folder: string,
  filename: string,
): Promise<{ url: string; publicId: string }> {
  if (!configured) {
    const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`
    return { url: base64, publicId: filename }
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `lumiere/${folder}`, public_id: filename, resource_type: 'image' },
      (err, result) => {
        if (err || !result) reject(err ?? new Error('Upload failed'))
        else resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    stream.end(buffer)
  })
}

export async function enhanceImage(url: string): Promise<string> {
  if (!configured) return url
  return cloudinary.url(url, {
    effect: 'improve:indoor',
    quality: 'auto:best',
    fetch_format: 'auto',
  })
}
