'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Copy,
  CheckCircle2,
  CreditCard,
  QrCode,
  Loader2,
  Upload,
  ImageIcon,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NEW_USER_DISCOUNT_PERCENT, formatPrice, getDisplayPricing } from '@/lib/pricing'
import { useSubscriptionStore } from '@/stores/subscription-store'

type SelectedPlan = 'pro' | 'business'

const BANK_INFO = {
  bank: 'BCA',
  accountNumber: '7896118152',
  accountName: 'MUHAMMAD HASBUNA',
}

interface UpgradePaymentPanelProps {
  selectedPlan: SelectedPlan
  isNewUserPromoEligible: boolean
  onSubmitPayment: () => void
}

export function UpgradePaymentPanel({
  selectedPlan,
  isNewUserPromoEligible,
  onSubmitPayment,
}: UpgradePaymentPanelProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'qris'>('bank')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [, setProofUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { submitPayment } = useSubscriptionStore()

  const pricingKey = selectedPlan.toUpperCase() as 'PRO' | 'BUSINESS'
  const displayPricing = getDisplayPricing(pricingKey, 'lifetime', isNewUserPromoEligible)
  const promoPricing = displayPricing.promo
  const formattedPrice = formatPrice(displayPricing.finalPrice)

  // Determine current step
  const currentStep = proofFile ? 3 : 1

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const processFile = (file: File) => {
    setUploadError(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [])

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
            billingPeriod: 'lifetime',
            amount: promoPricing.finalAmount,
            originalPrice: promoPricing.originalPrice,
            discountPercent: promoPricing.discountPercent,
            discountAmount: promoPricing.discountAmount,
            finalAmount: promoPricing.finalAmount,
            promoCode: promoPricing.promoCode,
            promoType: promoPricing.promoType,
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

      const paymentSummary = {
        plan: selectedPlan,
        method: activeTab === 'qris' ? 'qris' as const : 'bank' as const,
        amount: promoPricing.finalAmount,
      }

      submitPayment(paymentSummary)
      onSubmitPayment()
      router.push(`/successpayment?plan=${selectedPlan}&method=${activeTab === 'qris' ? 'qris' : 'bank'}&amount=${promoPricing.finalAmount}`)
    } catch {
      setUploadError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Payment card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
        {/* Progress steps */}
        <div className="mb-8 flex items-center justify-between">
          {[
            { num: 1, label: 'Pilih metode' },
            { num: 2, label: 'Transfer' },
            { num: 3, label: 'Upload bukti' },
          ].map((step, i) => (
            <div key={step.num} className="flex items-center gap-2">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                currentStep >= step.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              )}>
                {currentStep > step.num ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.num
                )}
              </div>
              <span className={cn(
                'hidden text-xs font-medium sm:block',
                currentStep >= step.num
                  ? 'text-slate-700 dark:text-slate-200'
                  : 'text-slate-400 dark:text-slate-500'
              )}>
                {step.label}
              </span>
              {i < 2 && (
                <div className={cn(
                  'mx-2 h-px w-6 sm:w-8',
                  currentStep > step.num
                    ? 'bg-emerald-300 dark:bg-emerald-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Payment method */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Metode Pembayaran
            </label>

            {isNewUserPromoEligible && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Diskon {NEW_USER_DISCOUNT_PERCENT}% untuk User Baru
                </span>
                <p className="mt-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Promo khusus pelanggan baru
                </p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                  Harga normal <span className="line-through">{formatPrice(promoPricing.originalPrice)}</span>. Sekarang{' '}
                  <span className="font-bold">{formattedPrice}</span>.
                </p>
              </div>
            )}

            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('bank')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 text-sm font-medium transition-all',
                  activeTab === 'bank'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500'
                )}
              >
                <CreditCard className="h-4 w-4" />
                Transfer Bank
              </button>
              <button
                onClick={() => setActiveTab('qris')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 text-sm font-medium transition-all',
                  activeTab === 'qris'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500'
                )}
              >
                <QrCode className="h-4 w-4" />
                QRIS
              </button>
            </div>
          </div>

          {/* Step 2: Payment info */}
          {activeTab === 'bank' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Bank</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{BANK_INFO.bank}</p>
                  </div>
                  <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">
                    BCA
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">No. Rekening</p>
                    <p className="mt-0.5 text-lg font-bold tracking-wider text-slate-900 dark:text-white">
                      {BANK_INFO.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
                      copied
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-white text-slate-600 shadow-sm hover:shadow dark:bg-slate-600 dark:text-slate-200'
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
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/30">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Atas Nama</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{BANK_INFO.accountName}</p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <p className="text-[11px] uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Nominal Transfer</p>
                {isNewUserPromoEligible && (
                  <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                    Harga normal <span className="line-through">{formatPrice(promoPricing.originalPrice)}</span>
                  </p>
                )}
                <p className="mt-0.5 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formattedPrice}
                </p>
                {isNewUserPromoEligible && (
                  <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Sekarang {formattedPrice}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'qris' && (
            <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-6 dark:bg-slate-700/30">
              <div className="relative h-[220px] w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-600">
                <Image
                  src="/qris.png"
                  alt="QRIS Payment"
                  width={220}
                  height={220}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Scan QRIS untuk membayar <strong className="text-slate-700 dark:text-slate-200">{formattedPrice}</strong>
              </p>
              {isNewUserPromoEligible && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Harga normal <span className="line-through">{formatPrice(promoPricing.originalPrice)}</span> · Diskon {NEW_USER_DISCOUNT_PERCENT}% untuk User Baru
                </p>
              )}
            </div>
          )}

          {/* Step 3: Upload proof */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upload Bukti Pembayaran
            </label>

            {!proofPreview ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-all',
                  isDragging
                    ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-500/10'
                    : 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-600 dark:bg-slate-700/20 dark:hover:border-emerald-600'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
                  <Upload className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Drag & drop atau klik untuk upload
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  JPG, PNG, atau WebP (maks. 2MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="relative mt-2">
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-600">
                  <Image
                    src={proofPreview}
                    alt="Bukti pembayaran"
                    width={400}
                    height={250}
                    className="w-full h-auto max-h-[200px] object-contain bg-slate-50 dark:bg-slate-700/30"
                  />
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
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
              <p className="mt-2 text-xs text-red-500">{uploadError}</p>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 space-y-3">
          <Button
            variant="premium"
            size="xl"
            className="w-full"
            onClick={handleSubmitPayment}
            disabled={isSubmitting || isUploading || !proofFile}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isUploading ? 'Mengupload...' : 'Memproses...'}
              </>
            ) : (
              'Kirim Bukti Pembayaran'
            )}
          </Button>


        </div>
      </div>

      {/* Trust note below card */}
      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Admin akan mengaktifkan akun Anda dalam 1x24 jam setelah pembayaran dikonfirmasi.
      </p>
    </div>
  )
}
