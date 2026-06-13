import OpenAI from 'openai'
import { env } from '../config/env.js'

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null

export async function generateDescription(
  dishName: string,
  ingredients?: string,
  tone = 'luxury fine dining',
): Promise<string> {
  if (!openai) {
    return `Indulge in our exquisite ${dishName}, crafted with premium ingredients and presented with culinary artistry.`
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You write ${tone} restaurant menu descriptions. Keep under 160 characters. No quotes.`,
      },
      {
        role: 'user',
        content: `Dish: ${dishName}${ingredients ? `\nIngredients: ${ingredients}` : ''}`,
      },
    ],
    max_tokens: 80,
  })

  return res.choices[0]?.message?.content?.trim() ?? ''
}

export async function suggestCategory(
  dishName: string,
  description: string,
  categories: string[],
): Promise<string> {
  if (!openai || categories.length === 0) return categories[0] ?? 'Main'

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Pick exactly one category from: ${categories.join(', ')}. Reply with only the category name.`,
      },
      { role: 'user', content: `${dishName}: ${description}` },
    ],
    max_tokens: 20,
  })

  const pick = res.choices[0]?.message?.content?.trim() ?? categories[0]
  return categories.find((c) => c.toLowerCase() === pick.toLowerCase()) ?? categories[0]
}

export async function suggestPrice(
  dishName: string,
  category: string,
  currency: string,
  market = 'India premium dining',
): Promise<number> {
  if (!openai) return 499

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Suggest a price in ${currency} for ${market}. Reply with only a number, no symbols.`,
      },
      { role: 'user', content: `${category}: ${dishName}` },
    ],
    max_tokens: 10,
  })

  const num = parseFloat(res.choices[0]?.message?.content?.replace(/[^\d.]/g, '') ?? '499')
  return isNaN(num) ? 499 : Math.round(num)
}

export async function getUpsellRecommendations(
  cartDishNames: string[],
  menuDishes: Array<{ name: string; category: string; price: number }>,
): Promise<Array<{ name: string; reason: string }>> {
  if (!openai || menuDishes.length === 0) {
    return menuDishes.slice(0, 2).map((d) => ({
      name: d.name,
      reason: 'Pairs perfectly with your selection',
    }))
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Suggest 2 upsell dishes as JSON array: [{"name":"...","reason":"..."}]. Only dishes from the menu.',
      },
      {
        role: 'user',
        content: `Cart: ${cartDishNames.join(', ')}\nMenu: ${menuDishes.map((d) => d.name).join(', ')}`,
      },
    ],
    max_tokens: 150,
    response_format: { type: 'json_object' },
  })

  try {
    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}')
    return parsed.recommendations ?? parsed.items ?? []
  } catch {
    return []
  }
}
