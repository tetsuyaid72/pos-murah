'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ImagePlus, Store, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { useSubscriptionStore } from '@/stores/subscription-store'

const plans = {
  pro: {
    name: 'Pro',
    price: 'Rp49K',
    amount: 49000,
    apiPlan: 'PRO',
    billingPeriod: 'monthly',
    summaryPlan: 'pro',
    description: 'Langganan bulanan untuk fitur utama POS.',
    accessLabel: 'Langganan bulanan',
  },
  bisnis: {
    name: 'Bisnis',
    price: 'Rp199K',
    amount: 199000,
    apiPlan: 'BUSINESS',
    billingPeriod: 'lifetime',
    summaryPlan: 'business',
    description: 'Promo lifetime: sekali bayar untuk akses selamanya.',
    accessLabel: 'Lifetime / sekali bayar',
    badge: 'Promo Lifetime',
  },
} as const

function getSelectedPlan(plan: string | null) {
  if (plan === 'business' || plan === 'bisnis') {
    return plans.bisnis
  }

  return plans.pro
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlan = getSelectedPlan(searchParams.get('plan'))
  const autoPayment = searchParams.get('auto') === 'midtrans'
  const { toast } = useToast()
  const { submitPayment } = useSubscriptionStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoRedirectStarted = useRef(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMidtransLoading, setIsMidtransLoading] = useState(false)

  const handleProofChange = (file: File | null) => {
    setUploadError(null)
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Format file harus JPG, PNG, atau WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 2MB.')
      return
    }
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const handleRemoveProof = () => {
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(null)
    setProofPreview(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadProof = async () => {
    if (!proofFile) return null
    const formData = new FormData()
    formData.append('file', proofFile)
    formData.append('type', 'payment')

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Upload bukti pembayaran gagal.')
    }
    return data.url as string
  }

  const handleMidtransClick = useCallback(async () => {
    setIsMidtransLoading(true)
    setUploadError(null)
    try {
      const res = await fetch('/api/payments/midtrans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan.apiPlan,
          billingPeriod: selectedPlan.billingPeriod,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        throw new Error(data.error || 'Gagal membuat pembayaran Midtrans.')
      }
      if (!data.redirectUrl) {
        throw new Error('Link pembayaran Midtrans tidak tersedia.')
      }
      window.location.href = data.redirectUrl
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Gagal membuka pembayaran Midtrans.')
    } finally {
      setIsMidtransLoading(false)
    }
  }, [router, selectedPlan.apiPlan, selectedPlan.billingPeriod])

  useEffect(() => {
    if (!autoPayment || autoRedirectStarted.current) return
    autoRedirectStarted.current = true
    handleMidtransClick()
  }, [autoPayment, handleMidtransClick])

  const handlePaidClick = async () => {
    if (!proofFile) {
      setUploadError('Wajib upload bukti pembayaran terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    setUploadError(null)
    try {
      const proofUrl = await uploadProof()
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'QRIS',
          proofUrl,
          plan: selectedPlan.apiPlan,
          billingPeriod: selectedPlan.billingPeriod,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pembayaran.')
      }

      submitPayment({
        plan: selectedPlan.summaryPlan,
        method: 'qris',
        amount: selectedPlan.amount,
      })
      toast('Bukti pembayaran berhasil dikirim. Admin akan memverifikasi pembayaran Anda.', 'success')
      router.push(`/successpayment?plan=${selectedPlan.summaryPlan}&method=qris&amount=${selectedPlan.amount}`)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Gagal mengirim bukti pembayaran.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (autoPayment) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 text-slate-950">
        <Card className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/90 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <CardHeader className="items-center p-7">
            <CardTitle className="text-2xl font-black tracking-[-0.035em] text-slate-950">
              Mohon tunggu !!!
            </CardTitle>
            <CardDescription className="max-w-sm text-sm leading-6 text-slate-500">
              Sedang menyiapkan halaman pembayaran untuk paket {selectedPlan.name}.
            </CardDescription>
            {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
            {uploadError && (
              <div className="mt-4 grid w-full gap-3 sm:grid-cols-2">
                <Button onClick={handleMidtransClick} disabled={isMidtransLoading} className="h-11 rounded-2xl bg-slate-950 font-bold text-white hover:bg-slate-800">
                  Coba Lagi
                </Button>
                <Link href={`/payment?plan=${selectedPlan.summaryPlan}`} className="w-full">
                  <Button variant="outline" className="h-11 w-full rounded-2xl border-slate-200 bg-white/80 font-bold text-slate-800">
                    Bayar Manual
                  </Button>
                </Link>
              </div>
            )}
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1200px] flex-col">
        <header className="relative left-1/2 flex h-14 w-screen -translate-x-1/2 items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)] sm:h-9 sm:w-9 sm:rounded-2xl">
              <Store className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <span className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Warung Madura <span className="text-emerald-600">POS</span>
            </span>
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/70 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <Card className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/90 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:max-w-lg">
            <CardHeader className="items-center p-5 pb-4 sm:p-7 sm:pb-5">
              <Badge className="border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700">
                Pembayaran Manual QRIS
              </Badge>
              <CardTitle className="mt-3 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                Selesaikan Pembayaran Manual
              </CardTitle>
              <CardDescription className="max-w-sm text-sm leading-6 text-slate-500">
                Scan QRIS lalu upload bukti pembayaran. Admin akan memverifikasi sebelum paket aktif.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 p-5 pt-0 sm:p-7 sm:pt-0">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <p className="text-sm font-semibold text-emerald-700">Paket {selectedPlan.name}</p>
                  <Badge className="border border-emerald-200 bg-white text-emerald-700">{selectedPlan.accessLabel}</Badge>
                  {'badge' in selectedPlan && selectedPlan.badge && (
                    <Badge className="bg-emerald-600 text-white">{selectedPlan.badge}</Badge>
                  )}
                </div>
                <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  {selectedPlan.price}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPlan.description}</p>
              </div>

              <Button
                onClick={handleMidtransClick}
                disabled={isMidtransLoading}
                className="h-11 w-full rounded-2xl bg-slate-950 font-bold text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isMidtransLoading ? 'Mohon tunggu !!!' : 'Bayar Otomatis'}
              </Button>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs font-medium leading-5 text-amber-800">
                Pembayaran ini diverifikasi manual oleh admin. Setelah bukti pembayaran valid, paket Anda akan diaktifkan.
              </div>

              <div className="mx-auto flex w-full max-w-[290px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:max-w-[320px] sm:p-5">
                <Image
                  src="/qris.png"
                  alt="QRIS pembayaran Warung Madura POS"
                  width={260}
                  height={260}
                  priority
                  className="h-auto w-full max-w-[240px] rounded-xl object-contain sm:max-w-[260px]"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/75 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">Upload bukti pembayaran manual</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Format JPG, PNG, atau WebP. Maksimal 2MB. Verifikasi dilakukan oleh admin.</p>
                  </div>
                </div>

                {proofPreview ? (
                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <Image
                      src={proofPreview}
                      alt="Preview bukti pembayaran"
                      width={420}
                      height={260}
                      className="max-h-64 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:text-red-600"
                      aria-label="Hapus bukti pembayaran"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50">
                    <ImagePlus className="h-6 w-6 text-emerald-600" />
                    <span className="mt-2 text-sm font-semibold text-slate-800">Pilih gambar bukti pembayaran</span>
                    <span className="mt-1 text-xs text-slate-500">Klik untuk upload dari perangkat</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => handleProofChange(event.target.files?.[0] || null)}
                    />
                  </label>
                )}

                {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={handlePaidClick}
                  disabled={isSubmitting}
                  className="h-11 rounded-2xl bg-emerald-600 font-bold text-white shadow-[0_14px_32px_rgba(16,185,129,0.22)] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Bayar'}
                </Button>
                <Link href="/pricing" className="w-full">
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-slate-200 bg-white/80 font-bold text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/70"
                  >
                    Ganti Paket
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <PaymentContent />
      </Suspense>
    </ToastProvider>
  )
}
