import { Store, ArrowUpRight, ShoppingCart, Cloud } from 'lucide-react'

const stats = [
  {
    icon: Store,
    value: '100+',
    label: 'UMKM Terdaftar',
  },
  {
    icon: ShoppingCart,
    value: '50.000+',
    label: 'Transaksi Diproses',
  },
  {
    icon: ArrowUpRight,
    value: '99.9%',
    label: 'Uptime Server',
  },
  {
    icon: Cloud,
    value: '24/7',
    label: 'Akses Cloud',
  },
]

export function StatsSection() {
  return (
    <section className="relative border-y border-slate-100 py-10 sm:py-12 md:py-16" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fffb 45%, #f3fff8 100%)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 sm:mb-3 sm:h-10 sm:w-10">
                <stat.icon className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
              </div>
              <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
