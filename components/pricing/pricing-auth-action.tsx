'use client'

import Link from 'next/link'
import { HelpCircle, LogOut, Moon, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  const { resolvedTheme, setTheme } = useTheme()
  const { user, membership, isAuthenticated, isLoading, fetchAuth, logout } = useAuthStore()

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  if (isLoading) {
    return <div className="h-8 w-24 rounded-full bg-slate-100" />
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(16,185,129,0.24)] transition-colors hover:bg-emerald-700 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        Log in
      </Link>
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
    <div className="flex items-center gap-2">
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
          sideOffset={10}
          className="w-[220px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-lg"
        >
          <DropdownMenuLabel className="px-3 py-3 normal-case tracking-normal">
            <span className="block truncate text-[14px] font-bold leading-5 text-[#111827]">{displayName}</span>
            <span className="mt-0.5 block truncate text-[13px] font-normal leading-5 text-[#6b7280]">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1 bg-[#e5e7eb]" />
          <DropdownMenuItem onClick={() => router.push('/settings')} className="h-10 gap-2 rounded-lg px-3 text-[14px] text-[#374151] hover:bg-[#f9fafb]">
            <Settings className="h-4 w-4" />
            Pengaturan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/')} className="h-10 gap-2 rounded-lg px-3 text-[14px] text-[#374151] hover:bg-[#f9fafb]">
            <HelpCircle className="h-4 w-4" />
            Bantuan
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="h-10 gap-2 rounded-lg px-3 text-[14px] text-[#374151] hover:bg-[#f9fafb]"
          >
            <Moon className="h-4 w-4" />
            Dark mode
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-[#e5e7eb]" />
          <DropdownMenuItem onClick={logout} className="h-10 gap-2 rounded-lg px-3 text-[14px] text-[#374151] hover:bg-[#f9fafb]">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
