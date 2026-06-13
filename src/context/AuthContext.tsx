import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  restaurantIds?: string[]
}

interface Restaurant {
  _id: string
  name: string
  slug: string
}

interface AuthContextValue {
  user: User | null
  restaurants: Restaurant[]
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string; restaurantName: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (api.getToken()) {
      api.me()
        .then((data) => {
          setUser(data.user as User)
          setRestaurants(data.restaurants as Restaurant[])
        })
        .catch(() => api.setToken(null))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password)
    api.setToken(data.token)
    setUser(data.user as User)
    const me = await api.me()
    setRestaurants(me.restaurants as Restaurant[])
  }

  const register = async (data: { email: string; password: string; name: string; restaurantName: string }) => {
    const res = await api.register(data)
    api.setToken(res.token)
    setUser(res.user as User)
    setRestaurants([res.restaurant as Restaurant])
  }

  const logout = () => {
    api.setToken(null)
    setUser(null)
    setRestaurants([])
  }

  return (
    <AuthContext.Provider value={{ user, restaurants, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
