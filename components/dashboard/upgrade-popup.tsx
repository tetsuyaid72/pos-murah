'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Zap } from 'lucide-react'
import { useSubscriptionStore } from '@/stores/subscription-store'

/** Popup will not reappear for this many days after user dismisses it */
const POPUP_COOLDOWN_DAYS = 3
const POPUP_STORAGE_KEY = 'pos-upgrade-popup-dismissed'

const PRO_BENEFITS = [
  'Unlimited transaksi',
  'Unlimited produk',
  'Unlimited kasir',
  'Laporan lengkap & export',
  'Multi-toko',
  'Priority support',
]

export function UpgradePopup() {
  const [open, setOpen] = useState(false)
  const { plan, paymentStatus } = useSubscriptionStore()

  useEffect(() => {
    // Hanya tampil jika masih free dan belum ada payment pending
    if (plan === 'free' && paymentStatus === 'none') {
      // Check cooldown — jangan tampilkan jika belum 3 hari sejak terakhir dismiss
      const lastDismissed = localStorage.getItem(POPUP_STORAGE_KEY)
      if (lastDismissed) {
        const elapsed = Date.now() - Number(lastDismissed)
        const cooldownMs = POPUP_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
        if (elapsed < cooldownMs) return // Masih dalam cooldown
      }

      const timer = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [plan, paymentStatus])

  const handleDismiss = useCallback(() => {
    // Simpan timestamp dismiss ke localStorage
    localStorage.setItem(POPUP_STORAGE_KEY, String(Date.now()))
    setOpen(false)
  }, [])

  // Don't render anything if user is pro or has pending payment
  if (plan !== 'free' || paymentStatus !== 'none') return null

  return (
    <Dialog open={open} onClose={handleDismiss}>
      <DialogHeader>
        <DialogTitle>
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            Upgrade ke Pro
          </span>
        </DialogTitle>
        <DialogClose onClose={handleDismiss} />
      </DialogHeader>

      <p className="text-sm text-muted-foreground mb-5">
        Dapatkan akses penuh ke semua fitur premium untuk mengembangkan bisnis Anda.
      </p>

      {/* Benefits list */}
      <div className="space-y-2.5 mb-6">
        {PRO_BENEFITS.map((benefit) => (
          <div key={benefit} className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm text-foreground">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Price */}
      <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">Rp 49.900</span>
          <span className="text-sm text-muted-foreground">/ bulan</span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-2.5">
        <Link href="/upgrade">
          <Button variant="premium" size="lg" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Sekarang
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-muted-foreground"
          onClick={handleDismiss}
        >
          Nanti Saja
        </Button>
      </div>
    </Dialog>
  )
}
