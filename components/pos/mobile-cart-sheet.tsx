'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CartPanel } from './cart-panel'

export function MobileCartSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const { getItemCount, getTotal } = useCartStore()

  const itemCount = getItemCount()
  const total = getTotal()

  if (itemCount === 0 && !isOpen) return null

  return (
    <div className="md:hidden">
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 px-4">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-card-foreground shadow-[var(--shadow-lg)]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Keranjang</p>
                <p className="truncate text-sm font-bold">
                  {itemCount} item • {formatRupiah(total)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="h-9 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-500"
            >
              Lihat
            </Button>
          </div>
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="max-h-[calc(88vh-env(safe-area-inset-bottom))] rounded-t-3xl border-border bg-card p-0 pb-[env(safe-area-inset-bottom)] text-card-foreground">
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle>Keranjang</SheetTitle>
            <SheetDescription>Review item sebelum checkout</SheetDescription>
          </SheetHeader>
          <div className="h-[calc(88vh-112px-env(safe-area-inset-bottom))] overflow-hidden">
            <CartPanel compactMobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
