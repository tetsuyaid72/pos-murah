import Image from 'next/image'
import Link from 'next/link'
import { Check, Store } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    name: 'Basic',
    price: 'Rp 15k',
    description: 'Cocok untuk warung kecil yang baru mulai digital.',
    features: [
      '1 kasir',
      'Catat penjualan harian',
      'Kelola produk',
      'Pantau stok dasar',
      'Laporan harian sederhana',
    ],
    cta: 'Pilih Basic',
    href: '/payment?plan=basic',
  },
  {
    name: 'Pro',
    price: 'Rp 25k',
    originalPrice: 'Rp 35k/bulan',
    discount: '28% OFF',
    description: 'Paket terbaik untuk warung yang ingin operasional lebih rapi.',
    features: [
      'Semua fitur Basic',
      'Multi kasir',
      'Manajemen stok lebih lengkap',
      'Laporan penjualan lengkap',
      'Backup data manual',
      'Export laporan',
    ],
    cta: 'Pilih Pro',
    href: '/payment?plan=pro',
    highlighted: true,
  },
  {
    name: 'Bisnis',
    price: 'Rp 99k',
    description: 'Untuk usaha yang butuh fitur lebih lengkap dan siap berkembang.',
    features: [
      'Semua fitur Pro',
      'Cabang/toko lebih dari satu',
      'Role akses karyawan',
      'Laporan bisnis lanjutan',
      'Riwayat transaksi lebih lengkap',
      'Prioritas support',
      'Fitur request khusus',
    ],
    cta: 'Pilih Bisnis',
    href: '/payment?plan=bisnis',
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

      <div className="relative mx-auto flex min-h-screen max-w-[1200px] flex-col">
        <header className="relative left-1/2 flex h-14 w-screen -translate-x-1/2 items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)] sm:h-9 sm:w-9 sm:rounded-2xl">
              <Store className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <span className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Warung Madura <span className="text-emerald-600">POS</span>
            </span>
          </Link>

          <Link
            href="/sign-in"
            className="rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(16,185,129,0.24)] transition-colors hover:bg-emerald-700 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Log in
          </Link>
        </header>

        <section id="pricing" className="flex flex-1 flex-col items-center justify-start pb-8 pt-6 text-center sm:justify-center sm:pb-10 sm:pt-2">
          <Badge className="border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700">
            Paket Berlangganan
          </Badge>
          <h1 className="mt-4 max-w-full whitespace-nowrap text-[30px] font-black leading-tight tracking-[-0.045em] text-emerald-600 sm:mt-5 sm:text-5xl lg:text-6xl">
            Pilih Paket yang Sesuai
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-slate-600 sm:mt-4 sm:max-w-2xl sm:text-lg sm:leading-7">
            Mulai kelola penjualan, stok, dan laporan warungmu dengan lebih rapi.
          </p>

          <div className="mt-8 grid w-full gap-4 sm:mt-10 sm:max-w-md md:max-w-none md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'relative flex h-full flex-col rounded-[24px] border-2 border-emerald-500 bg-white/95 text-left shadow-[0_26px_80px_rgba(16,185,129,0.18)] backdrop-blur sm:rounded-[28px]'
                    : 'flex h-full flex-col rounded-[24px] border-slate-200/80 bg-white/85 text-left shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:rounded-[28px]'
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-top-4">
                    <Badge className="bg-emerald-600 px-3 py-1 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)]">
                      Pilihan Terbaik
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
                  <CardTitle className="text-xl font-black text-slate-950">{plan.name}</CardTitle>
                  <CardDescription className="min-h-10 text-sm leading-5 text-slate-500">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 p-5 pt-0 sm:p-6 sm:pt-0">
                  {plan.highlighted ? (
                    <div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black tracking-[-0.04em] text-slate-950">{plan.price}</span>
                        <span className="pb-1 text-sm font-medium text-slate-500">/bulan</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-slate-400 line-through">{plan.originalPrice}</span>
                        <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-700">
                          {plan.discount}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black tracking-[-0.04em] text-slate-950">{plan.price}</span>
                      <span className="pb-1 text-sm font-medium text-slate-500">/bulan</span>
                    </div>
                  )}

                  <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm leading-5 text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto p-5 pt-0 sm:p-6 sm:pt-0">
                  <Link href={plan.href} className="w-full">
                    <Button
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={
                        plan.highlighted
                          ? 'h-11 w-full rounded-2xl bg-emerald-600 font-bold text-white shadow-[0_14px_32px_rgba(16,185,129,0.22)] hover:bg-emerald-700'
                          : 'h-11 w-full rounded-2xl border-slate-200 bg-white/80 font-bold text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/70'
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

        <footer className="flex items-center justify-center gap-3 py-5 text-sm text-slate-500">
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
