'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  PackagePlus,
  Receipt,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  {
    label: 'Buka Kasir',
    description: 'Mulai transaksi baru',
    href: '/pos',
    icon: ShoppingCart,
    bgFrom: '#059669',
    bgTo: '#10b981',
  },
  {
    label: 'Tambah Produk',
    description: 'Daftarkan produk baru',
    href: '/products/new',
    icon: PackagePlus,
    bgFrom: '#6366f1',
    bgTo: '#818cf8',
  },
  {
    label: 'Lihat Transaksi',
    description: 'Riwayat penjualan',
    href: '/transactions',
    icon: Receipt,
    bgFrom: '#f59e0b',
    bgTo: '#fbbf24',
  },
] as const

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ACTIONS.map((action) => (
        <Link key={action.href} href={action.href}>
          <div
            className={cn(
              'group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 transition-all duration-300 cursor-pointer',
              'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1'
            )}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${action.bgFrom}, ${action.bgTo})`,
              }}
            >
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
          </div>
        </Link>
      ))}
    </div>
  )
}
