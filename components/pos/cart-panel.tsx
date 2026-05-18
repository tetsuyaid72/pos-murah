'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Trash2, Receipt, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { formatRupiah } from '@/lib/format'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CartItem } from './cart-item'
import { PaymentDialog } from './payment-dialog'
import { PlanLimitModal } from '@/components/plan-limit-modal'
import { usePlanGate } from '@/hooks/use-plan-gate'

interface CartPanelProps {
  compactMobile?: boolean
}

export function CartPanel({ compactMobile = false }: CartPanelProps) {
  const { items, clearCart, getSubtotal, getTotal, getItemCount, discountAmount } =
    useCartStore()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [transactionCount, setTransactionCount] = useState<number | null>(null)
  const { getResourceLimit, gateLimit, modalProps } = usePlanGate()

  const subtotal = getSubtotal()
  const total = getTotal()
  const itemCount = getItemCount()
  const transactionLimit = getResourceLimit('max_transactions_monthly')

  useEffect(() => {
    let ignore = false

    async function fetchTransactionUsage() {
      try {
        const res = await fetch('/api/plan/usage')
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) setTransactionCount(data.usage?.transactions?.current ?? null)
      } catch {
        // Server-side checkout limit still protects the transaction if usage cannot load.
      }
    }

    fetchTransactionUsage()
    return () => {
      ignore = true
    }
  }, [paymentOpen])

  const handleOpenPayment = async () => {
    let current = transactionCount

    try {
      const res = await fetch('/api/plan/usage')
      if (res.ok) {
        const data = await res.json()
        current = data.usage?.transactions?.current ?? current
        setTransactionCount(current)
      }
    } catch {
      // Fall back to the last known usage and let the API enforce the hard limit.
    }

    if (current !== null && !gateLimit('transactions', current, transactionLimit)) return
    setPaymentOpen(true)
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card/50 backdrop-blur-xl">
        {/* Cart header */}
        <div className={compactMobile ? 'hidden' : 'shrink-0 border-b border-border/50 p-3 md:p-4'}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 shadow-sm dark:bg-emerald-500/10 md:h-9 md:w-9 md:rounded-xl">
                <ShoppingCart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 md:h-4 md:w-4" />
              </div>
              <h2 className="text-[16px] font-semibold text-foreground md:text-lg">Keranjang</h2>
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
                className="h-8 rounded-lg px-2.5 text-[12px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 md:h-9 md:px-3 md:text-sm"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Hapus
              </Button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className={compactMobile ? 'min-h-0 flex-1 overflow-y-auto px-4 py-4' : 'min-h-0 flex-1 overflow-y-auto p-2.5 md:p-3'}>
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-muted/70 shadow-sm">
                <Receipt className="h-7 w-7 text-muted-foreground/50" />
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
            <div className={compactMobile ? 'space-y-3' : 'space-y-1.5 md:space-y-2'}>
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
          <div className={compactMobile ? 'shrink-0 border-t border-border/50 bg-background px-4 pb-6 pt-4' : 'shrink-0 border-t border-border/50 bg-background/60 p-3 backdrop-blur-sm md:p-4'}>
            {/* Subtotal */}
            <div className={compactMobile ? 'flex items-center justify-between text-sm' : 'flex items-center justify-between text-[13px] md:text-sm'}>
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums text-foreground">{formatRupiah(subtotal)}</span>
            </div>

            {/* Discount (if any) */}
            {discountAmount > 0 && (
              <div className={compactMobile ? 'mt-1 flex items-center justify-between text-sm text-rose-500' : 'mt-1 flex items-center justify-between text-[13px] text-rose-500 md:text-sm'}>
                <span>Diskon</span>
                <span className="font-medium tabular-nums">
                  -{formatRupiah(subtotal - total)}
                </span>
              </div>
            )}

            <Separator className="my-2.5 bg-border/50 md:my-3" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className={compactMobile ? 'text-sm text-muted-foreground' : 'text-[15px] font-bold text-foreground md:text-base'}>Total</span>
              <span className={compactMobile ? 'text-xl font-bold tabular-nums text-foreground' : 'text-[18px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 md:text-xl'}>
                {formatRupiah(total)}
              </span>
            </div>

            {/* Pay button */}
            <Button
              size="xl"
              variant={compactMobile ? 'default' : 'premium'}
              className={compactMobile ? 'mt-3 h-12 w-full rounded-2xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-500' : 'mt-3 h-10 w-full rounded-xl text-[14px] font-bold md:mt-4 md:h-11 md:text-base'}
              onClick={handleOpenPayment}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              BAYAR
            </Button>
          </div>
        )}
      </div>

      {/* Payment dialog */}
      <PaymentDialog open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <PlanLimitModal {...modalProps} />
    </>
  )
}
