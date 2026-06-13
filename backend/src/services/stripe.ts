import Stripe from 'stripe'
import { env } from '../config/env.js'

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null

export async function createPaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string>,
): Promise<{ clientSecret: string; id: string } | null> {
  if (!stripe) return null

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase() === '₹' ? 'inr' : 'usd',
    metadata,
    automatic_payment_methods: { enabled: true },
  })

  return { clientSecret: intent.client_secret!, id: intent.id }
}
