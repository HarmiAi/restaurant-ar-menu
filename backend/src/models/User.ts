import mongoose, { Schema, type Document, type Types } from 'mongoose'

export type UserRole = 'superadmin' | 'owner' | 'manager' | 'staff'

export interface IUser extends Document {
  email: string
  passwordHash: string
  name: string
  role: UserRole
  restaurantIds: Types.ObjectId[]
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['superadmin', 'owner', 'manager', 'staff'],
      default: 'owner',
    },
    restaurantIds: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
)

userSchema.index({ email: 1 })
userSchema.index({ restaurantIds: 1 })

export const User = mongoose.model<IUser>('User', userSchema)
