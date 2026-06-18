import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save, RotateCcw, FolderPlus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type FoodCategory,
  type FoodItem,
} from '../types'

interface FormState {
  name: string
  description: string
  price: number
  categoryId: string
  category: FoodCategory
  image: string
  modelType: FoodCategory | 'custom'
  modelUrl: string
  calories: number
  prepTime: string
  featured: boolean
  width: number
  height: number
  depth: number
  unit: string
}

const emptyItem = (): FormState => ({
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  category: 'pizza',
  image: '',
  modelType: 'pizza',
  modelUrl: '',
  calories: 0,
  prepTime: '',
  featured: false,
  width: 0,
  height: 0,
  depth: 0,
  unit: 'cm',
})

export default function AdminPage() {
  const { restaurants } = useAuth()
  const restaurant = restaurants[0]
  
  // Local Zustand fallback
  const menu = useStore((s) => s.menu)
  const config = useStore((s) => s.config)
  const addMenuItem = useStore((s) => s.addMenuItem)
  const updateMenuItem = useStore((s) => s.updateMenuItem)
  const deleteMenuItem = useStore((s) => s.deleteMenuItem)
  const updateConfig = useStore((s) => s.updateConfig)
  const resetData = useStore((s) => s.resetData)

  // Database State
  const [dbDishes, setDbDishes] = useState<any[]>([])
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [isDbMode, setIsDbMode] = useState(false)
  const [dbLoading, setDbLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Category Form
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryMsg, setCategoryMsg] = useState('')

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyItem())
  const [isAdding, setIsAdding] = useState(false)

  // Detect and fetch DB items
  const fetchDbData = async () => {
    if (!restaurant) return
    setDbLoading(true)
    try {
      const [dishesRes, categoriesRes] = await Promise.all([
        api.getDishesAdmin(restaurant._id),
        api.getCategoriesAdmin(restaurant._id)
      ])
      setDbDishes(dishesRes)
      setDbCategories(categoriesRes)
      setIsDbMode(true)
    } catch (err) {
      console.error('Database fetch error, falling back to local store:', err)
      setIsDbMode(false)
    } finally {
      setDbLoading(false)
    }
  }

  useEffect(() => {
    if (restaurant) {
      fetchDbData()
    } else {
      setIsDbMode(false)
    }
  }, [restaurant])

  const startEdit = (item: any) => {
    if (isDbMode) {
      setEditingId(item._id)
      setForm({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId?._id || item.categoryId || '',
        category: (item.categoryId?.slug || 'pizza') as FoodCategory,
        image: item.imageUrl,
        modelType: (item.modelType || 'pizza') as FormState['modelType'],
        modelUrl: item.modelUrl || '',
        calories: item.calories || 0,
        prepTime: item.prepTime || '',
        featured: !!item.featured,
        width: item.width || 0,
        height: item.height || 0,
        depth: item.depth || 0,
        unit: item.unit || 'cm',
      })
    } else {
      const fallbackItem = item as FoodItem
      setEditingId(fallbackItem.id)
      setForm({
        name: fallbackItem.name,
        description: fallbackItem.description,
        price: fallbackItem.price,
        categoryId: '',
        category: fallbackItem.category,
        image: fallbackItem.image,
        modelType: fallbackItem.modelType,
        modelUrl: fallbackItem.modelUrl || '',
        calories: fallbackItem.calories || 0,
        prepTime: fallbackItem.prepTime || '',
        featured: !!fallbackItem.featured,
        width: fallbackItem.width || 0,
        height: fallbackItem.height || 0,
        depth: fallbackItem.depth || 0,
        unit: fallbackItem.unit || 'cm',
      })
    }
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    const base = emptyItem()
    if (isDbMode && dbCategories.length > 0) {
      base.categoryId = dbCategories[0]._id
      base.category = dbCategories[0].slug as FoodCategory
    }
    setForm(base)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return

    try {
      if (isDbMode && restaurant) {
        setDbLoading(true)
        const payload = {
          name: form.name,
          description: form.description,
          price: form.price,
          categoryId: form.categoryId || dbCategories[0]?._id,
          imageUrl: form.image,
          modelType: form.modelType === 'custom' ? 'custom' : form.category,
          modelUrl: form.modelUrl || undefined,
          calories: form.calories || undefined,
          prepTime: form.prepTime || undefined,
          featured: form.featured,
          width: form.width || undefined,
          height: form.height || undefined,
          depth: form.depth || undefined,
          unit: form.unit || undefined,
        }

        if (isAdding) {
          await api.createDishAdmin(restaurant._id, payload)
          setIsAdding(false)
        } else if (editingId) {
          await api.updateDishAdmin(restaurant._id, editingId, payload)
          setEditingId(null)
        }
        await fetchDbData()
      } else {
        // Fallback local storage CRUD
        const localPayload: FoodItem = {
          id: editingId || `${form.category}-${Date.now()}`,
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          image: form.image,
          modelType: form.modelType === 'custom' ? 'pizza' : form.category,
          modelUrl: form.modelUrl || undefined,
          calories: form.calories || undefined,
          prepTime: form.prepTime || undefined,
          featured: form.featured,
          width: form.width || undefined,
          height: form.height || undefined,
          depth: form.depth || undefined,
          unit: form.unit || undefined,
        }

        if (isAdding) {
          addMenuItem(localPayload)
          setIsAdding(false)
        } else if (editingId) {
          updateMenuItem(editingId, localPayload)
          setEditingId(null)
        }
      }
      setForm(emptyItem())
    } catch (err) {
      console.error(err)
      alert('Save failed')
    } finally {
      setDbLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      if (isDbMode && restaurant) {
        setDbLoading(true)
        await api.deleteDishAdmin(restaurant._id, id)
        await fetchDbData()
      } else {
        deleteMenuItem(id)
      }
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    } finally {
      setDbLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !restaurant) return
    try {
      setDbLoading(true)
      setCategoryMsg('')
      await api.createCategoryAdmin(restaurant._id, { name: newCategoryName.trim() })
      setNewCategoryName('')
      setCategoryMsg('Category created successfully!')
      await fetchDbData()
      setTimeout(() => setCategoryMsg(''), 3000)
    } catch (err) {
      console.error(err)
      alert('Category creation failed')
    } finally {
      setDbLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!restaurant) {
      alert('Please log in on the SaaS dashboard to upload images to S3/Cloudinary.')
      return
    }
    setUploading(true)
    try {
      const res = await api.uploadImage(restaurant._id, file)
      setForm((f) => ({ ...f, image: res.url }))
    } catch (err) {
      console.error(err)
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!restaurant) {
      // Offline mode fallback: create a local object URL
      const url = URL.createObjectURL(file)
      setForm((f) => ({ ...f, modelUrl: url }))
      return
    }
    setUploading(true)
    try {
      const res = await api.uploadModel(restaurant._id, file)
      setForm((f) => ({ ...f, modelUrl: res.url }))
    } catch (err) {
      console.error(err)
      alert('Model upload failed')
    } finally {
      setUploading(false)
    }
  }

  const activeDishes = isDbMode ? dbDishes : menu

  return (
    <div className="min-h-screen luxury-bg pb-12">
      <header className="glass-card border-b border-[var(--color-luxury-border)] px-4 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Menu</span>
          </Link>
          <h1 className="font-display text-xl gold-gradient-text">Menu Item Settings</h1>
          {!isDbMode ? (
            <button
              onClick={resetData}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Demo
            </button>
          ) : (
            <span className="text-[10px] uppercase bg-green-500/10 border border-green-500/20 px-2 py-1 rounded text-green-400 font-semibold tracking-wider">
              SaaS Live DB
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Local Settings only in demo mode */}
        {!isDbMode && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-display text-xl text-white mb-4">Demo settings</h2>
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
                  onChange={(e) => updateConfig({ whatsappNumber: e.target.value })}
                  placeholder="919876543210"
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
                />
              </label>
            </div>
          </motion.section>
        )}

        {/* Category Manager (Only inside SaaS DB Mode) */}
        {isDbMode && restaurant && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-display text-xl text-white mb-2 flex items-center gap-2">
              <FolderPlus size={18} className="text-[var(--color-gold)]" />
              Category Management
            </h2>
            <p className="text-xs text-white/40 mb-4">
              Add new categories for your dishes. Existing categories: {dbCategories.map(c => c.name).join(', ') || 'None'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Starter, Main course"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
              />
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-sm text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/20 transition-all font-semibold"
              >
                Create
              </button>
            </div>
            {categoryMsg && <p className="text-green-400 text-xs mt-2">{categoryMsg}</p>}
          </motion.section>
        )}

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
                {isDbMode ? (
                  <select
                    value={form.categoryId}
                    onChange={(e) => {
                      const id = e.target.value
                      const selected = dbCategories.find(c => c._id === id)
                      setForm({
                        ...form,
                        categoryId: id,
                        category: (selected?.slug || 'pizza') as FoodCategory,
                        modelType: (selected?.slug || 'pizza') as FormState['modelType']
                      })
                    }}
                    className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat._id} value={cat._id} className="bg-[#12121a]">
                        {cat.name}
                      </option>
                    ))}
                    {dbCategories.length === 0 && (
                      <option value="" className="bg-[#12121a]">No categories found. Create one first!</option>
                    )}
                  </select>
                ) : (
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value as FoodCategory
                      setForm({ ...form, category: cat, modelType: cat })
                    }}
                    className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#12121a]">
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <div className="block sm:col-span-2 border-t border-white/5 pt-4 my-2">
                <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider block mb-3">
                  Physical Dimensions (AR Scale Guard)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="block">
                    <span className="text-[10px] text-white/30 uppercase">Width</span>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={form.width || ''}
                      onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] text-white/30 uppercase">Height</span>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={form.height || ''}
                      onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] text-white/30 uppercase">Depth</span>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={form.depth || ''}
                      onChange={(e) => setForm({ ...form, depth: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] text-white/30 uppercase">Unit</span>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="cm" className="bg-[#12121a]">cm</option>
                      <option value="in" className="bg-[#12121a]">inches</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="block sm:col-span-2 border-t border-white/5 pt-4">
                <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Image URL & File Upload</span>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white mb-2 focus:outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-white/40 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer"
                />
              </div>

              <div className="block sm:col-span-2 border-t border-white/5 pt-4">
                <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">3D Model (GLB/GLTF)</span>
                <input
                  value={form.modelUrl}
                  onChange={(e) => setForm({ ...form, modelUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white mb-2 focus:outline-none"
                />
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleModelUpload}
                  className="w-full text-xs text-white/40 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-white/10 bg-white/5 text-[var(--color-gold)] focus:ring-0 focus:ring-offset-0"
                />
                Chef&apos;s Recommended Item
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={dbLoading || uploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] text-black font-semibold text-sm disabled:opacity-50"
              >
                <Save size={16} />
                {dbLoading ? 'Saving...' : 'Save'}
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
            <h2 className="font-display text-xl text-white">Menu Items ({activeDishes.length})</h2>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-sm text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/20 transition-all"
            >
              <Plus size={16} />
              Add Dish
            </button>
          </div>

          {dbLoading && activeDishes.length === 0 && (
            <div className="py-12 flex justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] animate-spin" />
            </div>
          )}

          <div className="space-y-3">
            {activeDishes.map((item) => {
              const id = isDbMode ? item._id : item.id
              const name = item.name
              const price = item.price
              const image = isDbMode ? item.imageUrl : item.image
              const categoryName = isDbMode 
                ? (item.categoryId?.name || 'Unassigned') 
                : CATEGORY_LABELS[item.category as FoodCategory] || String(item.category)
              const hasModel = !!item.modelUrl

              return (
                <motion.div
                  key={id}
                  layout
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <img
                    src={image}
                    alt={name}
                    className="h-14 w-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{name}</h3>
                    <p className="text-xs text-white/40">
                      {categoryName} · {isDbMode ? (restaurant?.currency || '₹') : config.currency}{price}
                    </p>
                    {item.width && (
                      <p className="text-[10px] text-[var(--color-gold-light)] mt-0.5">
                        Physical: {item.width} x {item.height || '0'} x {item.depth || '0'} {item.unit}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {hasModel && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)] font-medium">
                        3D AR
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(item)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )
            })}

            {!dbLoading && activeDishes.length === 0 && (
              <p className="text-center text-white/30 py-12 text-sm">No dishes found. Click Add Dish to get started!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
