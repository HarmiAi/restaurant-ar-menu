import { create } from 'zustand'
import type { CartItem, FoodCategory, FoodItem, RestaurantConfig } from '../types'
import { loadConfig, loadMenu, saveConfig, saveMenu } from '../utils/storage'

interface AppState {
  menu: FoodItem[]
  config: RestaurantConfig
  cart: CartItem[]
  searchQuery: string
  activeCategory: FoodCategory | 'all'
  selectedItem: FoodItem | null
  isLoading: boolean
  isCartOpen: boolean

  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: FoodCategory | 'all') => void
  setSelectedItem: (item: FoodItem | null) => void
  setCartOpen: (open: boolean) => void

  addToCart: (item: FoodItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void

  addMenuItem: (item: FoodItem) => void
  updateMenuItem: (id: string, updates: Partial<FoodItem>) => void
  deleteMenuItem: (id: string) => void
  updateConfig: (updates: Partial<RestaurantConfig>) => void
  resetData: () => void
}

export const useStore = create<AppState>((set, get) => ({
  menu: loadMenu(),
  config: loadConfig(),
  cart: [],
  searchQuery: '',
  activeCategory: 'all',
  selectedItem: null,
  isLoading: true,
  isCartOpen: false,

  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setCartOpen: (open) => set({ isCartOpen: open }),

  addToCart: (item) => {
    const cart = get().cart
    const existing = cart.find((c) => c.item.id === item.id)
    if (existing) {
      set({
        cart: cart.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      })
    } else {
      set({ cart: [...cart, { item, quantity: 1 }] })
    }
  },

  removeFromCart: (id) => {
    set({ cart: get().cart.filter((c) => c.item.id !== id) })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id)
      return
    }
    set({
      cart: get().cart.map((c) =>
        c.item.id === id ? { ...c, quantity } : c,
      ),
    })
  },

  clearCart: () => set({ cart: [] }),

  addMenuItem: (item) => {
    const menu = [...get().menu, item]
    saveMenu(menu)
    set({ menu })
  },

  updateMenuItem: (id, updates) => {
    const menu = get().menu.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    )
    saveMenu(menu)
    set({ menu })
  },

  deleteMenuItem: (id) => {
    const menu = get().menu.filter((item) => item.id !== id)
    saveMenu(menu)
    set({ menu })
  },

  updateConfig: (updates) => {
    const config = { ...get().config, ...updates }
    saveConfig(config)
    set({ config })
  },

  resetData: () => {
    localStorage.removeItem('lumiere_menu')
    localStorage.removeItem('lumiere_config')
    set({ menu: loadMenu(), config: loadConfig() })
  },
}))
