'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Zap, ShieldCheck } from 'lucide-react'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { PLANS, formatPrice, PRICING } from '@/lib/pricing'

/** Popup will not reappear for this many days after it is shown to a subscribed user. */
const POPUP_COOLDOWN_DAYS = 7
const POPUP_STORAGE_KEY = 'pos-upgrade-popup-last-shown'

export function UpgradePopup() {
  const [open, setOpen] = useState(false)
  const { plan, paymentStatus } = useSubscriptionStore()

  // Determine what to upsell based on current plan
  const isFree = plan === 'free'
  const isPro = plan === 'pro'
  const isPending = paymentStatus === 'pending'
  const shouldShow = (isFree || isPro) && paymentStatus === 'approved'

  const nextPlan = isFree ? 'PRO' : 'BUSINESS'
  const nextPlanInfo = isFree ? PLANS.PRO : PLANS.BUSINESS
  const nextPlanPrice = isFree ? PRICING.PRO.monthly : PRICING.BUSINESS.monthly
  const ctaHref = isPending ? '/successpayment' : '/pricing'
  const ctaLabel = isPending ? 'Lihat Status Pembayaran' : 'Upgrade Sekarang'

  useEffect(() => {
    if (!shouldShow) return

    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY)
    if (lastShown) {
      const elapsed = Date.now() - Number(lastShown)
      const cooldownMs = POPUP_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      if (elapsed < cooldownMs) return
    }

    const timer = setTimeout(() => {
      localStorage.setItem(POPUP_STORAGE_KEY, String(Date.now()))
      setOpen(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [shouldShow])

  const handleDismiss = useCallback(() => {
    setOpen(false)
  }, [])

  if (!shouldShow) return null

  return (
    <Dialog open={open} onClose={handleDismiss}>
      <DialogHeader>
        <DialogTitle>
          <span className="flex items-center gap-2">
            {isFree ? (
              <Zap className="h-5 w-5 text-emerald-500" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            )}
            Upgrade ke {nextPlan === 'PRO' ? 'Pro' : 'Business'}
          </span>
        </DialogTitle>
        <DialogClose onClose={handleDismiss} />
      </DialogHeader>

      <p className="text-sm text-muted-foreground mb-5">
        {isFree
          ? 'Kelola tim dan promo otomatis untuk meningkatkan penjualan.'
          : 'Buka multi-cabang dan akses unlimited untuk bisnis yang berkembang.'}
      </p>

      {/* Benefits list */}
      <div className="space-y-2.5 mb-6">
        {nextPlanInfo.features.slice(0, 6).map((benefit) => (
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
          <span className="text-2xl font-bold text-foreground">{formatPrice(nextPlanPrice)}</span>
          <span className="text-sm text-muted-foreground">/ bulan</span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-2.5">
        <Link href={ctaHref}>
          <Button variant="premium" size="lg" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            {ctaLabel}
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

