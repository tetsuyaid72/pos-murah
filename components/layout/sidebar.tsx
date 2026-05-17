'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import {
  BarChart3,
  Calculator,
  ChevronLeft,
  Crown,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Sun,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore, type AuthMembership } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { Badge } from '@/components/ui/badge'
import { buttonVariants, Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/ui/user-avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'Kasir', icon: ShoppingCart },
  { href: '/products', label: 'Produk', icon: Package },
  { href: '/hpp', label: 'HPP', icon: Calculator },
  { href: '/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/customers', label: 'Pelanggan', icon: Users },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen, isMobile } = useUIStore()

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          hideCloseButton
          className="w-[288px] max-w-[86vw] overflow-hidden border-r border-slate-200 bg-white p-0 text-slate-950 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 sm:max-w-[288px]"
        >
          <SidebarContent
            pathname={pathname}
            collapsed={false}
            mobile
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 border-r border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-300 ease-out dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 md:flex',
        sidebarCollapsed ? 'w-[72px] xl:w-20' : 'w-[clamp(232px,18vw,280px)]'
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
  mobile = false,
}: {
  pathname: string
  collapsed: boolean
  mobile?: boolean
  onCollapse?: () => void
  onNavigate?: () => void
}) {
  const { setTheme } = useUIStore()
  const { resolvedTheme, setTheme: applyTheme } = useTheme()
  const { storeName, storeLogo, userName, userEmail, userAvatar } = useSettingsStore()
  const { logout, membership, user } = useAuthStore()
  const { paymentStatus } = useSubscriptionStore()

  const plan = getDisplayPlan(membership)
  const isPaidPlan = Boolean(membership && !membership.isTrial && ['PRO', 'BUSINESS'].includes(String(membership.plan).toUpperCase()))
  const ctaHref = paymentStatus === 'pending' ? '/successpayment' : '/pricing'
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,rgba(15,23,42,1),rgba(2,6,23,1))]">
      <StoreHeader
        collapsed={collapsed}
        storeName={storeName}
        storeLogo={storeLogo}
        plan={plan}
      />

      <Separator className="mx-4 w-auto bg-slate-200/80 dark:bg-slate-800" />

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-width:thin] [@media(max-height:760px)]:py-2 xl:px-3 xl:py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Navigasi
          </p>
        )}
        <div className="space-y-1 [@media(max-height:760px)]:space-y-0.5 xl:space-y-1.5">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <div className="mt-4 space-y-1.5">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Admin
              </p>
            )}
            <SidebarNavItem
              item={{ href: '/admin', label: 'Admin Panel', icon: ShieldCheck }}
              active={pathname === '/admin' || pathname.startsWith('/admin/')}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </nav>

      <div className={cn('shrink-0 px-2.5 pb-2.5 [@media(max-height:760px)]:px-2 [@media(max-height:760px)]:pb-2 xl:px-3 xl:pb-3', mobile && 'px-3 pb-[max(12px,env(safe-area-inset-bottom))]')}>
        {!isPaidPlan && (
          <div className="[@media(max-height:760px)]:hidden">
            <PlanCard collapsed={collapsed} ctaHref={ctaHref} mobile={mobile} onNavigate={onNavigate} />
          </div>
        )}
        <FooterActions
          collapsed={collapsed}
          isDark={isDark}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          onToggleTheme={toggleTheme}
          onLogout={logout}
          onCollapse={onCollapse}
          mobile={mobile}
        />
      </div>
    </div>
  )
}

type NavItem = (typeof navItems)[number]

function SidebarNavItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex h-10 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all duration-200 [@media(max-height:760px)]:h-9 [@media(max-height:760px)]:rounded-xl xl:h-11',
        active
          ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/15'
          : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100',
        collapsed && 'justify-center px-2'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
      )}
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors',
          active ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200'
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

