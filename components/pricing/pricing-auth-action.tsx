'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PricingAuthAction() {
  const { user, isAuthenticated, isLoading, fetchAuth, logout } = useAuthStore()

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  if (isLoading) {
    return <div className="h-9 w-20 rounded-2xl bg-emerald-50/80" />
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

  const fallbackInitial = user.name?.charAt(0) || user.email.charAt(0) || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Buka menu akun"
          className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-white text-sm font-bold uppercase text-emerald-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-emerald-200 hover:shadow-[0_14px_32px_rgba(16,185,129,0.16)]"
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || user.email}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            fallbackInitial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block truncate text-sm font-bold text-slate-900">{user.name}</span>
          <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
