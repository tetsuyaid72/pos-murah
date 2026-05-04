import Link from 'next/link'
import { Store, ArrowRight, ShoppingCart, Package, BarChart3, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-6 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-18 w-18 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/20">
          <Store className="h-9 w-9" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">
          Warung Madura <span className="gradient-text">POS</span>
        </h1>
        <p className="mb-10 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Sistem Point of Sale modern untuk UMKM. Kelola transaksi, stok, dan laporan dengan mudah dan profesional.
        </p>

        {/* Quick features */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Kasir Cepat</span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Kelola Stok</span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Laporan</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/pos"
          className="inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-10 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
        >
          <Sparkles className="h-5 w-5" />
          Buka Kasir
          <ArrowRight className="h-5 w-5" />
        </Link>

        <p className="mt-6 text-xs text-muted-foreground/60">
          Versi 1.0 — Premium Edition
        </p>
      </div>
    </div>
  )
}
