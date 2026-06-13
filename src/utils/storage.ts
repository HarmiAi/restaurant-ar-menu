import type { FoodItem, RestaurantConfig } from '../types'
import { defaultConfig, defaultMenu } from '../data/defaultMenu'

const MENU_KEY = 'lumiere_menu'
const CONFIG_KEY = 'lumiere_config'

export function loadMenu(): FoodItem[] {
  try {
    const stored = localStorage.getItem(MENU_KEY)
    if (stored) return JSON.parse(stored) as FoodItem[]
  } catch {
    /* use defaults */
  }
  return defaultMenu
}

export function saveMenu(menu: FoodItem[]): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu))
}

export function loadConfig(): RestaurantConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (stored) return JSON.parse(stored) as RestaurantConfig
  } catch {
    /* use defaults */
  }
  return defaultConfig
}

export function saveConfig(config: RestaurantConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function resetToDefaults(): void {
  localStorage.removeItem(MENU_KEY)
  localStorage.removeItem(CONFIG_KEY)
}
