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
    <section id="fitur" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Semua yang Anda Butuhkan untuk{' '}
            <span className="gradient-text">Mengelola Bisnis</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Fokus jualan, biar aplikasi yang urus sisanya.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/50 bg-card p-8 transition-all duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:border-emerald-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20">
                <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

