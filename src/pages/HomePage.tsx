import { useMemo } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import WelcomeGuide from '../components/WelcomeGuide'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import FoodCard from '../components/FoodCard'
import ProductModal from '../components/ProductModal'
import CartBar from '../components/CartBar'
import QRCodeSection from '../components/QRCodeSection'
import { useStore } from '../store/useStore'

export default function HomePage() {
  const menu = useStore((s) => s.menu)
  const config = useStore((s) => s.config)
  const searchQuery = useStore((s) => s.searchQuery)
  const activeCategory = useStore((s) => s.activeCategory)

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [menu, searchQuery, activeCategory])

  return (
    <div className="min-h-screen luxury-bg">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <HeroSection />
        <WelcomeGuide />

        <div className="mb-8 space-y-4">
          <SearchBar />
          <CategoryFilter />
        </div>

        {filteredMenu.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No dishes found</p>
            <p className="text-white/20 text-sm mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredMenu.map((item, index) => (
              <FoodCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

        <div className="mt-16">
          <QRCodeSection />
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="font-display text-lg text-white/30">
            Lumière Restaurant
          </p>
          <p className="text-xs text-white/15 mt-2 tracking-wider">
            © {new Date().getFullYear()} — Crafted with precision
          </p>
        </footer>
      </main>

      <ProductModal />
      <CartBar whatsappNumber={config.whatsappNumber} />
    </div>
  )
}
