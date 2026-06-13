import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const configured =
  env.AWS_REGION && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET

const s3 = configured
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null

export async function uploadModel(
  buffer: Buffer,
  key: string,
  contentType = 'model/gltf-binary',
): Promise<string> {
  if (!s3 || !env.AWS_S3_BUCKET) {
    return `data:model/gltf-binary;base64,${buffer.toString('base64')}`
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
}

export async function getModelSignedUrl(key: string): Promise<string> {
  if (!s3 || !env.AWS_S3_BUCKET) return key
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
    { expiresIn: 3600 },
  )
}
