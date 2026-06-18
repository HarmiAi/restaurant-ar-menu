import { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TenantProvider, useTenant } from '../context/TenantContext'
import { useTheme } from '../context/ThemeContext'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import FoodCard from '../components/FoodCard'
import ProductModal from '../components/ProductModal'
import CartBar from '../components/CartBar'
import QRCodeSection from '../components/QRCodeSection'
import LoadingScreen from '../components/LoadingScreen'
import { useStore } from '../store/useStore'
import type { FoodItem } from '../types'

function TenantMenuContent() {
  const { restaurant, dishes, categories, isLoading, error, track } = useTenant()
  const { applyBranding } = useTheme()
  const searchQuery = useStore((s) => s.searchQuery)
  const activeCategory = useStore((s) => s.activeCategory)
  const updateConfig = useStore((s) => s.updateConfig)
  const menu = useStore((s) => s.menu)

  useEffect(() => {
    if (!restaurant) return
    applyBranding(restaurant.branding.primaryColor, restaurant.branding.accentColor)
    updateConfig({
      name: restaurant.name,
      tagline: restaurant.tagline,
      whatsappNumber: restaurant.whatsappNumber,
      currency: restaurant.currency,
    })
  }, [restaurant, applyBranding, updateConfig])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const table = searchParams.get('table')
    if (table) {
      sessionStorage.setItem('restaurant_table_number', table)
    }
  }, [])

  const mappedDishes: FoodItem[] = useMemo(() => {
    if (dishes.length > 0) {
      return dishes.map((d) => ({
        id: d._id,
        name: d.name,
        description: d.description,
        price: d.price,
        category: (typeof d.categoryId === 'object' ? d.categoryId.slug : 'pizza') as FoodItem['category'],
        image: d.imageUrl,
        modelType: d.modelType as FoodItem['modelType'],
        modelUrl: d.modelUrl,
        calories: d.calories,
        prepTime: d.prepTime,
        featured: d.featured,
      }))
    }
    return menu
  }, [dishes, menu])

  const filteredMenu = useMemo(() => {
    return mappedDishes.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [mappedDishes, searchQuery, activeCategory])

  if (isLoading) return <LoadingScreen />
  if (error) {
    return (
      <div className="min-h-screen luxury-bg flex items-center justify-center">
        <p className="text-white/40">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen luxury-bg">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <HeroSection />
        <div className="mb-8 space-y-4">
          <SearchBar onSearch={(q) => track('search', undefined, { query: q })} />
          <CategoryFilter categories={categories.map((c) => c.slug)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredMenu.map((item, index) => (
            <FoodCard key={item.id} item={item} index={index} basePath={`/r/${restaurant!.slug}`} />
          ))}
        </div>
        <div className="mt-16">
          <QRCodeSection menuUrl={restaurant?.qrCodeUrl ? undefined : `${window.location.origin}/r/${restaurant?.slug}`} />
        </div>
      </main>
      <ProductModal basePath={`/r/${restaurant!.slug}`} />
      <CartBar
        tableNumbersEnabled={restaurant?.tableNumbersEnabled}
        whatsappNumber={restaurant?.whatsappNumber}
      />
    </div>
  )
}

export default function TenantMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return null
  return (
    <TenantProvider slug={slug}>
      <TenantMenuContent />
    </TenantProvider>
  )
}
