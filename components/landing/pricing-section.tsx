import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NEW_USER_DISCOUNT_PERCENT, PLANS, PRICING, formatPrice, getDisplayPricing } from '@/lib/pricing'

export function PricingSection() {
  return (
    <section id="harga" className="relative overflow-hidden border-y border-slate-100 bg-white py-14 sm:py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: 'linear-gradient(to bottom, #f8fffb, transparent)' }} />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm sm:px-4 sm:py-1.5 sm:text-xs">
            Promo User Baru: Diskon {NEW_USER_DISCOUNT_PERCENT}%
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
            Pilih Paket yang Sesuai untuk Warung Anda
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:mt-4 sm:text-base md:text-lg">
            Mulai kelola penjualan, stok, dan laporan dengan lebih mudah.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-sm gap-5 sm:mt-12 sm:max-w-3xl md:grid-cols-2 lg:gap-6">
          <PricingCard plan={PLANS.PRO} planKey="PRO" href="/register?plan=pro" cta="Mulai Pro" popular />
          <PricingCard plan={PLANS.BUSINESS} planKey="BUSINESS" href="/register?plan=business" cta="Mulai Business" />
        </div>

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-emerald-100 bg-white/80 p-4 text-center shadow-sm sm:mt-12 sm:p-5">
          <p className="text-sm text-slate-600">Belum yakin? Coba demo gratis tanpa daftar.</p>
          <Link href="/demo" className="mt-4 inline-flex">
            <Button variant="outline" size="lg" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Coba Demo Gratis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

interface PricingCardProps {
  plan: typeof PLANS.PRO
  planKey: keyof typeof PRICING
  href: string
  cta: string
  popular?: boolean
}

function PricingCard({ plan, planKey, href, cta, popular = false }: PricingCardProps) {
  const displayPricing = getDisplayPricing(planKey, 'monthly', true)

  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col rounded-3xl border bg-white p-6 shadow-sm',
        popular
          ? 'border-emerald-500 ring-2 ring-emerald-500/10 md:-mt-4 md:mb-4'
          : 'border-slate-200'
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-6">
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            Paling Populer
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
          <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{plan.description}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            <span className="line-through">{formatPrice(displayPricing.normalPrice)}</span>
            <span className="ml-2 font-medium text-emerald-700">hemat {NEW_USER_DISCOUNT_PERCENT}%</span>
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="text-4xl font-bold tracking-tight text-emerald-700">
              {formatPrice(displayPricing.finalPrice)}
            </span>
            <span className="pb-1 text-sm text-slate-500">/bulan</span>
          </div>
        </div>
      </div>

      <ul className="mt-7 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={href} className="mt-7 block">
        <Button
          variant={popular ? 'premium' : 'outline'}
          size="lg"
          className={cn(
            'w-full',
            !popular && 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          )}
        >
          {cta}
        </Button>
      </Link>
    </div>
  )
}
