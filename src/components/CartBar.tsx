import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, MessageCircle, Trash2, AlertCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { buildWhatsAppOrderUrl, openWhatsApp, isValidWhatsAppNumber } from '../utils/whatsapp'

interface CartBarProps {
  tableNumbersEnabled?: boolean
  whatsappNumber?: string
}

export default function CartBar({ tableNumbersEnabled, whatsappNumber }: CartBarProps) {
  const cart = useStore((s) => s.cart)
  const config = useStore((s) => s.config)
  const isCartOpen = useStore((s) => s.isCartOpen)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const updateQuantity = useStore((s) => s.updateQuantity)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)

  const [tableNumber, setTableNumber] = useState('')
  const [orderError, setOrderError] = useState('')
  const total = cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)

  const phone = whatsappNumber ?? config.whatsappNumber
  const hasValidPhone = isValidWhatsAppNumber(phone)

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return
    setOrderError('')

    if (!hasValidPhone) {
      setOrderError('WhatsApp number set nathi. Dashboard → Settings ma number add karo (e.g. 919876543210)')
      return
    }

    const url = buildWhatsAppOrderUrl(
      cart,
      config,
      tableNumbersEnabled ? tableNumber : undefined,
      phone,
    )

    if (!url) {
      setOrderError('Invalid WhatsApp number. Format: 919876543210')
      return
    }

    openWhatsApp(url)
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass-card border-l border-[var(--color-luxury-border)] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-display text-2xl text-white">Your Order</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-white/30 py-12">Your cart is empty</p>
              ) : (
                cart.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                      <p className="text-[var(--color-gold-light)] text-sm mt-0.5">
                        {config.currency}{item.price}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          className="p-1 rounded-lg bg-white/5 text-white/50 hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm text-white/70 w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          className="p-1 rounded-lg bg-white/5 text-white/50 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto p-1 text-red-400/60 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-white/5 space-y-4">
                {!hasValidPhone && (
                  <div className="flex gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/80">
                      WhatsApp number add karo: Dashboard → Settings (format: 919876543210)
                    </p>
                  </div>
                )}

                {tableNumbersEnabled && (
                  <label className="block">
                    <span className="text-xs text-white/40">Table Number</span>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. 12"
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
                    />
                  </label>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-white/50">Total</span>
                  <span className="text-xl font-semibold text-[var(--color-gold-light)]">
                    {config.currency}{total}
                  </span>
                </div>

                {orderError && (
                  <p className="text-red-400 text-xs text-center">{orderError}</p>
                )}

                <button
                  onClick={handleWhatsAppOrder}
                  disabled={!hasValidPhone}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MessageCircle size={18} />
                  Order via WhatsApp
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-white/30 hover:text-white/50 transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
