/**
 * Pricing Constants — Warung Madura POS
 *
 * Centralized pricing configuration for paid plans.
 * Paid plans: PRO / BUSINESS. FREE is used only for trial/free account state.
 *
 * Harga dalam Rupiah (integer, tanpa desimal).
 */

import type { PlanType } from '@/lib/features'

export type BillingPeriod = 'monthly' | 'lifetime'
export type PaidPlanType = Exclude<PlanType, 'FREE'>
export type NewUserPromoInput = {
  user?: { createdAt?: string | Date | null } | null
  membership?: { isTrial?: boolean | null } | null
  memberships?: Array<{ isTrial?: boolean | null }> | null
  payments?: Array<{ status?: string | null }> | null
}

export interface PlanPricing {
  monthly?: number
  lifetime: number
}

export interface PlanPriceMeta {
  originalPrice: number
  finalPrice: number
  periodLabel: string
  accessLabel: string
}

export interface PromoPricing {
  originalPrice: number
  discountPercent: number
  discountAmount: number
  finalAmount: number
  promoCode: string | null
  promoType: string | null
  isPromoApplied: boolean
}

export interface PlanInfo {
  name: string
  slug: string
  description: string
  pricing: PlanPricing
  popular: boolean
  features: string[]
  limits: {
    products: number | 'unlimited'
    transactionsMonthly: number | 'unlimited'
    cashiers: number | 'unlimited'
    customers: number | 'unlimited'
    reportHistoryDays: number | 'unlimited'
    storageMb: number
  }
}

export const NEW_USER_DISCOUNT_PERCENT = 0
export const NEW_USER_PROMO_CODE = 'NEW_USER_60'

export const PLAN_PRICE_META: Record<PaidPlanType, PlanPriceMeta> = {
  PRO: {
    originalPrice: 99_000,
    finalPrice: 49_000,
    periodLabel: '/bulan',
    accessLabel: 'langganan bulanan',
  },
  BUSINESS: {
    originalPrice: 399_000,
    finalPrice: 199_000,
    periodLabel: 'sekali bayar',
    accessLabel: 'akses selamanya',
  },
}

/**
 * Pricing per plan (in Rupiah). Stored as lifetime for current payment schema compatibility.
 */
export const PRICING: Record<PaidPlanType, PlanPricing> = {
  PRO: {
    monthly: PLAN_PRICE_META.PRO.finalPrice,
    lifetime: PLAN_PRICE_META.PRO.finalPrice,
  },
  BUSINESS: {
    lifetime: PLAN_PRICE_META.BUSINESS.finalPrice,
  },
}

/**
 * Format price to Rupiah string.
 */
export function formatPrice(amount: number): string {
  if (amount >= 1_000 && amount % 1_000 === 0) {
    return `Rp${amount / 1_000}K`
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatRupiah = formatPrice

export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  const payablePercent = Math.max(0, 100 - discountPercent)
  const discountedPrice = (originalPrice * payablePercent) / 100

  return Math.max(0, Math.round(discountedPrice / 100) * 100)
}

export function getPromoPricing(
  originalPrice: number,
  isEligible: boolean,
  discountPercent = NEW_USER_DISCOUNT_PERCENT
): PromoPricing {
  const finalAmount = isEligible
    ? calculateDiscountedPrice(originalPrice, discountPercent)
    : originalPrice
  const discountAmount = Math.max(0, originalPrice - finalAmount)

  return {
    originalPrice,
    discountPercent: isEligible ? discountPercent : 0,
    discountAmount,
    finalAmount,
    promoCode: isEligible ? NEW_USER_PROMO_CODE : null,
    promoType: isEligible ? NEW_USER_PROMO_CODE : null,
    isPromoApplied: isEligible,
  }
}

export function isEligibleForNewUserPromo(input: NewUserPromoInput): boolean {
  void input
  return false
}

/**
 * Complete plan information for display purposes.
 */
export const PLANS: Record<PaidPlanType, PlanInfo> = {
  PRO: {
    name: 'Pro',
    slug: 'pro',
    description: 'Untuk warung yang mulai ramai dan butuh fitur promosi.',
    pricing: PRICING.PRO,
    popular: true,
    features: [
      '200 produk',
      '500 transaksi/hari',
      '100 pelanggan',
      'Laporan sampai 365 hari',
      'Backup & restore data',
    ],
    limits: {
      products: 200,
      transactionsMonthly: 500,
      cashiers: 5,
      customers: 100,
      reportHistoryDays: 365,
      storageMb: 1_024,
    },
  },
  BUSINESS: {
    name: 'Business',
    slug: 'business',
    description: 'Untuk UMKM berkembang dengan banyak outlet dan tim.',
    pricing: PRICING.BUSINESS,
    popular: false,
    features: [
      'Unlimited produk',
      'Unlimited transaksi',
      'Unlimited pelanggan',
      'Laporan tanpa batas',
      'Backup & restore data',
    ],
    limits: {
      products: 'unlimited',
      transactionsMonthly: 'unlimited',
      cashiers: 'unlimited',
      customers: 'unlimited',
      reportHistoryDays: 'unlimited',
      storageMb: 10_240,
    },
  },
}

/**
 * Get the one-time lifetime price for a specific plan.
 */
export function getPlanPrice(plan: PaidPlanType, period: BillingPeriod): number {
  return period === 'monthly' ? PRICING[plan].monthly ?? PRICING[plan].lifetime : PRICING[plan].lifetime
}

export function getDisplayPricing(
  plan: keyof typeof PRICING,
  period: BillingPeriod,
  isPromoEligible: boolean
) {
  void period
  void isPromoEligible
  const meta = PLAN_PRICE_META[plan]
  const discountAmount = Math.max(0, meta.originalPrice - meta.finalPrice)
  const discountPercent = Math.round((discountAmount / meta.originalPrice) * 100)
  const promo: PromoPricing = {
    originalPrice: meta.originalPrice,
    discountPercent,
    discountAmount,
    finalAmount: meta.finalPrice,
    promoCode: 'LAUNCH_PRICE',
    promoType: 'LAUNCH_PRICE',
    isPromoApplied: discountAmount > 0,
  }

  return {
    normalPrice: meta.originalPrice,
    finalPrice: meta.finalPrice,
    lifetimePrice: meta.finalPrice,
    periodLabel: meta.periodLabel,
    accessLabel: meta.accessLabel,
    promo,
  }
}

/**
 * Get the next upgrade plan suggestion.
 */
export function getNextPlan(currentPlan: PlanType): PaidPlanType | null {
  switch (currentPlan) {
    case 'FREE': return 'PRO'
    case 'PRO': return 'BUSINESS'
    case 'BUSINESS': return null
    default: return 'PRO'
  }
}
