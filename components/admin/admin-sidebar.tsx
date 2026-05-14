'use client'

import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Store,
  Crown,
  Activity,
  CreditCard,
  Settings,
  ChevronLeft,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/stores', label: 'Stores', icon: Store },
  { href: '/admin/memberships', label: 'Memberships', icon: Crown },
  { href: '/admin/activity', label: 'Activity Log', icon: Activity },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen, isMobile } =
    useUIStore()

  if (isMobile) {
    return (
      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity dark:bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card text-card-foreground backdrop-blur-xl transition-transform duration-300 ease-out supports-[backdrop-filter]:bg-card/95',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <AdminSidebarContent
            pathname={pathname}
            collapsed={false}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>
      </>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-border bg-card text-card-foreground backdrop-blur-xl transition-all duration-300 ease-out supports-[backdrop-filter]:bg-card/90',
        sidebarCollapsed ? 'w-[68px]' : 'w-[224px]'
      )}
    >
      <AdminSidebarContent
        pathname={pathname}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
    </aside>
  )
}

function AdminSidebarContent({
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
  const { theme, setTheme } = useUIStore()
  const { resolvedTheme, setTheme: applyTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold tracking-tight text-foreground">
              Admin Panel
            </span>
            <span className="text-[11px] text-muted-foreground">Super Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2.5 py-1.5">
        <p className={cn(
          'mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70',
          collapsed && 'sr-only'
        )}>
          Menu
        </p>
        {adminNavItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium leading-tight transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
              )}
              <Icon className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn('border-t border-border/50 p-2.5', collapsed && 'px-2')}>
        {/* Back to main dashboard */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Kembali ke Dashboard' : undefined}
        >
          <ArrowLeft className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Kembali ke Dashboard</span>}
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer',
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
