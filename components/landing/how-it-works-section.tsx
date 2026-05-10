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
    <section className="relative border-y border-slate-100 py-14 sm:py-20 md:py-28" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fffb 45%, #f3fff8 100%)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Mulai dalam <span className="text-emerald-600">3 Langkah</span>
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:mt-4 sm:text-lg">
            Tidak perlu keahlian teknis. Siapa saja bisa langsung pakai.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-10 grid gap-8 sm:mt-16 sm:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector line (tablet+ only) */}
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[calc(50%+40px)] top-10 hidden h-px w-[calc(100%-80px)] border-t-2 border-dashed border-emerald-200 sm:block" />
              )}

              {/* Step number + icon */}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 sm:mb-5 sm:h-20 sm:w-20">
                <item.icon className="h-6 w-6 text-emerald-600 sm:h-8 sm:w-8" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] sm:h-7 sm:w-7 sm:text-xs">
                  {item.step}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 sm:mt-2 sm:text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
