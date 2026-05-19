'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Crown, Package, Receipt, User, Users } from 'lucide-react'
import { PublicHeader } from '@/components/public-header'
import { useAuthStore } from '@/stores/auth-store'
import { getUserAvatar } from '@/lib/avatar'

interface UsageData {
  plan: string
  isTrialActive: boolean
  isTrialExpired?: boolean
  usage: {
    products: { current: number; limit: number }
    transactions: { current: number; limit: number; periodLabel: string }
    customers: { current: number; limit: number }
  }
}

function LandingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(15,23,42,0)_58%)]" />
      <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] dark:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]" />
    </div>
  )
}

function formatLimit(limit?: number) {
  if (typeof limit !== 'number') return '-'
  if (limit >= 999999) return 'Unlimited'
  return limit.toLocaleString('id-ID')
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="truncate text-right text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  )
}

function UsageLine({
  icon: Icon,
  label,
  current,
  limit,
  suffix,
}: {
  icon: typeof Package
  label: string
  current?: number
  limit?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{label}</p>
          {suffix && <p className="text-[11px] text-slate-500 dark:text-slate-400">{suffix}</p>}
        </div>
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {(current ?? 0).toLocaleString('id-ID')} / {formatLimit(limit)}
      </p>
    </div>
  )
}

export default function AccountSettingsPage() {
  const { user, store, membership, isAuthenticated, isLoading, fetchAuth } = useAuthStore()
  const [usage, setUsage] = useState<UsageData | null>(null)

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  useEffect(() => {
    if (!isAuthenticated) return

    fetch('/api/plan/usage')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUsage(data))
      .catch(() => setUsage(null))
  }, [isAuthenticated])

  const avatarUrl = useMemo(() => getUserAvatar(user), [user])
  const isTrialExpired = Boolean(
    membership?.isTrial && membership.trialEndAt && new Date(membership.trialEndAt) <= new Date()
  )
  const planLabel = membership?.isTrial
    ? isTrialExpired ? 'Trial Berakhir' : 'Masa Trial'
    : membership?.plan || usage?.plan || 'Free'

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
        <LandingBackground />
        <div className="relative mx-auto max-w-4xl">
          <PublicHeader />
        </div>
        <div className="relative mx-auto flex min-h-[60vh] max-w-md items-center justify-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Memuat data...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#F8FAFC] px-4 dark:bg-slate-950">
        <LandingBackground />
        <div className="relative w-full max-w-sm rounded-3xl bg-white/90 p-6 text-center shadow-sm dark:bg-slate-900/80">
          <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">Login diperlukan</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Masuk dulu untuk melihat pengaturan akun.</p>
          <Link href="/login" className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
            Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <LandingBackground />

      <div className="relative mx-auto max-w-4xl">
        <PublicHeader />
      </div>

      <div className="relative mx-auto max-w-md py-6 sm:py-8">
        <div className="space-y-3">
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-50">Plan & Penggunaan</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Status dan limit akun</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {planLabel}
              </span>
            </div>
            <div className="space-y-2">
              <UsageLine icon={Package} label="Produk" current={usage?.usage.products.current} limit={usage?.usage.products.limit} />
              <UsageLine icon={Receipt} label="Transaksi" current={usage?.usage.transactions.current} limit={usage?.usage.transactions.limit} suffix={usage?.usage.transactions.periodLabel || 'hari ini'} />
              <UsageLine icon={Users} label="Pelanggan" current={usage?.usage.customers.current} limit={usage?.usage.customers.limit} />
            </div>
          </section>

          <section className="rounded-3xl bg-emerald-600 p-4 text-white shadow-sm dark:bg-emerald-500/15 dark:text-emerald-50 dark:ring-1 dark:ring-emerald-500/25">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Crown className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-black">Upgrade Plan</h2>
                <p className="mt-1 text-sm leading-5 text-emerald-50">Buka limit lebih besar dan lanjutkan penggunaan POS.</p>
              </div>
            </div>
            <Link href="/pricing" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white text-sm font-black text-emerald-700 dark:bg-emerald-500 dark:text-white">
              Lihat Paket Upgrade
            </Link>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={user.name || user.email} className="h-14 w-14 rounded-full border border-slate-100 object-cover dark:border-slate-700" referrerPolicy="no-referrer" />
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-900 dark:text-slate-50">{user.name || 'User'}</h2>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <InfoLine label="Nama" value={user.name || '-'} />
              <InfoLine label="Email" value={user.email || '-'} />
              <InfoLine label="Toko" value={store?.name || '-'} />
              <InfoLine label="Role" value={user.role || '-'} />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <User className="h-4 w-4 text-emerald-600" />
              Profil ini hanya ringkasan akun. Pengaturan toko lengkap tetap ada di dashboard.
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
