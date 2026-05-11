'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Receipt,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  { href: '/pos', label: 'Kasir', icon: ShoppingCart },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Produk', icon: Package },
  { href: '/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 text-muted-foreground backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400 md:hidden">
      <div className="flex items-center justify-around px-1 py-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-all duration-200',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-muted-foreground dark:text-slate-400'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                isActive && 'bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300'
              )}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
