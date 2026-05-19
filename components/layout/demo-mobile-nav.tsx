'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const demoMobileNavItems = [
  { href: '/demo/pos', label: 'Kasir', icon: ShoppingCart },
  { href: '/demo', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/demo/products', label: 'Produk', icon: Package },
  { href: '/demo/transactions', label: 'Transaksi', icon: Receipt },
]

export function DemoMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 text-card-foreground backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="flex items-center justify-around px-1 py-1">
        {demoMobileNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-all duration-200',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                isActive && 'bg-emerald-50 dark:bg-emerald-500/15'
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
