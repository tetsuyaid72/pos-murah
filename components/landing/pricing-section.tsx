import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Gratis',
    price: 'Rp 0',
    period: '/bulan',
    description: 'Untuk memulai dan mencoba semua fitur dasar.',
    features: [
      '100 transaksi/bulan',
      '50 produk',
      '1 kasir',
      'Laporan dasar',
      'Cetak struk',
      'Akses cloud',
    ],
    cta: 'Mulai Gratis',
    href: '/register',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'Rp 49.900',
    period: '/bulan',
    description: 'Untuk bisnis yang serius ingin berkembang.',
    features: [
      'Unlimited transaksi',
      'Unlimited produk',
      'Unlimited kasir',
      'Laporan lengkap & export',
      'Multi-toko',
      'Priority support',
      'Custom branding struk',
      'Manajemen hutang',
    ],
    cta: 'Upgrade Pro',
    href: '/upgrade',
    popular: true,
  },
]

export function PricingSection() {
  return (
    <section id="harga" className="relative border-y border-border/50 bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Harga <span className="gradient-text">Sederhana & Transparan</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-200',
                plan.popular
                  ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                  : 'border-border/50 shadow-sm'
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Rekomendasi
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* CTA */}
              <Link href={plan.href} className="block">
                <Button
                  variant={plan.popular ? 'premium' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Features */}
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
