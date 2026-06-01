'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/pricing'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'

const PLAN_LABELS = {
  free: 'Free',
  trial: 'Trial',
  pro: 'Pro',
  business: 'Business',
} as const

const METHOD_LABELS = {
  bank: 'Transfer Bank',
  qris: 'QRIS',
  midtrans: 'Pembayaran Otomatis',
} as const

export default function SuccessPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      }
    >
      <SuccessPaymentContent />
    </Suspense>
  )
}

function SuccessPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, fetchAuth, membership } = useAuthStore()
  const { paymentStatus, paymentDate, pendingPaymentSummary } = useSubscriptionStore()

  const planQuery = searchParams.get('plan')
  const methodQuery = searchParams.get('method')
  const amountQuery = Number(searchParams.get('amount') || 0)

  const isMidtransPayment = methodQuery === 'midtrans'
  const planParam = (planQuery || pendingPaymentSummary?.plan || 'pro').toLowerCase() as keyof typeof PLAN_LABELS
  const methodParam = (methodQuery || pendingPaymentSummary?.method || 'bank').toLowerCase() as keyof typeof METHOD_LABELS
  const amountParam = amountQuery > 0 ? amountQuery : pendingPaymentSummary?.amount || 0

  const planLabel = PLAN_LABELS[planParam] || 'Pro'
  const methodLabel = METHOD_LABELS[methodParam] || 'Transfer Bank'
  const formattedAmount = amountParam > 0 ? formatPrice(amountParam) : '-'
  const submittedAt = paymentDate
    ? new Date(paymentDate)
    : pendingPaymentSummary?.submittedAt
      ? new Date(pendingPaymentSummary.submittedAt)
      : null

  // For Midtrans payments: poll to sync membership activation
  const [isSyncing, setIsSyncing] = useState(isMidtransPayment)
  const [syncMessage, setSyncMessage] = useState(
    isMidtransPayment ? 'Mengecek status pembayaran...' : ''
  )
  const syncAttemptRef = useRef(0)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  /**
   * For Midtrans payments, we poll /api/plan/sync to ensure the membership
   * gets activated even if the webhook hasn't fired yet.
   */
  const pollSyncStatus = useCallback(async () => {
    const MAX_ATTEMPTS = 5
    const POLL_INTERVAL_MS = 3000

    if (syncAttemptRef.current >= MAX_ATTEMPTS) {
      setIsSyncing(false)
      setSyncMessage('')
      return
    }

    syncAttemptRef.current += 1
    setSyncMessage(`Mengecek status pembayaran... (${syncAttemptRef.current}/${MAX_ATTEMPTS})`)

    try {
      const res = await fetch('/api/plan/sync', { method: 'POST' })
      const data = await res.json().catch(() => ({}))

      if (data.activated || data.alreadyActive) {
        setIsSyncing(false)
        setSyncMessage('Paket berhasil diaktifkan!')
        // Re-fetch auth to update membership in store
        await fetchAuth()
        return
      }
    } catch {
      // Ignore, will retry
    }

    // Retry after delay
    syncTimerRef.current = setTimeout(pollSyncStatus, POLL_INTERVAL_MS)
  }, [fetchAuth])

  // Start polling when Midtrans payment and authenticated
  useEffect(() => {
    if (!isMidtransPayment || isLoading || !isAuthenticated) return

    // Check if membership is already active
    if (membership) {
      const now = new Date()
      const isTrialActive = membership.isTrial && membership.trialEndAt && new Date(membership.trialEndAt) > now
      const isPaidActive = !membership.isTrial && membership.plan !== 'FREE' && (
        !membership.subscriptionEndAt || new Date(membership.subscriptionEndAt) > now
      )
      if (isTrialActive || isPaidActive) {
        setIsSyncing(false)
        setSyncMessage('Paket berhasil diaktifkan!')
        return
      }
    }

    pollSyncStatus()

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [isMidtransPayment, isLoading, isAuthenticated, membership, pollSyncStatus])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/register')
      return
    }

    // For non-Midtrans payments, redirect to pricing if there's no pending payment
    if (!isLoading && isAuthenticated && !isMidtransPayment && paymentStatus !== 'pending') {
      router.replace('/pricing')
    }
  }, [isAuthenticated, isLoading, isMidtransPayment, paymentStatus, router])

  if (isLoading || !isAuthenticated || (!isMidtransPayment && paymentStatus !== 'pending')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f3fff7_0%,#ffffff_55%)] text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              {isMidtransPayment ? 'Pembayaran Diproses' : 'Pembayaran Berhasil Dikirim'}
            </div>

            {isMidtransPayment && isSyncing && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{syncMessage}</span>
              </div>
            )}

            {isMidtransPayment && !isSyncing && syncMessage && (
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ringkasan Pembayaran
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Paket</span>
                <span className="font-semibold text-slate-900">{planLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Metode</span>
                <span className="font-semibold text-slate-900">{methodLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-emerald-50 px-4 py-3">
                <span className="text-emerald-700">Nominal</span>
                <span className="font-semibold text-emerald-700">{formattedAmount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Dikirim pada</span>
                <span className="font-semibold text-slate-900">
                  {submittedAt
                    ? submittedAt.toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link href="/dashboard" className="block">
                <Button variant="premium" size="xl" className="w-full">
                  Kembali ke Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              {isMidtransPayment
                ? 'Status paket akan aktif otomatis setelah pembayaran dikonfirmasi.'
                : 'Jika pembayaran belum diverifikasi setelah 1x24 jam, silakan hubungi admin.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
