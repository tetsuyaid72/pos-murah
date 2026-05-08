'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  Copy,
  CheckCircle2,
  CreditCard,
  QrCode,
  MessageCircle,
  Zap,
  Clock,
  PartyPopper,
  Loader2,
  ShieldCheck,
  Upload,
  ImageIcon,
  X,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { PLANS, PRICING, formatPrice, getYearlySavingsPercent } from '@/lib/pricing'
import type { BillingPeriod } from '@/lib/pricing'

const BANK_INFO = {
  bank: 'BCA',
  accountNumber: '7896118152',
  accountName: 'MUHAMMAD HASBUNA',
}

const WHATSAPP_NUMBER = '6289691268646'
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

type SelectedPlan = 'basic' | 'pro' | 'business'

/**
 * Wrapper with Suspense boundary — required by Next.js 16 for useSearchParams()
 */
export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/20">
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
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'bank' | 'qris'>('bank')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isAuthenticated, isLoading: authLoading, fetchAuth } = useAuthStore()
  const { userName, userEmail } = useSettingsStore()

  // Derived pricing
  const pricingKey = selectedPlan === 'business' ? 'BUSINESS' : selectedPlan === 'pro' ? 'PRO' : 'BASIC'
  const currentPricing = PRICING[pricingKey]
  const currentPrice = billingPeriod === 'monthly' ? currentPricing.monthly : currentPricing.yearly
  const formattedPrice = formatPrice(currentPrice)
  const planInfo = PLANS[pricingKey]
  const savings = billingPeriod === 'yearly' ? getYearlySavingsPercent(pricingKey) : 0

  // Fetch auth state on mount (to know if user is logged in)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)

    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const handleRemoveFile = () => {
    setProofFile(null)
    setProofPreview(null)
    setProofUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadProof = async (): Promise<string | null> => {
    if (!proofFile) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      formData.append('type', 'payment')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload gagal')
      }

      const data = await res.json()
      setProofUrl(data.url)
      return data.url
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload gagal')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const buildWhatsAppUrl = (imageUrl: string | null) => {
    const now = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
    const fullImageUrl = imageUrl
      ? (imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`)
      : '(tidak ada)'

    const planLabel = selectedPlan === 'business' ? 'Business' : selectedPlan === 'pro' ? 'Pro' : 'Basic'
    const periodLabel = billingPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'

    const message = `Halo admin, saya sudah melakukan pembayaran ${planLabel} (${periodLabel}) POS.

Nama: ${userName || 'User'}
Email: ${userEmail || '-'}
Paket: ${planLabel} (${periodLabel})
Nominal: ${formattedPrice}
Tanggal: ${now}

Bukti pembayaran:
${fullImageUrl}

Mohon konfirmasi ya. Terima kasih!`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const handleSubmitPayment = async () => {
    if (!proofFile) {
      setUploadError('Wajib upload bukti pembayaran terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    setUploadError(null)

    try {
      const uploadedUrl = await uploadProof()

      if (!uploadedUrl) {
        setUploadError('Upload bukti pembayaran gagal. Silakan coba lagi.')
        setIsSubmitting(false)
        return
      }

      try {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: activeTab === 'qris' ? 'QRIS' : 'BANK_TRANSFER',
            proofUrl: uploadedUrl,
            plan: selectedPlan.toUpperCase(),
            billingPeriod,
            amount: currentPrice,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (res.status !== 409 && res.status !== 401) {
            console.warn('Payment API error:', data.error)
          }
        }
      } catch {
        // API not available, continue with local state
      }

      submitPayment()

      const waUrl = buildWhatsAppUrl(uploadedUrl)
      window.open(waUrl, '_blank')
    } catch {
      setUploadError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // =========================================================================
  // STATE: Loading auth / redirecting unauthenticated user
  // =========================================================================
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  // =========================================================================
  // STATE: Already PRO or STARTER (paid)
  // =========================================================================
  if (plan && paymentStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/20">
        <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <div className={cn(
              'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 transition-all duration-700',
              showSuccess ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            )}>
              <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Paket <span className="gradient-text">{plan === 'business' ? 'Business' : plan === 'pro' ? 'Pro' : 'Basic'}</span> Aktif
            </h1>
            <p className="mt-3 text-muted-foreground">
              Semua fitur {plan === 'business' ? 'Business' : plan === 'pro' ? 'Pro' : 'Basic'} telah diaktifkan untuk akun Anda.
            </p>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="grid grid-cols-2 gap-3">
                {(plan === 'business' ? PLANS.BUSINESS : plan === 'pro' ? PLANS.PRO : PLANS.BASIC).features.slice(0, 6).map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell to next tier */}
            {plan === 'basic' && (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Butuh fitur lebih? <Link href="/upgrade?plan=pro" className="font-medium text-primary hover:underline">Upgrade ke Pro</Link> untuk multi-kasir + promo otomatis.
                </p>
              </div>
            )}
            {plan === 'pro' && (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Butuh multi-toko? <Link href="/upgrade?plan=business" className="font-medium text-primary hover:underline">Upgrade ke Business</Link> untuk unlimited semua.
                </p>
              </div>
            )}

            <div className="mt-8">
              <Link href="/dashboard">
                <Button variant="premium" size="lg" className="text-base px-8">
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-background to-background dark:from-amber-950/20">
        <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
              <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Menunggu Verifikasi
            </h1>
            <p className="mt-3 text-muted-foreground">
              Pembayaran Anda sedang diproses. Aktivasi maksimal 1x24 jam.
            </p>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Pembayaran sedang diverifikasi
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Anda akan mendapat notifikasi setelah akun diaktifkan.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <a href={buildWhatsAppUrl(null)} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" size="lg" className="w-full max-w-sm mx-auto">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hubungi Admin via WhatsApp
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">
                Jika sudah lebih dari 24 jam, silakan hubungi admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STATE: Default — Payment Form
  // =========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/20">
      {/* Back navigation */}
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/10">
            <Zap className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Upgrade ke <span className="gradient-text">{selectedPlan === 'business' ? 'Business' : selectedPlan === 'pro' ? 'Pro' : 'Basic'}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Aktifkan fitur lengkap untuk bisnis Anda
          </p>
        </div>

        {/* Plan selector */}
        <div className="mt-8">
          <div className="flex rounded-xl border border-border/50 bg-muted/50 p-1">
            <button
              onClick={() => setSelectedPlan('basic')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                selectedPlan === 'basic'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Basic
            </button>
            <button
              onClick={() => setSelectedPlan('pro')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                selectedPlan === 'pro'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Zap className="h-4 w-4" />
              Pro
            </button>
            <button
              onClick={() => setSelectedPlan('business')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                selectedPlan === 'business'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Business
            </button>
          </div>
        </div>

        {/* Billing period toggle */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              billingPeriod === 'monthly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Bulanan
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              billingPeriod === 'yearly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Tahunan
            {savings > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center rounded-full bg-emerald-500 px-1 py-0.5 text-[9px] font-bold text-white">
                -{savings}%
              </span>
            )}
          </button>
        </div>

        {/* Plan info card */}
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Paket {planInfo.name}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{formattedPrice}</span>
                <span className="text-sm text-muted-foreground">
                  / {billingPeriod === 'monthly' ? 'bulan' : 'tahun'}
                </span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  = {formatPrice(Math.round(currentPrice / 12))}/bulan (hemat {savings}%)
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {planInfo.features.slice(0, 6).map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span className="text-xs text-foreground">{feature}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Payment method tabs */}
        <div className="mt-8">
          <div className="flex rounded-xl border border-border/50 bg-muted/50 p-1">
            <button
              onClick={() => setActiveTab('bank')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === 'bank'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CreditCard className="h-4 w-4" />
              Transfer Bank
            </button>
            <button
              onClick={() => setActiveTab('qris')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === 'qris'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <QrCode className="h-4 w-4" />
              QRIS
            </button>
          </div>

          {/* Transfer Bank */}
          {activeTab === 'bank' && (
            <div className="mt-5 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Bank</p>
                    <p className="text-sm font-semibold text-foreground">{BANK_INFO.bank}</p>
                  </div>
                  <div className="flex h-8 w-12 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white">
                    BCA
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">No. Rekening</p>
                    <p className="text-lg font-bold tracking-wider text-foreground">
                      {BANK_INFO.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      copied
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Atas Nama</p>
                  <p className="text-sm font-semibold text-foreground">{BANK_INFO.accountName}</p>
                </div>

                <div className="rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                  <p className="text-xs text-muted-foreground">Nominal Transfer</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {formattedPrice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QRIS */}
          {activeTab === 'qris' && (
            <div className="mt-5 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="relative h-[250px] w-[250px] overflow-hidden rounded-xl border border-border/50 bg-white p-2">
                  <Image
                    src="/qris.png"
                    alt="QRIS Payment"
                    width={250}
                    height={250}
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Scan QRIS di atas untuk membayar <strong className="text-foreground">{formattedPrice}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Bukti Pembayaran */}
        <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Upload Bukti Pembayaran</h3>

          {!proofPreview ? (
            <label
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/30 px-6 py-8 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"
            >
              <Upload className="mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">Pilih gambar bukti transfer</p>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, atau WebP (maks. 2MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Image
                  src={proofPreview}
                  alt="Bukti pembayaran"
                  width={400}
                  height={300}
                  className="w-full h-auto max-h-[250px] object-contain bg-muted/20"
                />
              </div>
              <button
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="h-3.5 w-3.5" />
                {proofFile?.name}
              </p>
            </div>
          )}

          {uploadError && (
            <p className="mt-3 text-xs text-red-500">{uploadError}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Instruksi</h3>
          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                1
              </span>
              <span className="text-sm text-muted-foreground">
                Pilih paket (<strong className="text-foreground">Basic</strong>, <strong className="text-foreground">Pro</strong>, atau <strong className="text-foreground">Business</strong>) dan periode pembayaran
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                2
              </span>
              <span className="text-sm text-muted-foreground">
                Transfer sesuai nominal: <strong className="text-foreground">{formattedPrice}</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                3
              </span>
              <span className="text-sm text-muted-foreground">
                Upload bukti pembayaran di atas
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                4
              </span>
              <span className="text-sm text-muted-foreground">
                Klik <strong className="text-foreground">&quot;Kirim Bukti Pembayaran&quot;</strong> — otomatis terhubung ke WhatsApp admin
              </span>
            </li>
          </ol>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 space-y-3">
          <Button
            variant="premium"
            size="lg"
            className="w-full text-base"
            onClick={handleSubmitPayment}
            disabled={isSubmitting || isUploading || !proofFile}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isUploading ? 'Mengupload...' : 'Memproses...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Kirim Bukti Pembayaran
              </>
            )}
          </Button>

          <a href={buildWhatsAppUrl(proofUrl)} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="lg" className="w-full text-base">
              <MessageCircle className="mr-2 h-5 w-5" />
              Hubungi Admin via WhatsApp
            </Button>
          </a>

          <p className="text-center text-xs text-muted-foreground">
            Admin akan mengaktifkan akun Anda dalam 1x24 jam setelah pembayaran dikonfirmasi.
          </p>
        </div>
      </div>

      {/* Success notification toast */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-lg dark:border-emerald-800 dark:bg-emerald-950">
            <PartyPopper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Pembayaran berhasil! Paket telah aktif
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
