'use client'

import { PLANS, formatPrice, getDisplayPricing } from '@/lib/pricing'

type SelectedPlan = 'pro' | 'business'

interface OrderSummaryProps {
  selectedPlan: SelectedPlan
  isNewUserPromoEligible?: boolean
}

export function OrderSummary({ selectedPlan, isNewUserPromoEligible = false }: OrderSummaryProps) {
  const pricingKey = selectedPlan.toUpperCase() as 'PRO' | 'BUSINESS'
  const planInfo = PLANS[pricingKey]
  const displayPricing = getDisplayPricing(pricingKey, 'lifetime', isNewUserPromoEligible)
  const formattedPrice = formatPrice(displayPricing.finalPrice)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Ringkasan Pesanan
      </h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Paket</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{planInfo.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Periode</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {displayPricing.accessLabel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Promo</span>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            Hemat {displayPricing.promo.discountPercent}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Harga normal</span>
          <span className="text-sm text-slate-400 line-through dark:text-slate-500">
            {formatPrice(displayPricing.promo.originalPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Potongan</span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            -{formatPrice(displayPricing.promo.discountAmount)}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formattedPrice}
            </span>
          </div>
          <p className="mt-0.5 text-right text-xs text-slate-500 dark:text-slate-400">
            {displayPricing.periodLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
