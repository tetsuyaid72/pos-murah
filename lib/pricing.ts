/**
 * Pricing Constants — Warung Madura POS
 *
 * Centralized pricing configuration for one-time lifetime access plans.
 * Paid plans: PRO / BUSINESS. FREE is used only for trial/free account state.
 *
 * Harga dalam Rupiah (integer, tanpa desimal).
 */

import type { PlanType } from '@/lib/features'

export type BillingPeriod = 'lifetime'
export type PaidPlanType = Exclude<PlanType, 'FREE'>
export type NewUserPromoInput = {
  user?: { createdAt?: string | Date | null } | null
  membership?: { isTrial?: boolean | null } | null
  memberships?: Array<{ isTrial?: boolean | null }> | null
  payments?: Array<{ status?: string | null }> | null
}

export interface PlanPricing {
  lifetime: number
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

/**
 * Pricing per plan (in Rupiah).
 */
export const PRICING: Record<PaidPlanType, PlanPricing> = {
  PRO: {
    lifetime: 50_000,
  },
  BUSINESS: {
    lifetime: 100_000,
  },
}

/**
 * Format price to Rupiah string.
 */
export function formatPrice(amount: number): string {
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
      '150 produk',
      '250 transaksi/hari',
      '5 kasir',
      '500 pelanggan',
      'Backup otomatis mingguan',
    ],
    limits: {
      products: 150,
      transactionsMonthly: 250,
      cashiers: 5,
      customers: 500,
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
      'Unlimited kasir',
      'Unlimited pelanggan',
      'Backup otomatis harian',
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
  return PRICING[plan][period]
}

export function getDisplayPricing(
  plan: keyof typeof PRICING,
  period: BillingPeriod,
  isPromoEligible: boolean
) {
  const normalPrice = getPlanPrice(plan, period)
  const promo = getPromoPricing(normalPrice, isPromoEligible)

  return {
    normalPrice,
    finalPrice: promo.finalAmount,
    lifetimePrice: promo.finalAmount,
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
