'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Lock, Zap, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { PLANS, formatPrice, getDisplayPricing } from '@/lib/pricing'

/** Popup will not reappear for this many days after it is shown to a subscribed user. */
const POPUP_COOLDOWN_DAYS = 7
const POPUP_STORAGE_KEY = 'pos-upgrade-popup-last-shown'

export function TrialExpiredUpgradePopup() {
  const { membership } = useAuthStore()
  const [open, setOpen] = useState(false)

  const isTrialExpired = Boolean(
    membership?.isTrial &&
    membership.trialEndAt &&
    new Date(membership.trialEndAt) <= new Date()
  )

  useEffect(() => {
    if (!isTrialExpired) return
    const timer = window.setTimeout(() => setOpen(true), 500)
    return () => window.clearTimeout(timer)
  }, [isTrialExpired])

  if (!isTrialExpired) return null

  const proPricing = getDisplayPricing('PRO', 'monthly', false)
  const businessPricing = getDisplayPricing('BUSINESS', 'lifetime', false)

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogHeader>
        <DialogTitle>
          <span className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Masa Trial Berakhir
          </span>
        </DialogTitle>
        <DialogClose onClose={() => setOpen(false)} />
      </DialogHeader>

      <p className="mb-5 text-sm leading-6 text-muted-foreground">
        Trial 7 hari sudah selesai. Pilih paket aktif untuk membuka kembali kasir, produk, transaksi, pelanggan, dan laporan.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Link href="/payment?plan=pro&auto=midtrans" onClick={() => setOpen(false)}>
          <Button variant="premium" size="lg" className="h-auto w-full flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Zap className="h-4 w-4" />
              Upgrade Pro
            </span>
            <span className="text-xs font-medium opacity-90">
              {formatPrice(proPricing.finalPrice)}{proPricing.periodLabel}
            </span>
          </Button>
        </Link>
        <Link href="/payment?plan=bisnis&auto=midtrans" onClick={() => setOpen(false)}>
          <Button variant="outline" size="lg" className="h-auto w-full flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left">
            <span className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4" />
              Pilih Bisnis
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {formatPrice(businessPricing.finalPrice)} sekali bayar
            </span>
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
        Pro cocok untuk lanjut bulanan. Bisnis cocok jika ingin bayar sekali dan akses selamanya.
      </div>

      <Button variant="ghost" size="lg" className="mt-4 w-full text-muted-foreground" onClick={() => setOpen(false)}>
        Nanti Saja
      </Button>
    </Dialog>
  )
}

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
  const nextPlanPricing = getDisplayPricing(nextPlan, 'lifetime', false)
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
          <span className="text-2xl font-bold text-foreground">{formatPrice(nextPlanPricing.finalPrice)}</span>
          <span className="text-sm text-muted-foreground">{nextPlanPricing.periodLabel}</span>
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

