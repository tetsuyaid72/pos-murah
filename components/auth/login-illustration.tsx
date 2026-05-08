'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'

function POSIllustration() {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[320px]"
    >
      {/* Meja kasir / counter */}
      <rect x="40" y="170" width="240" height="12" rx="3" fill="#E2E8F0" />
      <rect x="44" y="182" width="4" height="40" rx="2" fill="#CBD5E1" />
      <rect x="272" y="182" width="4" height="40" rx="2" fill="#CBD5E1" />

      {/* Monitor POS */}
      <rect x="100" y="60" width="120" height="90" rx="8" fill="#1E293B" />
      <rect x="106" y="66" width="108" height="72" rx="4" fill="#F8FAFC" />
      {/* Stand monitor */}
      <rect x="148" y="150" width="24" height="20" rx="2" fill="#94A3B8" />
      <rect x="136" y="166" width="48" height="6" rx="3" fill="#94A3B8" />

      {/* Konten layar POS - dashboard sederhana */}
      {/* Header bar */}
      <rect x="110" y="70" width="100" height="8" rx="2" fill="#10B981" opacity="0.15" />
      <rect x="112" y="72" width="24" height="4" rx="1" fill="#10B981" />

      {/* Item list */}
      <rect x="112" y="84" width="60" height="4" rx="1" fill="#CBD5E1" />
      <rect x="180" y="84" width="22" height="4" rx="1" fill="#94A3B8" />
      <rect x="112" y="92" width="48" height="4" rx="1" fill="#CBD5E1" />
      <rect x="180" y="92" width="22" height="4" rx="1" fill="#94A3B8" />
      <rect x="112" y="100" width="55" height="4" rx="1" fill="#CBD5E1" />
      <rect x="180" y="100" width="22" height="4" rx="1" fill="#94A3B8" />

      {/* Divider */}
      <line x1="112" y1="109" x2="206" y2="109" stroke="#E2E8F0" strokeWidth="1" />

      {/* Total */}
      <rect x="112" y="114" width="28" height="5" rx="1" fill="#64748B" />
      <rect x="170" y="113" width="36" height="7" rx="2" fill="#10B981" opacity="0.2" />
      <rect x="174" y="115" width="28" height="3" rx="1" fill="#10B981" />

      {/* Tombol bayar */}
      <rect x="112" y="124" width="94" height="10" rx="3" fill="#10B981" />
      <rect x="140" y="127" width="38" height="4" rx="1" fill="white" />

      {/* QRIS card / reader di samping */}
      <rect x="240" y="120" width="50" height="50" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* QR pattern */}
      <rect x="250" y="130" width="30" height="30" rx="2" fill="#F1F5F9" />
      <rect x="254" y="134" width="6" height="6" rx="1" fill="#334155" />
      <rect x="264" y="134" width="6" height="6" rx="1" fill="#334155" />
      <rect x="254" y="144" width="6" height="6" rx="1" fill="#334155" />
      <rect x="262" y="142" width="4" height="4" rx="0.5" fill="#334155" />
      <rect x="268" y="148" width="4" height="4" rx="0.5" fill="#334155" />
      <rect x="258" y="152" width="3" height="3" rx="0.5" fill="#334155" />
      <rect x="264" y="144" width="3" height="3" rx="0.5" fill="#94A3B8" />
      {/* Label QRIS */}
      <text x="265" y="126" textAnchor="middle" fontSize="7" fontWeight="600" fill="#64748B">QRIS</text>

      {/* Barang di meja */}
      {/* Botol / produk kecil */}
      <rect x="60" y="148" width="16" height="22" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" />
      <rect x="64" y="152" width="8" height="4" rx="1" fill="#60A5FA" />

      {/* Kardus kecil */}
      <rect x="82" y="154" width="14" height="16" rx="2" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
      <rect x="85" y="158" width="8" height="2" rx="0.5" fill="#F59E0B" />
      <rect x="85" y="162" width="6" height="2" rx="0.5" fill="#F59E0B" />
    </svg>
  )
}

export function LoginIllustration() {
  return (
    <motion.div
      className="relative w-full h-[520px] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Soft background circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-br from-emerald-50/70 via-slate-50/50 to-transparent" />
      </div>

      {/* Small accent circle */}
      <div className="absolute top-16 right-20">
        <div className="w-[50px] h-[50px] rounded-full bg-emerald-50/50" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* SVG Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <POSIllustration />
        </motion.div>

        {/* Single highlight card: Penjualan hari ini */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full max-w-[280px]"
        >
          <div className="bg-white rounded-xl px-5 py-4 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Penjualan hari ini</p>
                <p className="text-xl font-semibold text-slate-800 mt-1">Rp 842.000</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  <p className="text-[11px] text-emerald-600 font-medium">+12 transaksi</p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-slate-400">Kelola usahamu lebih mudah</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Backward compatibility export
export { LoginIllustration as AuthBrandingPanel }
