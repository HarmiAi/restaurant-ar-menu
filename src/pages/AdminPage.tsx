import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { isValidWhatsAppNumber } from '../utils/whatsapp'
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type FoodCategory,
  type FoodItem,
} from '../types'

const emptyItem = (): Omit<FoodItem, 'id'> => ({
  name: '',
  description: '',
  price: 0,
  category: 'pizza',
  image: '',
  modelType: 'pizza',
})

export default function AdminPage() {
  const { restaurants } = useAuth()
  const restaurant = restaurants[0]
  const menu = useStore((s) => s.menu)
  const config = useStore((s) => s.config)
  const addMenuItem = useStore((s) => s.addMenuItem)
  const updateMenuItem = useStore((s) => s.updateMenuItem)
  const deleteMenuItem = useStore((s) => s.deleteMenuItem)
  const updateConfig = useStore((s) => s.updateConfig)
  const resetData = useStore((s) => s.resetData)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyItem())
  const [isAdding, setIsAdding] = useState(false)

  const startEdit = (item: FoodItem) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      modelType: item.modelType,
      modelUrl: item.modelUrl,
      calories: item.calories,
      prepTime: item.prepTime,
      featured: item.featured,
    })
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setForm(emptyItem())
  }

  const handleSave = () => {
    if (!form.name || !form.price) return

    if (isAdding) {
      const id = `${form.category}-${Date.now()}`
      addMenuItem({ ...form, id } as FoodItem)
      setIsAdding(false)
    } else if (editingId) {
      updateMenuItem(editingId, form)
      setEditingId(null)
    }
    setForm(emptyItem())
  }

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm((f) => ({ ...f, modelUrl: url }))
  }

  return (
    <div className="min-h-screen luxury-bg">
      <header className="glass-card border-b border-[var(--color-luxury-border)] px-4 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Menu</span>
          </Link>
          <h1 className="font-display text-xl gold-gradient-text">Admin Panel</h1>
          <button
            onClick={resetData}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Restaurant Config */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="font-display text-xl text-white mb-4">Restaurant Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-white/40 uppercase tracking-wider">Name</span>
              <input
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
              />
            </label>
            <label className="block">
              <span className="text-xs text-white/40 uppercase tracking-wider">WhatsApp Number</span>
              <input
                value={config.whatsappNumber}
                onChange={(e) => {
                  updateConfig({ whatsappNumber: e.target.value })
                  if (restaurant && isValidWhatsAppNumber(e.target.value)) {
                    api.updateRestaurant(restaurant._id, { whatsappNumber: e.target.value }).catch(() => {})
                  }
                }}
                placeholder="919876543210"
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
              />
              <p className="text-xs text-white/30 mt-1">Settings page thi pan save kari shako. Format: 919876543210</p>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-white/40 uppercase tracking-wider">Tagline</span>
              <input
                value={config.tagline}
                onChange={(e) => updateConfig({ tagline: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
              />
            </label>
          </div>
        </motion.section>

        {/* Add / Edit Form */}
        {(isAdding || editingId) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border border-[var(--color-gold)]/20"
          >
            <h2 className="font-display text-xl text-white mb-4">
              {isAdding ? 'Add New Dish' : 'Edit Dish'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40 resize-none"
                />
              </label>
              <label className="block">
                <span className="text-xs text-white/40 uppercase tracking-wider">Price</span>
                <input
                  type="number"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
                />
              </label>
              <label className="block">
                <span className="text-xs text-white/40 uppercase tracking-wider">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const cat = e.target.value as FoodCategory
                    setForm({ ...form, category: cat, modelType: cat })
                  }}
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#12121a]">
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">Image URL</span>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">Upload 3D Model (GLB)</span>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleModelUpload}
                  className="mt-1 w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--color-gold)]/20 file:text-[var(--color-gold-light)] file:text-sm file:cursor-pointer"
                />
                {form.modelUrl && (
                  <p className="mt-1 text-xs text-green-400/70">Custom 3D model loaded</p>
                )}
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] text-black font-semibold text-sm"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => { setIsAdding(false); setEditingId(null) }}
                className="px-6 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.section>
        )}

        {/* Menu List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-white">Menu Items ({menu.length})</h2>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-sm text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/20 transition-all"
            >
              <Plus size={16} />
              Add Dish
            </button>
          </div>

          <div className="space-y-3">
            {menu.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="glass-card rounded-xl p-4 flex items-center gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                  <p className="text-xs text-white/40">
                    {CATEGORY_LABELS[item.category]} · {config.currency}{item.price}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
