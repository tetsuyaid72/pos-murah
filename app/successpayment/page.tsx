'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/pricing'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscriptionStore } from '@/stores/subscription-store'

const PLAN_LABELS = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
} as const

const METHOD_LABELS = {
  bank: 'Transfer Bank',
  qris: 'QRIS',
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
  const { isAuthenticated, isLoading, fetchAuth } = useAuthStore()
  const { paymentStatus, paymentDate, pendingPaymentSummary } = useSubscriptionStore()

  const planQuery = searchParams.get('plan')
  const methodQuery = searchParams.get('method')
  const amountQuery = Number(searchParams.get('amount') || 0)

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

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/register')
      return
    }

    if (!isLoading && isAuthenticated && paymentStatus !== 'pending') {
      router.replace('/pricing')
    }
  }, [isAuthenticated, isLoading, paymentStatus, router])

  if (isLoading || !isAuthenticated || paymentStatus !== 'pending') {
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
              Pembayaran Berhasil Dikirim
            </div>
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
              Jika pembayaran belum diverifikasi setelah 1x24 jam, silakan hubungi admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

