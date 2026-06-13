import { useState, useEffect } from 'react'
import { QrCode, Sparkles, Save, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { useTheme } from '../../context/ThemeContext'
import { isValidWhatsAppNumber } from '../../utils/whatsapp'

export default function SettingsPage() {
  const { restaurants } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const restaurant = restaurants[0]

  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [tagline, setTagline] = useState('')
  const [currency, setCurrency] = useState('₹')
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const [qrCode, setQrCode] = useState<string | null>(null)
  const [menuUrl, setMenuUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!restaurant) return
    api.getRestaurant(restaurant.slug).then((r) => {
      setWhatsappNumber(r.whatsappNumber === '0000000000' ? '' : r.whatsappNumber)
      setTagline(r.tagline)
      setCurrency(r.currency)
    }).catch(() => {})
  }, [restaurant])

  const handleSaveSettings = async () => {
    if (!restaurant) return
    setSaving(true)
    setSaveMsg('')
    setSaveError('')

    if (whatsappNumber && !isValidWhatsAppNumber(whatsappNumber)) {
      setSaveError('Valid number lakho: 919876543210 (country code sathe)')
      setSaving(false)
      return
    }

    try {
      await api.updateRestaurant(restaurant._id, {
        whatsappNumber: whatsappNumber || '0000000000',
        tagline,
        currency,
      })
      setSaveMsg('Settings saved! Hava customers WhatsApp order mokli shakse.')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const generateQR = async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const res = await api.generateQR(restaurant._id)
      setQrCode(res.qrCodeUrl)
      setMenuUrl(res.menuUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <h1 className="font-display text-3xl text-white mb-8">Settings</h1>

      <section className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <Phone size={18} className="text-[var(--color-gold)]" />
          WhatsApp Orders
        </h2>
        <p className="text-sm text-white/40 mb-4">
          Customers &quot;Order via WhatsApp&quot; par click kare tyare aa number par order jase.
        </p>
        <label className="block mb-4">
          <span className="text-xs text-white/40 uppercase tracking-wider">WhatsApp Number</span>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="919876543210"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
          />
          <p className="text-xs text-white/30 mt-1.5">
            India: 91 + 10 digit number (e.g. 919876543210)
          </p>
        </label>
        <label className="block mb-4">
          <span className="text-xs text-white/40 uppercase tracking-wider">Tagline</span>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
          />
        </label>
        <label className="block mb-4">
          <span className="text-xs text-white/40 uppercase tracking-wider">Currency</span>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/40"
          />
        </label>

        {saveError && <p className="text-red-400 text-sm mb-3">{saveError}</p>}
        {saveMsg && <p className="text-green-400 text-sm mb-3">{saveMsg}</p>}

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] text-black font-semibold text-sm disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </section>

      <section className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4">Appearance</h2>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70"
        >
          Theme: {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </section>

      <section className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-white font-medium mb-4 flex items-center gap-2">
          <QrCode size={18} className="text-[var(--color-gold)]" />
          QR Code
        </h2>
        <p className="text-sm text-white/40 mb-4">
          Customers QR scan kari ne menu kholie.
        </p>
        <button
          onClick={generateQR}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 text-[var(--color-gold-light)] text-sm"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
        {qrCode && (
          <div className="mt-6 text-center">
            <img src={qrCode} alt="Menu QR Code" className="mx-auto rounded-xl" width={200} />
            <p className="text-xs text-white/40 mt-3 break-all">{menuUrl}</p>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-white font-medium mb-2 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--color-gold)]" />
          AI Features
        </h2>
        <p className="text-sm text-white/40">
          AI description, pricing suggestions available when adding dishes.
        </p>
      </section>
    </div>
  )
}
