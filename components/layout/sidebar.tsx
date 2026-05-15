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
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'

import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'Kasir', icon: ShoppingCart },
  { href: '/products', label: 'Produk', icon: Package },
  { href: '/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/customers', label: 'Pelanggan', icon: Users },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
]

export function Sidebar() {
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
          <SidebarContent
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
        sidebarCollapsed ? 'w-[68px]' : 'w-56'
      )}
    >
      <SidebarContent
        pathname={pathname}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
    </aside>
  )
}

function SidebarContent({
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
  const { storeName, storeLogo, userName, userEmail, userAvatar } = useSettingsStore()
  const { logout, membership, user } = useAuthStore()
  const { paymentStatus } = useSubscriptionStore()

  // Calculate trial info for display
  const trialDaysRemaining = (() => {
    if (!membership?.isTrial || !membership?.trialEndAt) return 0
    const trialEnd = new Date(membership.trialEndAt)
    const now = new Date()
    const diff = trialEnd.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()
  const isTrialActive = membership?.isTrial && trialDaysRemaining > 0
  const isTrialExpired = Boolean(membership?.isTrial && membership.trialEndAt && trialDaysRemaining <= 0)
  // Server membership is always the source of truth for plan status
  const plan = isTrialExpired ? 'TRIAL_EXPIRED' : membership?.isTrial ? 'QUICK_TRIAL' : membership?.plan || 'FREE'
  const isPaidActive = Boolean(membership && !membership.isTrial && paymentStatus === 'approved')
  const ctaHref = paymentStatus === 'pending' ? '/successpayment' : '/pricing'
  const ctaLabel = paymentStatus === 'pending' ? 'Status Pembayaran' : 'Upgrade Paket'
  const showUpgradeButton = !collapsed && !isPaidActive && Boolean(isTrialActive || isTrialExpired)

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4', collapsed && 'justify-center px-2')}>
        {/* Store logo or default icon */}
        <div
          className={cn(
            'relative h-9 w-9 shrink-0 overflow-hidden rounded-full',
            storeLogo
              ? 'border border-border bg-white dark:bg-slate-900'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20'
          )}
        >
          {storeLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storeLogo}
              alt={storeName || 'Logo toko'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Store className="h-4.5 w-4.5" />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold tracking-tight text-foreground">
              {storeName || 'Toko Saya'}
            </span>
            <PlanBadge plan={plan} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 py-1.5">
        <p className={cn(
          'mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70',
          collapsed && 'sr-only'
        )}>
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
              {/* Active indicator pill */}
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

        {/* Admin section â€” only for SUPER_ADMIN */}
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <p className={cn(
              'mt-4 mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70',
              collapsed && 'sr-only'
            )}>
              Admin
            </p>
            <Link
              href="/admin"
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium leading-tight transition-all duration-200',
                pathname.startsWith('/admin')
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Admin Panel' : undefined}
            >
              {pathname.startsWith('/admin') && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
              )}
              <ShieldCheck className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                pathname.startsWith('/admin')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground group-hover:text-foreground'
              )} />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Upgrade button */}
      {showUpgradeButton && (
        <SidebarUpgradeButton
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          onNavigate={onNavigate}
        />
      )}

      {/* Bottom section */}
      <div className={cn('border-t border-border/50 p-2.5', collapsed && 'px-2')}>
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

        {/* User profile mini */}
        <div className={cn(
          'mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2',
          collapsed && 'justify-center px-2'
        )}>
          <UserAvatar name={userName} imageUrl={userAvatar} size="md" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{userName || 'Pengguna'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{userEmail || '-'}</p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className={cn(
            'mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Keluar</span>}
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

function SidebarUpgradeButton({
  ctaHref,
  ctaLabel,
  onNavigate,
}: {
  ctaHref: string
  ctaLabel: string
  onNavigate?: () => void
}) {
  return (
    <div className="shrink-0 px-2.5 pb-2 sm:pb-2.5">
      <Link
        href={ctaHref}
        onClick={onNavigate}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
      >
        <Crown className="h-4 w-4" />
        {ctaLabel}
      </Link>
    </div>
  )
}

// =============================================================================
// Plan Badge â€” dynamic label + styling based on subscription plan
// =============================================================================

const PLAN_CONFIG: Record<string, { label: string; icon: typeof Crown; iconClass: string; textClass: string }> = {
  FREE: {
    label: 'Free Plan',
    icon: Store,
    iconClass: 'text-muted-foreground',
    textClass: 'text-muted-foreground',
  },
  QUICK_TRIAL: {
    label: 'Quick Trial',
    icon: Store,
    iconClass: 'text-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  TRIAL_EXPIRED: {
    label: 'Trial Berakhir',
    icon: Store,
    iconClass: 'text-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  STARTER: {
    label: 'Starter Plan',
    icon: Crown,
    iconClass: 'text-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  BASIC: {
    label: 'Free Plan',
    icon: Store,
    iconClass: 'text-muted-foreground',
    textClass: 'text-muted-foreground',
  },
  PRO: {
    label: 'Pro Plan',
    icon: Crown,
    iconClass: 'text-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  BUSINESS: {
    label: 'Business Plan',
    icon: Crown,
    iconClass: 'text-violet-500',
    textClass: 'text-violet-600 dark:text-violet-400',
  },
  ENTERPRISE: {
    label: 'Enterprise',
    icon: Crown,
    iconClass: 'text-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
}

function PlanBadge({ plan }: { plan: string }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE
  const Icon = config.icon

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn('h-3 w-3 shrink-0', config.iconClass)} />
      <span className={cn('text-[11px] font-medium', config.textClass)}>
        {config.label}
      </span>
    </div>
  )
}

