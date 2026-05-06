import { PackagePlus, ShoppingCart, BarChart3 } from 'lucide-react'

const steps = [
  {
    step: '1',
    icon: PackagePlus,
    title: 'Tambah Produk',
    description: 'Masukkan daftar produk Anda — nama, harga, dan stok. Bisa import sekaligus atau satu per satu.',
  },
  {
    step: '2',
    icon: ShoppingCart,
    title: 'Mulai Transaksi',
    description: 'Pilih produk, proses pembayaran, dan cetak struk. Semudah ketuk layar.',
  },
  {
    step: '3',
    icon: BarChart3,
    title: 'Lihat Laporan',
    description: 'Pantau penjualan, keuntungan, dan stok dari dashboard. Data real-time, tanpa hitung manual.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative border-y border-border/50 bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Mulai dalam <span className="gradient-text">3 Langkah</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tidak perlu keahlian teknis. Siapa saja bisa langsung pakai.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute top-10 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] border-t-2 border-dashed border-emerald-200 dark:border-emerald-800 sm:block" />
              )}

              {/* Step number + icon */}
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <item.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-md">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