function StoreHeader({
  collapsed,
  storeName,
  storeLogo,
  plan,
}: {
  collapsed: boolean
  storeName: string
  storeLogo: string | null
  plan: PlanDisplay
}) {
  return (
    <div className={cn('px-3 py-3 [@media(max-height:760px)]:py-2 xl:px-4 xl:py-4', collapsed && 'px-2.5 xl:px-3')}>
      <div className={cn('flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 [@media(max-height:760px)]:rounded-2xl [@media(max-height:760px)]:p-2 xl:p-3', collapsed && 'justify-center rounded-2xl p-2')}>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-emerald-600 text-white shadow-sm dark:border-slate-700 [@media(max-height:760px)]:h-9 [@media(max-height:760px)]:w-9 xl:h-11 xl:w-11">
          {storeLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storeLogo} alt={storeName || 'Logo toko'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-700">
              <Store className="h-5 w-5" />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
              {storeName || 'Warung Madura'}
            </p>
            <Badge className={cn('mt-1 h-5 border-0 px-2 text-[10px] font-bold', plan.badgeClass)}>
              {plan.label}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

function PlanCard({
  collapsed,
  ctaHref,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean
  ctaHref: string
  mobile?: boolean
  onNavigate?: () => void
}) {
  if (collapsed) {
    return (
      <Link
        href={ctaHref}
        onClick={onNavigate}
        title="Upgrade"
        className="mb-3 flex h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
      >
        <Crown className="h-5 w-5" />
      </Link>
    )
  }


  return (
    <div className={cn('mb-2.5 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-2.5 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10 dark:via-slate-900 dark:to-emerald-500/10 xl:mb-3 xl:p-3', mobile && 'mb-2 rounded-[22px] p-3')}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-500/20">
          <Crown className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950 dark:text-slate-50">Upgrade Paket</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Upgrade paket untuk buka semua fitur
          </p>
        </div>
      </div>
      <Link
        href={ctaHref}
        onClick={onNavigate}
        className={cn(buttonVariants({ size: 'sm' }), 'mt-2.5 h-8 w-full rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 xl:mt-3 xl:h-9', mobile && 'h-9 rounded-xl')}
      >
        Upgrade
      </Link>
    </div>
  )
}

function FooterActions({
  collapsed,
  isDark,
  userName,
  userEmail,
  userAvatar,
  onToggleTheme,
  onLogout,
  onCollapse,
  mobile = false,
}: {
  collapsed: boolean
  isDark: boolean
  userName: string
  userEmail: string
  userAvatar: string | null
  onToggleTheme: () => void
  onLogout: () => void
  onCollapse?: () => void
  mobile?: boolean
}) {
  if (mobile) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2 dark:bg-slate-950/40">
          <UserAvatar name={userName} imageUrl={userAvatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-slate-50">{userName || 'Pengguna'}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail || '-'}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onToggleTheme} className="h-10 rounded-2xl bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-800">
            {isDark ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            {isDark ? 'Gelap' : 'Terang'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onLogout} className="h-10 rounded-2xl bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 [@media(max-height:760px)]:rounded-2xl [@media(max-height:760px)]:border-transparent [@media(max-height:760px)]:bg-transparent [@media(max-height:760px)]:p-0 [@media(max-height:760px)]:shadow-none [@media(max-height:760px)]:dark:bg-transparent xl:p-2">
      <button
        type="button"
        onClick={onToggleTheme}
        className={cn(
          'flex h-9 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 [@media(max-height:760px)]:justify-center [@media(max-height:760px)]:rounded-xl [@media(max-height:760px)]:px-2 xl:h-10',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? `Tema: ${isDark ? 'dark' : 'light'}` : undefined}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {!collapsed && <span className="[@media(max-height:760px)]:hidden">{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>}
      </button>

      <Separator className="my-1.5 bg-slate-200 dark:bg-slate-800 [@media(max-height:760px)]:hidden xl:my-2" />

      <div className={cn('flex items-center gap-3 rounded-2xl px-3 py-1.5 [@media(max-height:760px)]:hidden xl:py-2', collapsed && 'justify-center px-2')}>
        <UserAvatar name={userName} imageUrl={userAvatar} size="md" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-slate-50">{userName || 'Pengguna'}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail || '-'}</p>
          </div>
        )}
      </div>

      <div className={cn('mt-1.5 grid gap-1.5 [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:grid-cols-2 xl:mt-2 xl:gap-2', collapsed ? 'grid-cols-1 [@media(max-height:760px)]:grid-cols-1' : 'grid-cols-2')}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            'h-9 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 [@media(max-height:760px)]:h-8 [@media(max-height:760px)]:rounded-xl [@media(max-height:760px)]:bg-slate-100/80 [@media(max-height:760px)]:dark:bg-slate-900 xl:h-10',
            collapsed && 'px-2'
          )}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2 [@media(max-height:760px)]:hidden">Keluar</span>}
        </Button>

        {onCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className={cn(
              'h-9 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 [@media(max-height:760px)]:h-8 [@media(max-height:760px)]:rounded-xl [@media(max-height:760px)]:bg-slate-100/80 [@media(max-height:760px)]:dark:bg-slate-900 xl:h-10',
              collapsed && 'px-2'
            )}
            title={collapsed ? 'Buka Sidebar' : undefined}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
            {!collapsed && <span className="ml-2 [@media(max-height:760px)]:hidden">Tutup</span>}
          </Button>
        )}
      </div>
    </div>
  )
}

type PlanDisplay = {
  key: string
  label: string
  badgeClass: string
}

function getDisplayPlan(membership: AuthMembership | null): PlanDisplay {
  if (!membership) return PLAN_DISPLAY.FREE

  if (membership.isTrial) {
    const trialEnd = membership.trialEndAt ? new Date(membership.trialEndAt) : null
    if (trialEnd && trialEnd <= new Date()) return PLAN_DISPLAY.TRIAL_EXPIRED
    return PLAN_DISPLAY.QUICK_TRIAL
  }

  const key = String(membership.plan || 'FREE').toUpperCase()
  return PLAN_DISPLAY[key] || PLAN_DISPLAY.FREE
}

const PLAN_DISPLAY: Record<string, PlanDisplay> = {
  QUICK_TRIAL: {
    key: 'QUICK_TRIAL',
    label: 'Quick Trial',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  TRIAL_EXPIRED: {
    key: 'TRIAL_EXPIRED',
    label: 'Trial Berakhir',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  FREE: {
    key: 'FREE',
    label: 'Free',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  PRO: {
    key: 'PRO',
    label: 'Pro',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  BUSINESS: {
    key: 'BUSINESS',
    label: 'Bisnis',
    badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  },
}
