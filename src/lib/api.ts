const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) localStorage.setItem('lumiere_token', token)
    else localStorage.removeItem('lumiere_token')
  }

  getToken() {
    if (!this.token) this.token = localStorage.getItem('lumiere_token')
    return this.token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    const token = this.getToken()
    if (token) headers.Authorization = `Bearer ${token}`

    let res: Response
    try {
      res = await fetch(`${API_URL}${path}`, { ...options, headers })
    } catch {
      throw new Error(
        'Server connect nathi thatu. Pehla MongoDB ane API start karo: npm run setup, pachi npm run dev:api',
      )
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      if (err.code === 'DB_UNAVAILABLE') {
        throw new Error('Database start nathi. Terminal ma lakhjo: npm run setup')
      }
      throw new Error(err.error ?? 'Request failed')
    }
    return res.json()
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ token: string; user: unknown; restaurants?: unknown[] }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    )
  }

  register(data: { email: string; password: string; name: string; restaurantName: string }) {
    return this.request<{ token: string; user: unknown; restaurant: unknown }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) },
    )
  }

  me() {
    return this.request<{ user: unknown; restaurants: unknown[] }>('/auth/me')
  }

  // Tenant public
  getRestaurant(slug: string) {
    return this.request<RestaurantPublic>(`/restaurants/public/${slug}`)
  }

  getMenu(slug: string) {
    return this.request<DishPublic[]>(`/dishes/public/${slug}`)
  }

  getCategories(slug: string) {
    return this.request<CategoryPublic[]>(`/categories/public/${slug}`)
  }

  // Analytics
  track(slug: string, data: TrackEvent) {
    return this.request(`/analytics/public/${slug}/track`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  getAnalytics(restaurantId: string, days = 30) {
    return this.request<AnalyticsDashboard>(`/analytics/${restaurantId}?days=${days}`)
  }

  // Orders
  createOrder(slug: string, data: CreateOrder) {
    return this.request(`/orders/public/${slug}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  getOrderStatus(slug: string, orderNumber: string) {
    return this.request(`/orders/public/${slug}/${orderNumber}`)
  }

  getOrders(restaurantId: string) {
    return this.request<any[]>(`/orders/${restaurantId}`)
  }

  // Dashboard CRUD - Dishes
  getDishesAdmin(restaurantId: string) {
    return this.request<DishPublic[]>(`/dishes/${restaurantId}`)
  }

  createDishAdmin(restaurantId: string, data: Partial<DishPublic>) {
    return this.request<DishPublic>(`/dishes/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  updateDishAdmin(restaurantId: string, dishId: string, data: Partial<DishPublic>) {
    return this.request<DishPublic>(`/dishes/${restaurantId}/${dishId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  deleteDishAdmin(restaurantId: string, dishId: string) {
    return this.request<{ deleted: boolean }>(`/dishes/${restaurantId}/${dishId}`, {
      method: 'DELETE',
    })
  }

  // Dashboard CRUD - Categories
  getCategoriesAdmin(restaurantId: string) {
    return this.request<CategoryPublic[]>(`/categories/${restaurantId}`)
  }

  createCategoryAdmin(restaurantId: string, data: Partial<CategoryPublic>) {
    return this.request<CategoryPublic>(`/categories/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  updateCategoryAdmin(restaurantId: string, categoryId: string, data: Partial<CategoryPublic>) {
    return this.request<CategoryPublic>(`/categories/${restaurantId}/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  deleteCategoryAdmin(restaurantId: string, categoryId: string) {
    return this.request<{ deleted: boolean }>(`/categories/${restaurantId}/${categoryId}`, {
      method: 'DELETE',
    })
  }

  // AI
  generateDescription(restaurantId: string, dishName: string, ingredients?: string) {
    return this.request<{ description: string }>(`/ai/${restaurantId}/description`, {
      method: 'POST',
      body: JSON.stringify({ dishName, ingredients }),
    })
  }

  // Upload
  async uploadImage(restaurantId: string, file: File) {
    const form = new FormData()
    form.append('image', file)
    const token = this.getToken()
    const res = await fetch(`${API_URL}/uploads/${restaurantId}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error('Upload failed')
    return res.json() as Promise<{ url: string }>
  }

  async uploadModel(restaurantId: string, file: File) {
    const form = new FormData()
    form.append('model', file)
    const token = this.getToken()
    const res = await fetch(`${API_URL}/uploads/${restaurantId}/model`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error('Model upload failed')
    return res.json() as Promise<{ url: string; key: string; size: number }>
  }

  generateQR(restaurantId: string) {
    return this.request<{ menuUrl: string; qrCodeUrl: string }>(
      `/restaurants/${restaurantId}/qr`,
      { method: 'POST' },
    )
  }

  updateRestaurant(restaurantId: string, data: Record<string, unknown>) {
    return this.request(`/restaurants/${restaurantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export interface RestaurantPublic {
  id: string
  name: string
  slug: string
  tagline: string
  whatsappNumber: string
  currency: string
  branding: {
    logoUrl?: string
    primaryColor: string
    accentColor: string
    theme: 'dark' | 'light' | 'auto'
    fontFamily?: string
  }
  tableNumbersEnabled: boolean
  paymentEnabled: boolean
  qrCodeUrl?: string
}

export interface CategoryPublic {
  _id: string
  name: string
  slug: string
  icon?: string
}

export interface DishPublic {
  _id: string
  name: string
  description: string
  price: number
  imageUrl: string
  modelType: string
  modelUrl?: string
  calories?: number
  prepTime?: string
  featured: boolean
  categoryId: { _id: string; name: string; slug: string }
  width?: number
  height?: number
  depth?: number
  unit?: string
}

export interface TrackEvent {
  eventType: string
  sessionId: string
  dishId?: string
  metadata?: Record<string, unknown>
}

export interface CreateOrder {
  items: Array<{ dishId: string; quantity: number }>
  tableNumber?: string
  customerName?: string
  notes?: string
  paymentMethod?: 'whatsapp' | 'stripe' | 'cash'
  sessionId?: string
}

export interface AnalyticsDashboard {
  period: string
  events: Record<string, number>
  topViewed: Array<{ name: string; viewCount: number; imageUrl: string }>
  topOrdered: Array<{ name: string; orderCount: number; imageUrl: string }>
  revenue: number
  paidOrders: number
  qrScans: number
  arInteractions: number
  conversionRate: number
}

export const api = new ApiClient()
