'use client'

import { cn } from '@/lib/utils'
import type { BillingPeriod } from '@/lib/pricing'

interface BillingToggleProps {
  billingPeriod: BillingPeriod
  onChangePeriod: (period: BillingPeriod) => void
  savingsPercent?: number
}

export function BillingToggle({ billingPeriod, onChangePeriod, savingsPercent = 0 }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-slate-100 p-1 dark:bg-slate-800">
      <button
        onClick={() => onChangePeriod('monthly')}
        className={cn(
          'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
          billingPeriod === 'monthly'
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        )}
      >
        Bulanan
      </button>
      <button
        onClick={() => onChangePeriod('yearly')}
        className={cn(
          'relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
          billingPeriod === 'yearly'
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        )}
      >
        Tahunan
        {savingsPercent > 0 && (
          <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            -{savingsPercent}%
          </span>
        )}
      </button>
    </div>
  )
}
