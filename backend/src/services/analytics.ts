import mongoose from 'mongoose'
import { AnalyticsEvent, type AnalyticsEventType } from '../models/AnalyticsEvent.js'
import { Dish } from '../models/Dish.js'
import { Order } from '../models/Order.js'

export async function trackEvent(
  restaurantId: string,
  eventType: AnalyticsEventType,
  sessionId: string,
  opts?: { dishId?: string; metadata?: Record<string, unknown>; userAgent?: string; referrer?: string },
): Promise<void> {
  await AnalyticsEvent.create({
    restaurantId,
    eventType,
    sessionId,
    dishId: opts?.dishId,
    metadata: opts?.metadata,
    userAgent: opts?.userAgent,
    referrer: opts?.referrer,
  })

  if (opts?.dishId) {
    const inc: Record<string, number> = {}
    if (eventType === 'dish_view') inc.viewCount = 1
    if (eventType === 'ar_start' || eventType === 'ar_place') inc.arViewCount = 1
    if (eventType === 'order_submit') inc.orderCount = 1
    if (Object.keys(inc).length > 0) {
      await Dish.findByIdAndUpdate(opts.dishId, { $inc: inc })
    }
  }
}

export async function getDashboardAnalytics(restaurantId: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [
    eventCounts,
    topViewed,
    topOrdered,
    revenue,
    qrScans,
    arInteractions,
    conversions,
  ] = await Promise.all([
    AnalyticsEvent.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), createdAt: { $gte: since } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]),
    Dish.find({ restaurantId }).sort({ viewCount: -1 }).limit(5).select('name viewCount imageUrl'),
    Dish.find({ restaurantId }).sort({ orderCount: -1 }).limit(5).select('name orderCount imageUrl'),
    Order.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), paymentStatus: 'paid', createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.countDocuments({ restaurantId, eventType: 'qr_scan', createdAt: { $gte: since } }),
    AnalyticsEvent.countDocuments({
      restaurantId,
      eventType: { $in: ['ar_start', 'ar_place'] },
      createdAt: { $gte: since },
    }),
    AnalyticsEvent.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$sessionId',
          viewed: { $max: { $cond: [{ $eq: ['$eventType', 'dish_view'] }, 1, 0] } },
          ordered: { $max: { $cond: [{ $eq: ['$eventType', 'order_submit'] }, 1, 0] } },
        },
      },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          conversions: { $sum: '$ordered' },
        },
      },
    ]),
  ])

  const conv = conversions[0]
  return {
    period: `${days}d`,
    events: Object.fromEntries(eventCounts.map((e) => [e._id, e.count])),
    topViewed,
    topOrdered,
    revenue: revenue[0]?.total ?? 0,
    paidOrders: revenue[0]?.count ?? 0,
    qrScans,
    arInteractions,
    conversionRate: conv ? Math.round((conv.conversions / conv.sessions) * 100) : 0,
  }
}
