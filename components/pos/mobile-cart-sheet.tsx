'use client'

import { useState } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRupiah } from '@/lib/format'
import { useCartStore } from '@/stores/cart-store'
import { cn } from '@/lib/utils'
import { CartPanel } from './cart-panel'

/**
 * Floating cart button + slide-up sheet for mobile devices.
 * Only visible on screens < md breakpoint.
 */
export function MobileCartSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const { getItemCount, getTotal } = useCartStore()

  const itemCount = getItemCount()
  const total = getTotal()

  if (itemCount === 0 && !isOpen) return null

  return (
    <>
      {/* Floating cart button */}
      {!isOpen && itemCount > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-20 left-4 right-4 z-40 flex items-center justify-between',
            'rounded-xl bg-primary px-5 py-3.5 text-primary-foreground shadow-xl',
            'md:hidden cursor-pointer'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary">
                {itemCount}
              </span>
            </div>
            <span className="font-semibold">Lihat Keranjang</span>
          </div>
          <span className="font-bold tabular-nums">{formatRupiah(total)}</span>
        </motion.button>
      )}

      {/* Sheet overlay + panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-2xl bg-card shadow-2xl md:hidden"
            >
              {/* Handle bar */}
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="mx-auto h-1 w-10 rounded-full bg-muted" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-3 rounded-full p-1 hover:bg-accent cursor-pointer"
                  aria-label="Tutup keranjang"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart content */}
              <div className="h-[calc(85vh-48px)]">
                <CartPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
