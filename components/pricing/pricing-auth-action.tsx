'use client'

import Link from 'next/link'
import { HelpCircle, LogOut, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggleButton } from '@/components/theme-toggle-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PricingAuthAction() {
  const router = useRouter()
  const { user, membership, isAuthenticated, isLoading, fetchAuth, logout } = useAuthStore()

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  if (isLoading) {
    return (
      <div className="relative z-[9999] flex items-center gap-3">
        <ThemeToggleButton />
        <div className="h-8 w-20 rounded-full bg-slate-100" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="relative z-[9999] flex items-center gap-3">
        <ThemeToggleButton />
        <Link
          href="/login"
          className="rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(16,185,129,0.24)] transition-colors hover:bg-emerald-700 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Log in
        </Link>
      </div>
    )
  }

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.avatarUrl ||
    null
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.name ||
    user.email?.split('@')[0] ||
    'User'
  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const isApprovedPaid = Boolean(membership && !membership.isTrial)
  const plan = isApprovedPaid ? membership?.plan?.toUpperCase() : 'FREE'
  const badgeLabel = plan === 'BUSINESS' ? 'Bisnis' : plan === 'PRO' ? 'Pro' : 'Free'
  const badgeClass =
    plan === 'BUSINESS'
      ? 'bg-amber-50 text-amber-700'
      : plan === 'PRO'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-[#f3f4f6] text-[#6b7280]'

  return (
    <div className="relative z-[9999] flex items-center gap-3">
      <ThemeToggleButton />
      <span className={`rounded-full px-2 py-1 text-[12px] font-semibold leading-none ${badgeClass}`}>
        {badgeLabel}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Buka menu akun" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
            <Avatar className="h-8 w-8 border border-slate-200 bg-slate-100">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className="z-[9999] w-[260px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl sm:w-[220px] sm:rounded-xl sm:p-1 sm:shadow-lg"
        >
          <DropdownMenuLabel className="px-3 py-2.5 normal-case tracking-normal sm:py-3">
            <span className="block truncate text-sm font-semibold leading-5 text-popover-foreground">{displayName}</span>
            <span className="mt-0.5 block truncate text-xs font-normal leading-5 text-muted-foreground sm:text-[13px]">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1 bg-border" />
          <DropdownMenuItem onClick={() => router.push('/settings')} className="h-9 gap-2 rounded-xl px-3 text-sm text-popover-foreground hover:bg-muted sm:h-10 sm:rounded-lg">
            <Settings className="h-4 w-4" />
            Pengaturan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/')} className="h-9 gap-2 rounded-xl px-3 text-sm text-popover-foreground hover:bg-muted sm:h-10 sm:rounded-lg">
            <HelpCircle className="h-4 w-4" />
            Bantuan
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-border" />
          <DropdownMenuItem onClick={logout} className="h-9 gap-2 rounded-xl px-3 text-sm text-popover-foreground hover:bg-muted sm:h-10 sm:rounded-lg">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
