'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Package, TrendingUp } from 'lucide-react'

export function LoginIllustration() {
  return (
    <motion.div
      className="relative w-full h-[560px] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Background gradient circle - slightly off-center for natural feel */}
      <div className="absolute inset-0 flex items-center justify-center translate-x-3 translate-y-2">
        <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-100/60 blur-[1px]" />
      </div>

      {/* Subtle secondary shape */}
      <div className="absolute top-14 right-16">
        <div className="w-[70px] h-[70px] rounded-full bg-emerald-50/60 blur-[1px]" />
      </div>

      {/* Main image */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=600&fit=crop&crop=center"
          alt="Kasir melayani pelanggan"
          className="w-[280px] h-[380px] object-cover rounded-2xl shadow-xl shadow-slate-900/8"
        />
      </motion.div>

      {/* Card: Transaksi berhasil — top left, slightly asymmetric */}
      <motion.div
        className="absolute top-14 left-0 z-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.5 },
          y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3.5 py-2.5 shadow-md shadow-slate-900/4 border border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-600">Transaksi berhasil</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs font-semibold text-slate-800">Rp 18.500</p>
                <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">QRIS</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card: Produk — bottom left, offset */}
      <motion.div
        className="absolute bottom-24 -left-2 z-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, 4, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.7 },
          y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3.5 py-2.5 shadow-md shadow-slate-900/4 border border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-600">Indomie Goreng</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs font-semibold text-slate-800">Rp 3.500</p>
                <span className="text-[9px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">Stok: 24</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card: Penjualan hari ini — top right area */}
      <motion.div
        className="absolute top-32 -right-2 z-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.9 },
          y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3.5 py-2.5 shadow-md shadow-slate-900/4 border border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Penjualan hari ini</p>
              <p className="text-xs font-semibold text-slate-800">Rp 842.000</p>
              <p className="text-[9px] text-slate-400">+12 transaksi</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtle decorative dot */}
      <motion.div
        className="absolute bottom-40 right-14 w-2 h-2 rounded-full bg-[#10B981]/30"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

// Backward compatibility export
export { LoginIllustration as AuthBrandingPanel }
