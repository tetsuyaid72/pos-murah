'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PartyPopper,
  Loader2,
  ShieldCheck,
  MessageCircle,
  Zap,
  Check,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { PLANS, formatPrice, PRICING, getYearlySavingsPercent } from '@/lib/pricing'
import type { BillingPeriod } from '@/lib/pricing'
import { UpgradePaymentPanel } from '@/components/upgrade/payment-panel'

const WHATSAPP_NUMBER = '6289691268646'

type SelectedPlan = 'basic' | 'pro' | 'business'

/**
 * Wrapper with Suspense boundary — required by Next.js 16 for useSearchParams()
 */
export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    }>
      <UpgradePageContent />
    </Suspense>
  )
}

function UpgradePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Determine initial plan from URL query param
  const planParam = searchParams.get('plan')
  const initialPlan: SelectedPlan = planParam === 'business' ? 'business' : planParam === 'basic' ? 'basic' : 'pro'

  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>(initialPlan)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [showSuccess, setShowSuccess] = useState(false)

  const { isAuthenticated, isLoading: authLoading, fetchAuth } = useAuthStore()
  const { userName, userEmail } = useSettingsStore()

  // Derived pricing
  const pricingKey = selectedPlan.toUpperCase() as 'BASIC' | 'PRO' | 'BUSINESS'
  const planInfo = PLANS[pricingKey]
  const pricing = PRICING[pricingKey]
  const currentPrice = billingPeriod === 'monthly' ? pricing.monthly : pricing.yearly
  const formattedPrice = formatPrice(currentPrice)
  const savings = getYearlySavingsPercent(pricingKey)
  const monthlyEquivalent = billingPeriod === 'yearly' ? Math.round(pricing.yearly / 12) : pricing.monthly

  // Fetch auth state on mount
  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  // Auto-redirect unauthenticated users to register
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/register?redirect=/upgrade')
    }
  }, [authLoading, isAuthenticated, router])

  const {
    plan,
    paymentStatus,
    submitPayment,
  } = useSubscriptionStore()

  // Check if server has approved the payment (poll /api/auth/me)
  useEffect(() => {
    if (paymentStatus !== 'pending') return

    const checkServerApproval = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        if (data.membership?.plan === 'BASIC' || data.membership?.plan === 'PRO' || data.membership?.plan === 'BUSINESS') {
          useSubscriptionStore.getState().syncFromServer(data.membership.plan)
          setShowSuccess(true)
        }
      } catch {
        // Ignore network errors
      }
    }

    const timeout = setTimeout(checkServerApproval, 2000)
    const interval = setInterval(checkServerApproval, 30_000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [paymentStatus])

  const buildWhatsAppUrl = () => {
    const planLabel = selectedPlan === 'business' ? 'Business' : selectedPlan === 'pro' ? 'Pro' : 'Basic'
    const periodLabel = billingPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'

    const message = `Halo admin, saya ingin konfirmasi pembayaran ${planLabel} (${periodLabel}) POS.

Nama: ${userName || 'User'}
Email: ${userEmail || '-'}
Paket: ${planLabel} (${periodLabel})
Nominal: ${formattedPrice}

Mohon konfirmasi ya. Terima kasih!`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  // =========================================================================
  // STATE: Loading auth / redirecting unauthenticated user
  // =========================================================================
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  // =========================================================================
  // STATE: Already approved (paid)
  // =========================================================================
  if (plan && paymentStatus === 'approved') {
    const activePlanKey = plan.toUpperCase() as 'BASIC' | 'PRO' | 'BUSINESS'
    const activePlanInfo = PLANS[activePlanKey]

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-xl px-6 pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <div className="mx-auto max-w-xl px-6 py-20">
          <div className="text-center">
            <div className={cn(
              'mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 transition-all duration-700',
              showSuccess ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            )}>
              <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Paket {activePlanInfo.name} Aktif
            </h1>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              Semua fitur {activePlanInfo.name} telah diaktifkan untuk akun Anda.
            </p>

            <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="space-y-3">
                {activePlanInfo.features.slice(0, 5).map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <Link href="/dashboard">
                <Button variant="premium" size="lg" className="px-10 text-base">
                  Buka Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STATE: Payment Pending
  // =========================================================================
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-xl px-6 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>

        <div className="mx-auto max-w-xl px-6 py-20">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10">
              <Clock className="h-10 w-10 text-amber-500 dark:text-amber-400 animate-pulse" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Menunggu Verifikasi
            </h1>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              Pembayaran Anda sedang diproses. Aktivasi maksimal 1x24 jam.
            </p>

            <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-amber-100 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-center justify-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Pembayaran sedang diverifikasi
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Anda akan mendapat notifikasi setelah akun diaktifkan.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" size="lg" className="w-full max-w-sm mx-auto text-sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hubungi Admin via WhatsApp
                </Button>
              </a>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Jika sudah lebih dari 24 jam, silakan hubungi admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STATE: Default — Split Layout Upgrade Page
  // =========================================================================

  // Key benefits (short, focused)
  const KEY_BENEFITS = selectedPlan === 'business'
    ? [
        'Unlimited produk & transaksi',
        'Multi-toko / outlet',
        'Unlimited kasir & pelanggan',
        'Prediksi stok + jam ramai',
        'API access & webhook',
      ]
    : selectedPlan === 'basic'
    ? [
        '50 produk & 300 transaksi/bulan',
        'Dashboard + grafik profit',
        'Cetak struk Bluetooth',
        'Export Excel',
        'WhatsApp support',
      ]
    : [
        '500 produk & 3.000 transaksi/bulan',
        '5 kasir + shift management',
        'Promo & voucher otomatis',
        'Laporan per kasir & kategori',
        'Priority support',
      ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Top bar */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Main split layout */}
      <div className="mx-auto max-w-7xl lg:px-12">
        <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-2">

          {/* ============================================================= */}
          {/* LEFT COLUMN — Value Proposition */}
          {/* ============================================================= */}
          <div className="flex flex-col justify-center px-6 py-12 lg:pr-16 lg:py-20">
            {/* Plan badge */}
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-500/10">
              <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Paket {planInfo.name}
              </span>
              {planInfo.popular && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  Populer
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-tight dark:text-white">
              Upgrade ke {planInfo.name}
            </h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-md">
              Akses fitur lengkap untuk mengembangkan bisnis Anda tanpa batas.
            </p>

            {/* Price */}
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                {formatPrice(monthlyEquivalent)}
              </span>
              <span className="text-base text-slate-400 dark:text-slate-500">/ bulan</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                Ditagih {formattedPrice}/tahun — hemat {savings}%
              </p>
            )}

            {/* Billing toggle */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  billingPeriod === 'monthly'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Bulanan
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  billingPeriod === 'yearly'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Tahunan
                {savings > 0 && (
                  <span className="ml-1.5 text-xs text-emerald-600 font-bold dark:text-emerald-400">-{savings}%</span>
                )}
              </button>
            </div>

            {/* Key benefits */}
            <div className="mt-10 space-y-4">
              {KEY_BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-base text-slate-700 dark:text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Plan switcher — segmented pill */}
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Pilih Paket
              </p>
              <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
                {([
                  { key: 'basic' as SelectedPlan, label: 'Basic' },
                  { key: 'pro' as SelectedPlan, label: 'Pro', popular: true },
                  { key: 'business' as SelectedPlan, label: 'Business' },
                ]).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedPlan(item.key)}
                    className={cn(
                      'relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200',
                      selectedPlan === item.key
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02] dark:bg-emerald-600'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    )}
                  >
                    {item.label}
                    {item.popular && selectedPlan !== 'pro' && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        Populer
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Dipakai 1.200+ UMKM</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Garansi 7 hari uang kembali</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Tanpa kontrak, batal kapan saja</span>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT COLUMN — Payment Section */}
          {/* ============================================================= */}
          <div className="flex flex-col justify-center border-t border-slate-100 bg-slate-50/50 px-6 py-12 lg:border-l lg:border-t-0 lg:px-12 lg:py-20 dark:border-slate-800 dark:bg-slate-900/30">
            <UpgradePaymentPanel
              selectedPlan={selectedPlan}
              billingPeriod={billingPeriod}
              userName={userName}
              userEmail={userEmail}
              onSubmitPayment={submitPayment}
            />
          </div>
        </div>
      </div>

      {/* Success notification toast */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-6 py-4 shadow-xl dark:border-emerald-800 dark:bg-slate-900">
            <PartyPopper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Pembayaran berhasil! Paket telah aktif
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
