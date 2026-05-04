'use client'

import { useState } from 'react'
import { ShoppingCart, Trash2, Receipt, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { formatRupiah } from '@/lib/format'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CartItem } from './cart-item'
import { PaymentDialog } from './payment-dialog'

export function CartPanel() {
  const { items, clearCart, getSubtotal, getTotal, getItemCount, discountAmount } =
    useCartStore()
  const [paymentOpen, setPaymentOpen] = useState(false)

  const subtotal = getSubtotal()
  const total = getTotal()
  const itemCount = getItemCount()

  return (
    <>
      <div className="flex h-full flex-col border-l border-border/50 bg-card/80 backdrop-blur-xl">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-foreground">Keranjang</h2>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white shadow-sm shadow-emerald-500/30">
                {itemCount}
              </span>
            )}
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Hapus
            </Button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/80">
                <Receipt className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Keranjang kosong
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Klik produk untuk menambahkan
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Cart footer — totals & pay button */}
        {items.length > 0 && (
          <div className="border-t border-border/50 p-5">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums text-foreground">{formatRupiah(subtotal)}</span>
            </div>

            {/* Discount (if any) */}
            {discountAmount > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-rose-500">
                <span>Diskon</span>
                <span className="font-medium tabular-nums">
                  -{formatRupiah(subtotal - total)}
                </span>
              </div>
            )}

            <Separator className="my-4 bg-border/50" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                {formatRupiah(total)}
              </span>
            </div>

            {/* Pay button */}
            <Button
              size="xl"
              variant="premium"
              className="mt-5 w-full text-lg font-bold"
              onClick={() => setPaymentOpen(true)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              BAYAR
            </Button>
          </div>
        )}
      </div>

      {/* Payment dialog */}
      <PaymentDialog open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </>
  )
}
