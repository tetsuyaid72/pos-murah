import Link from 'next/link'
import { BarChart3, Boxes, CircleDollarSign, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingNavbar } from '@/components/landing/landing-navbar'

const stats = ['LIVE', '1 Kasir', '100+ Produk', 'Offline Ready']

const featureCards = [
  {
    title: 'Mulai Jualan',
    description: 'Catat transaksi cepat dan cetak/simpan struk.',
    icon: CircleDollarSign,
  },
  {
    title: 'Kelola Produk',
    description: 'Atur stok, harga, dan daftar barang warung.',
    icon: Boxes,
  },
  {
    title: 'Laporan Harian',
    description: 'Lihat omzet, keuntungan, dan riwayat transaksi.',
    icon: BarChart3,
  },
  {
    title: 'Mode Offline',
    description: 'Tetap bisa dipakai walaupun internet tidak stabil.',
    icon: WifiOff,
    label: 'Coming Soon',
  },
]

export function SimpleLanding() {
  return (
    <>
      <LandingNavbar />
      <section className="relative min-h-screen overflow-hidden bg-[#F8FAFC] px-4 pt-24 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.14),rgba(248,250,252,0)_58%)]" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center pb-14 text-center sm:pb-20">
        <div className="animate-[fadeInUp_0.7s_ease-out_both] rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
          POS untuk Warung & UMKM
        </div>

        <div className="mt-5 flex animate-[fadeInUp_0.7s_ease-out_0.08s_both] flex-wrap items-center justify-center gap-2">
          {stats.map((stat) => (
            <span
              key={stat}
              className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 shadow-sm"
            >
              {stat}
            </span>
          ))}
        </div>

        <h1 className="mt-8 max-w-4xl animate-[fadeInUp_0.7s_ease-out_0.14s_both] text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
          Kelola Warung Lebih Mudah Hari Ini
        </h1>

        <p className="mt-5 max-w-2xl animate-[fadeInUp_0.7s_ease-out_0.2s_both] text-base leading-7 text-slate-600 sm:text-lg">
          Catat penjualan, pantau stok, kelola kasir, dan lihat laporan harian dalam satu aplikasi sederhana.
        </p>

        <div className="mt-8 flex animate-[fadeInUp_0.7s_ease-out_0.26s_both] flex-col gap-3 sm:flex-row">
          <Link href="/register">
            <Button className="h-12 rounded-2xl bg-emerald-600 px-7 font-bold text-white shadow-[0_18px_38px_rgba(16,185,129,0.28)] hover:bg-emerald-700">
              Coba Gratis
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white px-7 font-bold text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:bg-emerald-50">
              Lihat Demo
            </Button>
          </Link>
        </div>

        <div id="fitur" className="mt-12 grid w-full animate-[fadeInUp_0.7s_ease-out_0.34s_both] grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="group rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 text-left shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_rgba(16,185,129,0.13)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  {feature.label ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 ring-1 ring-amber-100">
                      {feature.label}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-6 text-lg font-extrabold tracking-tight text-slate-950">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}
