import mongoose, { Schema, type Document } from 'mongoose'

export type AnalyticsEventType =
  | 'qr_scan'
  | 'page_view'
  | 'dish_view'
  | 'ar_start'
  | 'ar_place'
  | 'add_to_cart'
  | 'order_submit'
  | 'payment_complete'
  | 'search'

export interface IAnalyticsEvent extends Document {
  restaurantId: mongoose.Types.ObjectId
  eventType: AnalyticsEventType
  dishId?: mongoose.Types.ObjectId
  sessionId: string
  metadata?: Record<string, unknown>
  userAgent?: string
  referrer?: string
  createdAt: Date
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    eventType: {
      type: String,
      enum: [
        'qr_scan', 'page_view', 'dish_view', 'ar_start', 'ar_place',
        'add_to_cart', 'order_submit', 'payment_complete', 'search',
      ],
      required: true,
    },
    dishId: { type: Schema.Types.ObjectId, ref: 'Dish' },
    sessionId: { type: String, required: true, index: true },
    metadata: Schema.Types.Mixed,
    userAgent: String,
    referrer: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

analyticsEventSchema.index({ restaurantId: 1, eventType: 1, createdAt: -1 })
analyticsEventSchema.index({ restaurantId: 1, dishId: 1, eventType: 1 })
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema)
