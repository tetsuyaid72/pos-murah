'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NEW_USER_DISCOUNT_PERCENT, PLANS, PRICING, formatPrice, getPromoPricing, getYearlySavingsPercent } from '@/lib/pricing'
import type { BillingPeriod } from '@/lib/pricing'

export function PricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')

  const maxSavings = Math.max(
    getYearlySavingsPercent('BASIC'),
    getYearlySavingsPercent('PRO'),
    getYearlySavingsPercent('BUSINESS'),
  )

  return (
    <section id="harga" className="relative border-y border-border/50 bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Harga <span className="gradient-text">Sederhana & Transparan</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Promo khusus pelanggan baru: diskon {NEW_USER_DISCOUNT_PERCENT}% untuk semua paket. Coba demo gratis tanpa daftar.
          </p>
        </div>

        {/* Billing period toggle */}
        <div className="mx-auto mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setPeriod('monthly')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              period === 'monthly'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Bulanan
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={cn(
              'relative rounded-lg px-4 py-2 text-sm font-medium transition-all',
              period === 'yearly'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Tahunan
            <span className="absolute -top-2 -right-2 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{maxSavings}%
            </span>
          </button>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
          {/* BASIC */}
          <PricingCard
            plan={PLANS.BASIC}
            period={period}
            planKey="BASIC"
            href="/register?plan=basic"
            cta="Mulai Basic"
            variant="default"
          />

          {/* PRO */}
          <PricingCard
            plan={PLANS.PRO}
            period={period}
            planKey="PRO"
            href="/register?plan=pro"
            cta="Mulai Pro"
            variant="popular"
          />

          {/* BUSINESS */}
          <PricingCard
            plan={PLANS.BUSINESS}
            period={period}
            planKey="BUSINESS"
            href="/register?plan=business"
            cta="Mulai Business"
            variant="premium"
          />
        </div>

        {/* Demo CTA */}
        <div className="mx-auto mt-10 max-w-md text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Belum yakin? Coba dulu tanpa daftar.
          </p>
          <Link href="/demo">
            <Button variant="outline" size="lg">
              Coba Demo Gratis
            </Button>
          </Link>
        </div>

        {/* Comparison table */}
        <ComparisonHighlights />
      </div>
    </section>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

interface PricingCardProps {
  plan: typeof PLANS.BASIC
  period: BillingPeriod
  planKey: keyof typeof PRICING
  href: string
  cta: string
  variant: 'default' | 'popular' | 'premium'
}

function PricingCard({ plan, period, planKey, href, cta, variant }: PricingCardProps) {
  const pricing = PRICING[planKey]
  const price = period === 'monthly' ? pricing.monthly : pricing.yearly
  const promoPricing = getPromoPricing(price, true)
  const periodLabel = period === 'monthly' ? '/bulan' : '/tahun'
  const savings = period === 'yearly' ? getYearlySavingsPercent(planKey) : 0
  const monthlyEquiv = period === 'yearly' ? Math.round(promoPricing.finalAmount / 12) : null

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-card p-7 transition-all duration-200',
        variant === 'popular'
          ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10 scale-[1.02] lg:scale-105'
          : variant === 'premium'
            ? 'border-primary/30 shadow-lg shadow-primary/5'
            : 'border-border/50 shadow-sm'
      )}
    >
      {/* Popular badge */}
      {variant === 'popular' && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
            Paling Populer
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="mb-5">
        <span className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          Diskon {NEW_USER_DISCOUNT_PERCENT}% User Baru
        </span>
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Promo khusus pelanggan baru
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Harga normal <span className="line-through">{formatPrice(price)}</span>
        </p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-emerald-600 sm:text-4xl dark:text-emerald-400">
            {formatPrice(promoPricing.finalAmount)}
          </span>
          <span className="text-sm text-muted-foreground">{periodLabel}</span>
        </div>
        <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Sekarang hanya {formatPrice(promoPricing.finalAmount)}
        </p>

        {monthlyEquiv && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            = {formatPrice(monthlyEquiv)}/bulan (hemat {savings}%)
          </p>
        )}

        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
      </div>

      {/* CTA */}
      <Link href={href} className="block">
        <Button
          variant={variant === 'popular' ? 'premium' : variant === 'premium' ? 'default' : 'outline'}
          size="lg"
          className="w-full"
        >
          {cta}
        </Button>
      </Link>

      {/* Features */}
      <ul className="mt-7 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ComparisonHighlights() {
  const highlights = [
    { feature: 'Produk', basic: '50', pro: '500', business: 'Unlimited' },
    { feature: 'Transaksi/bulan', basic: '300', pro: '3.000', business: 'Unlimited' },
    { feature: 'Kasir', basic: '1', pro: '5', business: 'Unlimited' },
    { feature: 'Export Excel', basic: true, pro: true, business: true },
    { feature: 'Export PDF', basic: false, pro: true, business: true },
    { feature: 'Promo & Voucher', basic: false, pro: true, business: true },
    { feature: 'Shift Management', basic: false, pro: true, business: true },
    { feature: 'Multi-toko', basic: false, pro: false, business: true },
    { feature: 'API Access', basic: false, pro: false, business: true },
    { feature: 'Loyalty Points', basic: false, pro: false, business: true },
  ]

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h3 className="text-center text-lg font-semibold text-foreground">
        Perbandingan Fitur
      </h3>
      <div className="mt-6 overflow-hidden rounded-xl border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fitur</th>
              <th className="px-3 py-3 text-center font-medium text-muted-foreground">Basic</th>
              <th className="px-3 py-3 text-center font-medium text-emerald-600 dark:text-emerald-400">Pro</th>
              <th className="px-3 py-3 text-center font-medium text-muted-foreground">Business</th>
            </tr>
          </thead>
          <tbody>
            {highlights.map((row, i) => (
              <tr key={row.feature} className={cn('border-b last:border-0', i % 2 === 0 && 'bg-muted/20')}>
                <td className="px-4 py-2.5 text-foreground">{row.feature}</td>
                <td className="px-3 py-2.5 text-center"><CellValue value={row.basic} /></td>
                <td className="px-3 py-2.5 text-center"><CellValue value={row.pro} /></td>
                <td className="px-3 py-2.5 text-center"><CellValue value={row.business} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-xs font-medium text-foreground">{value}</span>
  }
  if (value) {
    return <Check className="mx-auto h-4 w-4 text-emerald-500" />
  }
  return <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
}
