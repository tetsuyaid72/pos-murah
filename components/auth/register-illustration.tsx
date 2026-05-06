'use client'

import { motion } from 'framer-motion'
import { Store, Users } from 'lucide-react'

export function RegisterIllustration() {
  return (
    <motion.div
      className="relative w-full h-[560px] flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Headline */}
      <motion.div
        className="text-center mb-6 relative z-20"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-slate-700">
          Mulai kelola toko Anda sekarang
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 max-w-[280px] mx-auto">
          Pantau penjualan, stok, dan transaksi dalam satu aplikasi
        </p>
      </motion.div>

      {/* Background gradient circle - off-center */}
      <div className="absolute inset-0 flex items-center justify-center translate-x-2 translate-y-4">
        <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50/60 blur-[1px]" />
      </div>

      {/* Main image - toko / kasir */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        <img
          src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&h=550&fit=crop&crop=center"
          alt="Toko UMKM modern"
          className="w-[260px] h-[340px] object-cover rounded-2xl shadow-xl shadow-slate-900/8"
        />
      </motion.div>

      {/* Floating Card: Trust / Social proof */}
      <motion.div
        className="absolute bottom-20 -left-1 z-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, 4, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.6 },
          y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 },
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3.5 py-2.5 shadow-md shadow-slate-900/4 border border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-700">1.200+ UMKM</p>
              <p className="text-[9px] text-slate-400">di seluruh Indonesia</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Card: Fitur toko */}
      <motion.div
        className="absolute top-28 right-0 z-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.8 },
          y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.3 },
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3.5 py-2.5 shadow-md shadow-slate-900/4 border border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-600">Setup instan</p>
              <p className="text-[9px] text-slate-400">Siap pakai dalam 2 menit</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtle decorative dot */}
      <motion.div
        className="absolute top-40 left-10 w-2 h-2 rounded-full bg-[#10B981]/30"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
