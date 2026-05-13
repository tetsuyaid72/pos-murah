import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Boxes, ClipboardList, PackageCheck, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Warung Madura POS — Aplikasi Kasir untuk Warung & UMKM',
  description:
    'Kelola penjualan, produk, stok, dan laporan harian warung dalam satu aplikasi POS sederhana.',
}

const features = [
  {
    title: 'Catat Penjualan',
    description: 'Transaksi cepat untuk kasir harian.',
    icon: ClipboardList,
  },
  {
    title: 'Kelola Produk',
    description: 'Atur barang, harga, dan kategori.',
    icon: Boxes,
  },
  {
    title: 'Pantau Stok',
    description: 'Lihat stok masuk dan hampir habis.',
    icon: PackageCheck,
  },
  {
    title: 'Laporan Harian',
    description: 'Cek omzet dan riwayat penjualan.',
    icon: BarChart3,
  },
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1200px] flex-col">
        <header className="relative left-1/2 flex h-14 w-screen -translate-x-1/2 items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5 justify-self-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)] sm:h-9 sm:w-9 sm:rounded-2xl">
              <Store className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <span className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Warung Madura <span className="text-emerald-600">POS</span>
            </span>
          </div>

          <Link
            href="/sign-in"
            className="justify-self-end rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(16,185,129,0.24)] transition-colors hover:bg-emerald-700 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Log in
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-start pb-8 pt-8 text-center sm:justify-center sm:pb-10 sm:pt-2">
          <h1 className="max-w-[340px] animate-[fadeInUp_0.7s_ease-out_0.1s_both] text-4xl font-black leading-[1.08] tracking-[-0.045em] text-emerald-600 sm:max-w-full sm:text-5xl md:max-w-4xl md:whitespace-nowrap md:text-6xl lg:text-7xl">
            Kelola Warung Lebih Rapi
          </h1>

          <p className="mt-3 max-w-[320px] animate-[fadeInUp_0.7s_ease-out_0.18s_both] text-sm leading-6 text-slate-600 sm:mt-4 sm:max-w-xl sm:text-lg md:max-w-3xl md:whitespace-nowrap">
            Catat penjualan, kelola stok, dan lihat laporan harian dalam satu aplikasi ringan.
          </p>

          <Link href="/pricing" className="mt-5 animate-[fadeInUp_0.7s_ease-out_0.24s_both] sm:mt-7">
            <Button className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,155,114,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 sm:h-12 sm:px-7 sm:text-base">
              Lihat Paket
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <div className="mt-8 grid w-full max-w-5xl animate-[fadeInUp_0.7s_ease-out_0.32s_both] grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <Card
                  key={feature.title}
                  className="group rounded-[24px] border-slate-200/80 bg-white/85 text-left shadow-[0_14px_45px_rgba(15,23,42,0.055)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_64px_rgba(16,185,129,0.13)] sm:min-h-[190px] sm:rounded-[28px]"
                >
                  <CardContent className="flex h-full flex-col p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white sm:h-10 sm:w-10">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h2 className="mt-4 text-base font-extrabold tracking-tight text-slate-950 sm:mt-5">
                      {feature.title}
                    </h2>
                    <p className="mt-2 text-sm leading-5 text-slate-500">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
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
            <Image
              src="/threads.png"
              alt="Threads"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </a>
        </footer>
      </div>
    </main>
  )
}
