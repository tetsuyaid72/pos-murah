import Link from 'next/link'
import { BadgeCheck, BarChart3, CheckCircle2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

const trustPoints = [
  'Mudah digunakan',
  'Data aman & tersimpan',
  'Bisa diakses kapan saja',
]

const floatingStats = [
  { title: 'Penjualan Hari Ini', value: 'Rp 12.750.000', icon: BarChart3 },
  { title: 'Transaksi Sukses', value: '128', icon: BadgeCheck },
  { title: 'Produk Terjual', value: '348', icon: Package },
]

// Foto POS/kasir dari Unsplash agar visual hero terasa seperti produk nyata.
const posImageUrl =
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10rem] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(0,178,111,0.16)_0%,rgba(180,242,214,0.22)_36%,rgba(255,255,255,0)_74%)] blur-3xl" />
        <div className="absolute right-[8%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(242,251,247,0.98)_0%,rgba(242,251,247,0.52)_58%,rgba(255,255,255,0)_100%)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 py-[78px] sm:px-8 sm:py-[84px] lg:grid lg:grid-cols-[minmax(0,46%)_minmax(0,54%)] lg:items-center lg:gap-8">
        <div className="max-w-[540px]">
          <span className="inline-flex items-center rounded-full border border-[#D8F3E8] bg-[#F2FBF7] px-4 py-2 text-sm font-semibold text-[#00B26F]">
            ERP POS untuk penjualan, stok, dan pembayaran
          </span>

          <h1 className="mt-6 text-[2.85rem] font-bold leading-[0.98] tracking-[-0.045em] text-[#0B1020] sm:text-[3.4rem] lg:text-[4.15rem]">
            <span className="block">Permudah Penjualan,</span>
            <span className="block text-[#00B26F]">Stok & Pembayaran</span>
            <span className="block">dalam Satu Aplikasi</span>
          </h1>

          <p className="mt-6 max-w-[520px] text-[15.5px] leading-7 text-[#5B6475] sm:text-lg">
            Warung Madura POS membantu UMKM dan pemilik toko mengelola transaksi,
            stok, laporan, dan pembayaran dengan lebih mudah, cepat, dan akurat.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 rounded-2xl bg-[#00B26F] px-7 text-[15px] font-semibold text-white shadow-[0_14px_30px_rgba(0,178,111,0.22)] transition hover:bg-[#009C61]"
              >
                Coba Gratis 3 Hari
              </Button>
            </Link>

            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl border-[#E7ECF2] bg-white px-7 text-[15px] font-semibold text-[#0B1020] shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition hover:border-[#CFE8DD] hover:bg-[#F8FCFA]"
              >
                Lihat Demo
              </Button>
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#5B6475] sm:text-[15px]">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#00B26F]" />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-12 lg:mt-0">
          <div className="relative mx-auto flex min-h-[380px] w-full max-w-[640px] items-center justify-center sm:min-h-[440px] lg:min-h-[520px] lg:justify-end">
            <div className="pointer-events-none absolute right-[6%] top-[6%] h-[88%] w-[88%] rounded-[44px] bg-gradient-to-br from-[#E9F8F1] via-[#F4FBF7] to-white" />
            <div className="pointer-events-none absolute bottom-10 right-[14%] h-14 w-[56%] rounded-full bg-emerald-100/80 blur-2xl" />

            <div className="relative w-full pr-0 sm:pr-6 md:pr-16">
              <div className="relative z-10 mx-auto aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#E7ECF2] bg-white shadow-[0_32px_60px_-20px_rgba(11,16,32,0.22)]">
                <img
                  src={posImageUrl}
                  alt="Perangkat POS untuk kasir dan pembayaran"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="relative z-20 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:absolute md:-right-2 md:top-10 md:mt-0 md:w-[220px] md:grid-cols-1">
                {floatingStats.map((stat, index) => {
                  const Icon = stat.icon

                  return (
                    <div
                      key={stat.title}
                      className={`rounded-[20px] border border-[#E7ECF2] bg-white/96 p-3.5 shadow-[0_18px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm ${
                        index === 2 ? 'hidden sm:block' : ''
                      } ${index === 1 ? 'md:translate-x-3' : ''} ${
                        index === 2 ? 'md:-translate-x-1' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium text-[#5B6475]">
                            {stat.title}
                          </p>
                          <p className="mt-1 text-[15px] font-bold tracking-[-0.02em] text-[#0B1020]">
                            {stat.value}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F2FBF7] text-[#00B26F]">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
