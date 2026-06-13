import { Search, X } from 'lucide-react'
import { useStore } from '../store/useStore'

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
      />
      <input
        type="search"
        placeholder="Search dishes, ingredients..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          onSearch?.(e.target.value)
        }}
        className="w-full rounded-2xl glass-card py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40 transition-all"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
