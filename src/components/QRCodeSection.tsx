import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { QrCode } from 'lucide-react'

interface QRCodeSectionProps {
  menuUrl?: string
}

export default function QRCodeSection({ menuUrl: propUrl }: QRCodeSectionProps) {
  const menuUrl = propUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-3xl p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="relative p-4 rounded-2xl bg-white rounded-xl">
          <QRCodeSVG
            value={menuUrl}
            size={140}
            level="H"
            bgColor="#ffffff"
            fgColor="#0a0a0f"
            imageSettings={{
              src: '/favicon.svg',
              height: 28,
              width: 28,
              excavate: true,
            }}
          />
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <QrCode size={18} className="text-[var(--color-gold)]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">
              Scan to Order
            </span>
          </div>
          <h3 className="font-display text-2xl text-white mb-2">
            Experience Our AR Menu
          </h3>
          <p className="text-sm text-white/45 leading-relaxed max-w-md">
            Scan this QR code with your phone camera to instantly access our interactive menu.
            View dishes in augmented reality right on your table.
          </p>
        </div>
      </div>
    </motion.section>
  )
}
