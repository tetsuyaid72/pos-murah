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
    <section className="relative border-y border-border/50 bg-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <stat.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
