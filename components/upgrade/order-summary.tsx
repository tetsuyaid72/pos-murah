'use client'

import { cn } from '@/lib/utils'
import { PLANS, PRICING, formatPrice, getYearlySavingsPercent } from '@/lib/pricing'
import type { BillingPeriod } from '@/lib/pricing'

type SelectedPlan = 'basic' | 'pro' | 'business'

interface OrderSummaryProps {
  selectedPlan: SelectedPlan
  billingPeriod: BillingPeriod
}

export function OrderSummary({ selectedPlan, billingPeriod }: OrderSummaryProps) {
  const pricingKey = selectedPlan.toUpperCase() as 'BASIC' | 'PRO' | 'BUSINESS'
  const planInfo = PLANS[pricingKey]
  const pricing = PRICING[pricingKey]
  const price = billingPeriod === 'monthly' ? pricing.monthly : pricing.yearly
  const formattedPrice = formatPrice(price)
  const savings = billingPeriod === 'yearly' ? getYearlySavingsPercent(pricingKey) : 0

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
            {billingPeriod === 'monthly' ? 'Bulanan' : 'Tahunan'}
          </span>
        </div>
        {billingPeriod === 'yearly' && savings > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">Diskon</span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              Hemat {savings}%
            </span>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formattedPrice}
            </span>
          </div>
          <p className="mt-0.5 text-right text-xs text-slate-500 dark:text-slate-400">
            / {billingPeriod === 'monthly' ? 'bulan' : 'tahun'}
          </p>
        </div>
      </div>
    </div>
  )
}
