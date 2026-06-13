import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

interface Order {
  _id: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  tableNumber?: string
  status: string
  paymentStatus: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  confirmed: 'text-blue-400',
  preparing: 'text-orange-400',
  ready: 'text-green-400',
  delivered: 'text-green-500',
  cancelled: 'text-red-400',
}

export default function OrdersPage() {
  const { restaurants } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const restaurant = restaurants[0]

  useEffect(() => {
    if (!restaurant) return
    const token = api.getToken()
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'}/orders/${restaurant._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {})
  }, [restaurant])

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl text-white mb-8">Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && (
          <p className="text-white/30 text-center py-12">No orders yet</p>
        )}
        {orders.map((order) => (
          <div key={order._id} className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-white">{order.orderNumber}</p>
                <p className="text-xs text-white/40">
                  {new Date(order.createdAt).toLocaleString()}
                  {order.tableNumber && ` · Table ${order.tableNumber}`}
                </p>
              </div>
              <span className={`text-sm capitalize ${statusColors[order.status] ?? ''}`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-white/50 space-y-1">
              {order.items.map((item, i) => (
                <p key={i}>{item.name} ×{item.quantity} — ₹{item.price * item.quantity}</p>
              ))}
            </div>
            <p className="text-[var(--color-gold-light)] font-semibold mt-3">₹{order.total}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
