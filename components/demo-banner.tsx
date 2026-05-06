'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Info, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-white text-sm font-medium">
            <Info className="h-4 w-4 shrink-0" />
            <span className="text-center">
              Mode Demo — Ini hanya demo, data tidak disimpan.
            </span>
            <Link
              href="/register"
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              Daftar Gratis
              <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/20 cursor-pointer"
              aria-label="Tutup banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Floating "Mode Demo" badge — always visible in the bottom-right corner
 */
export function DemoBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
      Mode Demo
    </div>
  )
}
