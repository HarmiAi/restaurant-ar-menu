import type { CartItem, RestaurantConfig } from '../types'

/** Normalize phone for wa.me — adds India 91 if 10 digits */
export function normalizeWhatsAppNumber(input: string, countryCode = '91'): string {
  const digits = input.replace(/\D/g, '')
  if (!digits || digits === '0000000000' || digits === '0') return ''
  if (digits.length === 10) return `${countryCode}${digits}`
  return digits
}

export function isValidWhatsAppNumber(input: string): boolean {
  const normalized = normalizeWhatsAppNumber(input)
  return normalized.length >= 11 && normalized.length <= 15
}

export function buildWhatsAppOrderUrl(
  cart: CartItem[],
  config: RestaurantConfig,
  tableNumber?: string,
  overridePhone?: string,
): string | null {
  const phone = normalizeWhatsAppNumber(overridePhone ?? config.whatsappNumber)
  if (!phone) return null

  const lines = [
    `🍽️ *${config.name} — New Order*`,
    ...(tableNumber ? [`📍 Table: ${tableNumber}`, ''] : []),
    ...cart.map(
      ({ item, quantity }) =>
        `• ${item.name} x${quantity} — ${config.currency}${item.price * quantity}`,
    ),
    '',
    `*Total: ${config.currency}${cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)}*`,
    '',
    'Ordered via AR Menu',
  ]

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${phone}?text=${text}`
}

export function openWhatsApp(url: string): void {
  // window.open is blocked on many mobile browsers — direct navigation works
  window.location.href = url
}
