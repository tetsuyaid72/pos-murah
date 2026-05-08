'use client'

import { motion } from 'framer-motion'
import { Store } from 'lucide-react'

function WarungIllustration() {
  return (
    <svg
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[300px]"
    >
      {/* Atap toko / awning */}
      <path d="M30 70 L160 40 L290 70 L290 82 L30 82 Z" fill="#10B981" opacity="0.12" />
      <rect x="30" y="78" width="260" height="5" rx="2" fill="#10B981" opacity="0.25" />

      {/* Dinding toko */}
      <rect x="40" y="83" width="240" height="130" rx="0" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

      {/* Pintu */}
      <rect x="140" y="143" width="40" height="70" rx="3" fill="#E2E8F0" />
      <rect x="143" y="146" width="34" height="64" rx="2" fill="#F1F5F9" />
      <circle cx="171" cy="178" r="2" fill="#94A3B8" />

      {/* Jendela kiri */}
      <rect x="56" y="96" width="60" height="40" rx="3" fill="#E2E8F0" />
      <rect x="59" y="99" width="54" height="34" rx="2" fill="#DBEAFE" opacity="0.5" />
      <line x1="86" y1="99" x2="86" y2="133" stroke="#E2E8F0" strokeWidth="1" />
      <line x1="59" y1="116" x2="113" y2="116" stroke="#E2E8F0" strokeWidth="1" />

      {/* Jendela kanan */}
      <rect x="204" y="96" width="60" height="40" rx="3" fill="#E2E8F0" />
      <rect x="207" y="99" width="54" height="34" rx="2" fill="#DBEAFE" opacity="0.5" />
      <line x1="234" y1="99" x2="234" y2="133" stroke="#E2E8F0" strokeWidth="1" />
      <line x1="207" y1="116" x2="261" y2="116" stroke="#E2E8F0" strokeWidth="1" />

      {/* Rak display kiri - produk */}
      <rect x="52" y="148" width="70" height="6" rx="1" fill="#E2E8F0" />
      {/* Produk di rak */}
      <rect x="56" y="134" width="10" height="14" rx="2" fill="#FECACA" />
      <rect x="69" y="138" width="10" height="10" rx="2" fill="#FDE68A" />
      <rect x="82" y="136" width="10" height="12" rx="2" fill="#BBF7D0" />
      <rect x="95" y="139" width="10" height="9" rx="2" fill="#BFDBFE" />
      <rect x="108" y="135" width="10" height="13" rx="2" fill="#E9D5FF" />

      {/* Rak display kanan - produk */}
      <rect x="198" y="148" width="70" height="6" rx="1" fill="#E2E8F0" />
      {/* Produk di rak */}
      <rect x="202" y="137" width="10" height="11" rx="2" fill="#FDE68A" />
      <rect x="215" y="134" width="10" height="14" rx="2" fill="#BBF7D0" />
      <rect x="228" y="138" width="10" height="10" rx="2" fill="#FECACA" />
      <rect x="241" y="136" width="10" height="12" rx="2" fill="#BFDBFE" />
      <rect x="254" y="139" width="10" height="9" rx="2" fill="#FED7AA" />

      {/* Papan nama toko */}
      <rect x="110" y="88" width="100" height="22" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="122" y="94" width="76" height="4" rx="1" fill="#64748B" />
      <rect x="134" y="102" width="52" height="3" rx="1" fill="#CBD5E1" />

      {/* Lantai / trotoar */}
      <rect x="20" y="213" width="280" height="8" rx="2" fill="#F1F5F9" />

      {/* Stiker QRIS di pintu */}
      <rect x="148" y="190" width="24" height="18" rx="2" fill="white" stroke="#E2E8F0" strokeWidth="0.8" />
      <rect x="152" y="194" width="16" height="10" rx="1" fill="#F1F5F9" />
      <rect x="154" y="196" width="4" height="4" rx="0.5" fill="#334155" />
      <rect x="160" y="196" width="4" height="4" rx="0.5" fill="#334155" />
      <rect x="154" y="202" width="4" height="2" rx="0.5" fill="#334155" />
      <rect x="160" y="201" width="3" height="3" rx="0.5" fill="#94A3B8" />

      {/* Pot tanaman kecil di depan */}
      <rect x="192" y="200" width="14" height="13" rx="3" fill="#D1FAE5" />
      <rect x="195" y="196" width="8" height="6" rx="4" fill="#6EE7B7" />
      <rect x="197" y="192" width="4" height="6" rx="2" fill="#34D399" />
    </svg>
  )
}

export function RegisterIllustration() {
  return (
    <motion.div
      className="relative w-full h-[560px] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Soft background circle */}
      <div className="absolute inset-0 flex items-center justify-center translate-y-4">
        <div className="w-[340px] h-[340px] rounded-full bg-gradient-to-br from-emerald-50/60 via-slate-50/40 to-transparent" />
      </div>

      {/* Small accent circle */}
      <div className="absolute bottom-28 left-12">
        <div className="w-[40px] h-[40px] rounded-full bg-emerald-50/40" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Headline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-slate-700">
            Mulai kelola toko Anda hari ini
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-[280px] mx-auto leading-relaxed">
            Catat penjualan, kelola stok, dan pantau keuntungan dengan mudah
          </p>
        </motion.div>

        {/* SVG Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <WarungIllustration />
        </motion.div>

        {/* Single trust element */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-2.5 bg-white rounded-lg px-4 py-2.5 border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[13px] text-slate-500 font-medium">
              Digunakan oleh UMKM di Indonesia
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
