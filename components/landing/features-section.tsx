import { Zap, BarChart3, Package, Monitor } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Transaksi Cepat & Mudah',
    description:
      'Proses penjualan dalam hitungan detik. Interface kasir yang simpel, cocok untuk semua level pengguna.',
  },
  {
    icon: BarChart3,
    title: 'Laporan Otomatis',
    description:
      'Lihat performa bisnis harian, mingguan, dan bulanan tanpa perlu hitung manual. Semua otomatis.',
  },
  {
    icon: Package,
    title: 'Stok Selalu Terkontrol',
    description:
      'Pantau stok real-time, dapat notifikasi saat stok menipis, dan hindari kehabisan barang.',
  },
  {
    icon: Monitor,
    title: 'Bisa di HP & Laptop',
    description:
      'Akses dari mana saja — smartphone, tablet, atau laptop. Cukup buka browser, langsung pakai.',
  },
]

export function FeaturesSection() {
  return (
    <section id="fitur" className="bg-white py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Semua yang Anda Butuhkan untuk{' '}
            <span className="text-emerald-600">Mengelola Bisnis</span>
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:mt-4 sm:text-lg">
            Fokus jualan, biar aplikasi yang urus sisanya.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-emerald-200 hover:shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-8"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100 sm:mb-4 sm:h-12 sm:w-12">
                <feature.icon className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:mt-2 sm:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

