import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Boxes, ClipboardList, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PublicHeader } from '@/components/public-header'

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
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(15,23,42,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] dark:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
        <PublicHeader />

        <section className="flex flex-1 flex-col items-center justify-start pb-7 pt-7 text-center sm:justify-center sm:pb-8 sm:pt-0">
          <h1 className="max-w-[340px] animate-[fadeInUp_0.7s_ease-out_0.1s_both] text-4xl font-black leading-[1.08] tracking-[-0.045em] text-emerald-600 dark:text-emerald-400 sm:max-w-full sm:text-5xl md:max-w-3xl md:whitespace-nowrap md:text-6xl lg:text-6xl">
            Kelola Warung Lebih Rapi
          </h1>

          <p className="mt-3 max-w-[320px] animate-[fadeInUp_0.7s_ease-out_0.18s_both] text-sm leading-6 text-slate-600 dark:text-slate-300 sm:max-w-xl sm:text-base md:max-w-3xl md:whitespace-nowrap">
            Catat penjualan, kelola stok, dan lihat laporan harian dalam satu aplikasi ringan.
          </p>

          <Link href="/pricing" className="mt-5 animate-[fadeInUp_0.7s_ease-out_0.24s_both] sm:mt-6">
            <Button className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,155,114,0.22)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 sm:h-11 sm:px-6 sm:text-sm">
              Lihat Paket
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <div className="mt-8 grid w-full max-w-5xl animate-[fadeInUp_0.7s_ease-out_0.32s_both] grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <Card
                  key={feature.title}
                  className="group rounded-[24px] border-slate-200/80 bg-white/85 text-left shadow-[0_14px_45px_rgba(15,23,42,0.055)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_64px_rgba(16,185,129,0.13)] dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-none dark:hover:border-emerald-500/40 sm:min-h-[160px] sm:rounded-[26px]"
                >
                  <CardContent className="flex h-full flex-col p-4 sm:p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h2 className="mt-4 text-base font-extrabold tracking-tight text-slate-950 dark:text-white">
                      {feature.title}
                    </h2>
                    <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
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
