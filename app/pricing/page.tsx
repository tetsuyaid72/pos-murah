import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicHeader } from '@/components/public-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const plans = [
  {
    name: 'Pro',
    price: 'Rp49K',
    originalPrice: 'Rp99K',
    discount: 'Hemat 51%',
    period: '/bulan',
    description: 'Untuk warung aktif yang ingin biaya ringan bulanan.',
    features: [
      '200 produk',
      '500 transaksi per hari',
      '100 pelanggan',
      'Laporan sampai 365 hari',
      'Backup & restore data',
      'Langganan bulanan fleksibel',
    ],
    cta: 'Pilih Pro',
    href: '/payment?plan=pro&auto=midtrans',
  },
  {
    name: 'Bisnis',
    price: 'Rp199K',
    originalPrice: 'Rp399K',
    discount: 'Promo Lifetime',
    period: 'sekali bayar',
    description: 'Promo launching untuk akses penuh tanpa biaya bulanan.',
    features: [
      'Produk unlimited',
      'Transaksi unlimited',
      'Pelanggan unlimited',
      'Laporan tanpa batas',
      'Backup & restore data',
      'Bayar sekali, akses selamanya',
    ],
    cta: 'Pilih Bisnis',
    href: '/payment?plan=bisnis&auto=midtrans',
    highlighted: true,
  },
]

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(15,23,42,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] dark:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col">
        <PublicHeader />

        <section id="pricing" className="flex flex-1 flex-col items-center justify-start pb-7 pt-6 text-center sm:justify-center sm:pb-8 sm:pt-0">
          <Badge className="border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
            Pro Bulanan & Promo Lifetime
          </Badge>
          <h1 className="mt-4 text-[28px] font-black leading-tight tracking-[-0.045em] text-emerald-600 dark:text-emerald-400 sm:mt-5 sm:text-5xl">
            Pilih Paket
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-slate-600 dark:text-slate-400 sm:mt-4 sm:max-w-2xl sm:text-base sm:leading-7">
            Pilih Pro untuk langganan bulanan ringan, atau Bisnis Lifetime promo launching untuk bayar sekali dan akses selamanya.
          </p>

          <div className="mt-7 grid w-full gap-4 sm:max-w-sm md:max-w-3xl md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'relative flex h-full flex-col rounded-[22px] border-2 border-emerald-500 bg-white/95 text-left shadow-[0_18px_48px_rgba(16,185,129,0.14)] backdrop-blur dark:bg-slate-900/80 dark:shadow-none'
                    : 'flex h-full flex-col rounded-[22px] border-slate-200/80 bg-white/85 text-left shadow-[0_12px_34px_rgba(15,23,42,0.05)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none'
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-top-4">
                    <Badge className="bg-emerald-600 px-3 py-1 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)]">
                      Promo Lifetime Launching
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
                  <CardTitle className="text-lg font-black text-slate-950 dark:text-slate-50">{plan.name}</CardTitle>
                  <CardDescription className="min-h-9 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 p-4 pt-0 sm:p-5 sm:pt-0">
                  <div>
                    {plan.originalPrice && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-slate-400 line-through dark:text-slate-500">{plan.originalPrice}</span>
                        <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {plan.discount}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-slate-50 sm:text-3xl">{plan.price}</span>
                      <span className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-sm">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
                  <Link href={plan.href} className="w-full">
                    <Button
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={
                        plan.highlighted
                          ? 'h-10 w-full rounded-xl bg-emerald-600 font-bold text-white shadow-[0_12px_26px_rgba(16,185,129,0.20)] hover:bg-emerald-700'
                          : 'h-10 w-full rounded-xl border-slate-200 bg-white/80 font-bold text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-emerald-500/40 dark:hover:bg-slate-800'
                      }
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <footer className="flex items-center justify-center gap-3 py-4 text-sm text-slate-500 dark:text-slate-400">
          <span>Product by Hasbuna</span>
          <a
            href="https://www.threads.com/@hasbuna_muhammad?hl=id"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads Hasbuna Muhammad"
            className="inline-flex items-center justify-center transition hover:scale-110"
          >
            <Image src="/threads.png" alt="Threads" width={32} height={32} className="h-8 w-8 object-contain" />
          </a>
        </footer>
      </div>
    </main>
  )
}
