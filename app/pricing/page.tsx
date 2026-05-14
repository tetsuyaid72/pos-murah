import Image from 'next/image'
import Link from 'next/link'
import { Check, Store } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PricingAuthAction } from '@/components/pricing/pricing-auth-action'
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
    price: 'Rp50.000',
    description: 'Untuk pengguna individu yang butuh fitur utama.',
    features: [
      'Tambah dan edit produk',
      'Kelola stok dan harga',
      'Kategori produk',
      'Kasir dan transaksi',
      'Laporan penjualan dasar',
      'Akses selamanya',
    ],
    cta: 'Pilih Pro',
    href: '/upgrade?plan=pro',
  },
  {
    name: 'Bisnis',
    price: 'Rp100.000',
    originalPrice: 'Rp150.000',
    discount: 'Diskon',
    description: 'Untuk usaha yang butuh fitur lebih lengkap.',
    features: [
      'Semua fitur Pro',
      'Multi kasir',
      'Laporan lebih lengkap',
      'Backup data',
      'Branding struk toko',
      'Support prioritas',
      'Akses selamanya',
    ],
    cta: 'Pilih Bisnis',
    href: '/upgrade?plan=business',
    highlighted: true,
  },
]

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col">
        <header className="relative left-1/2 flex h-14 w-screen -translate-x-1/2 items-center justify-between gap-3 px-4 sm:h-16 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)] sm:h-9 sm:w-9 sm:rounded-2xl">
              <Store className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <span className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Warung Madura <span className="text-emerald-600">POS</span>
            </span>
          </Link>

          <PricingAuthAction />
        </header>

        <section id="pricing" className="flex flex-1 flex-col items-center justify-start pb-7 pt-6 text-center sm:justify-center sm:pb-8 sm:pt-0">
          <Badge className="border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700">
            Paket Berlangganan
          </Badge>
          <h1 className="mt-4 text-[28px] font-black leading-tight tracking-[-0.045em] text-emerald-600 sm:mt-5 sm:text-5xl">
            Pilih Paket
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-slate-600 sm:mt-4 sm:max-w-2xl sm:text-base sm:leading-7">
            Cukup pilih Pro atau Bisnis. Tidak ada paket Basic.
          </p>

          <div className="mt-7 grid w-full gap-4 sm:max-w-sm md:max-w-3xl md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'relative flex h-full flex-col rounded-[22px] border-2 border-emerald-500 bg-white/95 text-left shadow-[0_18px_48px_rgba(16,185,129,0.14)] backdrop-blur'
                    : 'flex h-full flex-col rounded-[22px] border-slate-200/80 bg-white/85 text-left shadow-[0_12px_34px_rgba(15,23,42,0.05)] backdrop-blur'
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-top-4">
                    <Badge className="bg-emerald-600 px-3 py-1 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)]">
                      Pilihan Terbaik
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
                  <CardTitle className="text-lg font-black text-slate-950">{plan.name}</CardTitle>
                  <CardDescription className="min-h-9 text-xs leading-5 text-slate-500 sm:text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 p-4 pt-0 sm:p-5 sm:pt-0">
                  <div>
                    {plan.originalPrice && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-slate-400 line-through">{plan.originalPrice}</span>
                        <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-700">
                          {plan.discount}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">{plan.price}</span>
                      <span className="pb-1 text-sm font-medium text-slate-500">sekali bayar</span>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:text-sm">
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
                          : 'h-10 w-full rounded-xl border-slate-200 bg-white/80 font-bold text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/70'
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

        <footer className="flex items-center justify-center gap-3 py-4 text-sm text-slate-500">
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
