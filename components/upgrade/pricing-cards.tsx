'use client'

import { Check, Zap, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NEW_USER_DISCOUNT_PERCENT, PLANS, formatPrice, getDisplayPricing } from '@/lib/pricing'

type SelectedPlan = 'pro' | 'business'

interface PricingCardsProps {
  selectedPlan: SelectedPlan
  onSelectPlan: (plan: SelectedPlan) => void
  isNewUserPromoEligible?: boolean
}

const PLAN_ICONS = {
  pro: Zap,
  business: ShieldCheck,
} as const

const PLAN_KEYS = ['pro', 'business'] as const

export function PricingCards({ selectedPlan, onSelectPlan, isNewUserPromoEligible = false }: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {PLAN_KEYS.map((planKey) => {
        const pricingKey = planKey.toUpperCase() as 'PRO' | 'BUSINESS'
        const planInfo = PLANS[pricingKey]
        const displayPricing = getDisplayPricing(pricingKey, 'lifetime', isNewUserPromoEligible)
        const isSelected = selectedPlan === planKey
        const isPopular = planInfo.popular
        const Icon = PLAN_ICONS[planKey]
        return (
          <button
            key={planKey}
            onClick={() => onSelectPlan(planKey)}
            className={cn(
              'relative flex flex-col rounded-xl border p-5 text-left transition-all duration-200',
              isSelected
                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-400'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600'
            )}
          >
            {/* Popular badge */}
            {isPopular && (
              <span className="absolute -top-2.5 left-4 inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Populer
              </span>
            )}
            {isNewUserPromoEligible && (
              <span className="absolute -top-2.5 right-4 inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Diskon {NEW_USER_DISCOUNT_PERCENT}% untuk User Baru
              </span>
            )}

            {/* Header */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                isSelected
                  ? 'bg-emerald-100 dark:bg-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-700'
              )}>
                <Icon className={cn(
                  'h-4 w-4',
                  isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                )} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{planInfo.name}</h3>
              </div>
            </div>

            {/* Price */}
            <div className="mt-3">
              {isNewUserPromoEligible && (
                <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                  Harga normal <span className="line-through">{formatPrice(displayPricing.normalPrice)}</span>
                </p>
              )}
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  'text-2xl font-bold',
                  isNewUserPromoEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                )}>
                  {formatPrice(displayPricing.lifetimePrice)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">akses selamanya</span>
              </div>
              {isNewUserPromoEligible && (
                <p className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Sekarang {formatPrice(displayPricing.finalPrice)} akses selamanya
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="mt-4 space-y-2 flex-1">
              {planInfo.features.slice(0, 5).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                    isSelected ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                  )} />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Selection indicator */}
            <div className={cn(
              'mt-4 flex items-center justify-center rounded-lg py-2 text-xs font-medium transition-all',
              isSelected
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            )}>
              {isSelected ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Dipilih
                </span>
              ) : (
                'Pilih Paket'
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
