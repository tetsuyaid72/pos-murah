'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'
import { usePlanLimit } from '@/hooks/use-plan-limit'
import type { FeatureKey } from '@/lib/features'
import { cn } from '@/lib/utils'

/**
 * Feature name â†’ minimum required plan for display purposes.
 */
const FEATURE_MIN_PLAN: Record<string, string> = {
  // PRO features
  auto_promo: 'Pro',
  voucher_coupon: 'Pro',
  bulk_import: 'Pro',
  product_variant: 'Pro',
  shift_management: 'Pro',
  wa_notification: 'Pro',
  wa_debt_reminder: 'Pro',
  auto_backup: 'Pro',
  advanced_reports: 'Pro',
  per_cashier_report: 'Pro',
  per_category_report: 'Pro',
  period_comparison: 'Pro',
  export_pdf: 'Pro',
  // BUSINESS features
  multi_outlet: 'Business',
  multi_payment_split: 'Business',
  batch_price_update: 'Business',
  loyalty_points: 'Business',
  stock_prediction: 'Business',
  peak_hour_analysis: 'Business',
  per_customer_report: 'Business',
  email_report: 'Business',
  api_access: 'Business',
  stock_transfer: 'Business',
  multi_staff_role: 'Business',
}

interface FeatureGateProps {
  /** The feature key to check access for */
  feature: FeatureKey
  /** Content to render when feature is accessible */
  children: ReactNode
  /** Optional: custom fallback when feature is locked (default: overlay with upgrade CTA) */
  fallback?: ReactNode
  /** Optional: render children but disabled/blurred instead of hiding */
  mode?: 'hide' | 'blur' | 'disable'
  /** Optional: custom class for the wrapper */
  className?: string
}

/**
 * Wrapper component that gates content based on plan feature access.
 *
 * Usage:
 *   <FeatureGate feature="export_pdf">
 *     <ExportPDFButton />
 *   </FeatureGate>
 *
 *   <FeatureGate feature="advanced_reports" mode="blur">
 *     <AdvancedReportsSection />
 *   </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  mode = 'blur',
  className,
}: FeatureGateProps) {
  const { canUse } = usePlanLimit()
  const hasAccess = canUse(feature) === true

  if (hasAccess) {
    return <>{children}</>
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>
  }

  const requiredPlan = FEATURE_MIN_PLAN[feature] || 'Pro'

  // Hide mode â€” render nothing
  if (mode === 'hide') {
    return null
  }

  // Blur/disable mode â€” render children with overlay
  return (
    <div className={cn('relative', className)}>
      {/* Blurred/disabled content */}
      <div
        className={cn(
          'pointer-events-none select-none',
          mode === 'blur' ? 'blur-[2px] opacity-50' : 'opacity-40'
        )}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-card/95 backdrop-blur-sm border border-border/60 shadow-lg px-6 py-4 max-w-[280px] text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Fitur {requiredPlan}
          </p>
          <p className="text-xs text-muted-foreground">
            Upgrade ke paket {requiredPlan} untuk mengakses fitur ini
          </p>
          <Link
            href={`/pricing`}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade ke {requiredPlan}
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline badge that shows a lock icon and required plan name.
 * Use this for individual buttons or small elements.
 *
 * Usage:
 *   <button disabled={!canUse('export_pdf')}>
 *     Export PDF <LockedBadge feature="export_pdf" />
 *   </button>
 */
export function LockedBadge({ feature }: { feature: FeatureKey }) {
  const { canUse } = usePlanLimit()
  const hasAccess = canUse(feature) === true

  if (hasAccess) return null

  const requiredPlan = FEATURE_MIN_PLAN[feature] || 'Pro'

  return (
    <span className="inline-flex items-center gap-0.5 ml-1.5">
      <Lock className="h-3 w-3 text-amber-500" />
      <span className="text-[10px] font-bold text-amber-500 uppercase">{requiredPlan}</span>
    </span>
  )
}

