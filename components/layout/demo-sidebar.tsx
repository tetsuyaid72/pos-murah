'use client'

import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'
import { usePathname } from 'next/navigation'
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  Settings,
  ChevronLeft,
  Store,
  Crown,
  Moon,
  Sun,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useToast } from '@/components/ui/toast'

// Demo nav items — all prefixed with /demo
const navItems = [
  { href: '/demo', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/demo/pos', label: 'Kasir', icon: ShoppingCart },
  { href: '/demo/products', label: 'Produk', icon: Package },
  { href: '/demo/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/demo/customers', label: 'Pelanggan', icon: Users, disabled: true },
  { href: '/demo/reports', label: 'Laporan', icon: BarChart3, disabled: true },
  { href: '/demo/settings', label: 'Pengaturan', icon: Settings, disabled: true },
]

export function DemoSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen, isMobile } =
    useUIStore()

  // On mobile, sidebar is an overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity dark:bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card text-card-foreground backdrop-blur-xl transition-transform duration-300 ease-out supports-[backdrop-filter]:bg-card/95',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <DemoSidebarContent
            pathname={pathname}
            collapsed={false}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-border bg-card text-card-foreground backdrop-blur-xl transition-all duration-300 ease-out supports-[backdrop-filter]:bg-card/90',
        sidebarCollapsed ? 'w-[76px]' : 'w-[272px]'
      )}
    >
      <DemoSidebarContent
        pathname={pathname}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
    </aside>
  )
}

function DemoSidebarContent({
  pathname,
  collapsed,
  onCollapse,
  onNavigate,
}: {
  pathname: string
  collapsed: boolean
  onCollapse?: () => void
  onNavigate?: () => void
}) {
  const { setTheme } = useUIStore()
  const { resolvedTheme, setTheme: applyTheme } = useTheme()
  const { storeName, userName, userEmail, userAvatar } = useSettingsStore()
  const { toast } = useToast()

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  const handleDisabledClick = () => {
    toast('Mode Demo: halaman ini tidak tersedia dalam demo', 'warning')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className={cn('flex items-center gap-3 px-5 py-6', collapsed && 'justify-center px-3')}>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex h-full w-full items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold tracking-tight text-foreground">
              {storeName || 'Warung Madura Demo'}
            </span>
            <div className="flex items-center gap-1.5">
              <Crown className="h-3 w-3 shrink-0 text-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Pro Plan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className={cn(
          'mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70',
          collapsed && 'sr-only'
        )}>
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/demo' && pathname.startsWith(item.href + '/'))
          const Icon = item.icon

          if (item.disabled) {
            return (
              <button
                key={item.href}
                onClick={handleDisabledClick}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                  'text-muted-foreground/50 hover:bg-muted/50',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? `${item.label} (demo)` : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground/40" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
              )}
              <Icon className={cn(
                'h-[18px] w-[18px] shrink-0 transition-colors',
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* CTA — Register */}
      {!collapsed && (
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/20">
          <p className="text-xs font-bold uppercase tracking-wide mb-1">
            Suka dengan demo ini?
          </p>
          <p className="text-[11px] leading-relaxed opacity-90 mb-3">
            Daftar gratis dan mulai kelola toko Anda sekarang.
          </p>
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            Daftar Gratis
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Bottom section */}
      <div className={cn('border-t border-border/50 p-3', collapsed && 'px-2')}>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? `Tema: ${isDark ? 'dark' : 'light'}` : undefined}
        >
          {isDark ? (
            <Moon className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <Sun className="h-[18px] w-[18px] shrink-0" />
          )}
          {!collapsed && <span>{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>}
        </button>

        {/* User profile mini */}
        <div className={cn(
          'mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5',
          collapsed && 'justify-center px-2'
        )}>
          <UserAvatar name={userName || 'Demo User'} imageUrl={userAvatar} size="md" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{userName || 'Demo User'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{userEmail || 'demo@warungmadura.pos'}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        {onCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className={cn(
              'mt-1 w-full rounded-xl text-muted-foreground hover:text-foreground',
              collapsed ? 'justify-center' : 'justify-start'
            )}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span className="ml-2 text-xs">Tutup Sidebar</span>}
          </Button>
        )}
      </div>
    </div>
  )
}
