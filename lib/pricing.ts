/**
 * Pricing Constants — Warung Madura POS
 *
 * Centralized pricing configuration for all plans and billing periods.
 * Paid plans: PRO / BUSINESS. FREE is used only for trial/free account state.
 *
 * Harga dalam Rupiah (integer, tanpa desimal).
 */

import type { PlanType } from '@/lib/features'

export type BillingPeriod = 'monthly' | 'yearly'
export type PaidPlanType = Exclude<PlanType, 'FREE'>
export type NewUserPromoInput = {
  user?: { createdAt?: string | Date | null } | null
  membership?: { isTrial?: boolean | null } | null
  memberships?: Array<{ isTrial?: boolean | null }> | null
  payments?: Array<{ status?: string | null }> | null
}

export interface PlanPricing {
  monthly: number
  yearly: number
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

export const NEW_USER_DISCOUNT_PERCENT = 60
export const NEW_USER_PROMO_CODE = 'NEW_USER_60'

/**
 * Pricing per plan (in Rupiah).
 */
export const PRICING: Record<PaidPlanType, PlanPricing> = {
  PRO: {
    monthly: 49_900,
    yearly: 479_000,
  },
  BUSINESS: {
    monthly: 99_900,
    yearly: 949_000,
  },
}

/**
 * Get the savings percentage for yearly billing.
 */
export function getYearlySavingsPercent(plan: keyof typeof PRICING): number {
  const { monthly, yearly } = PRICING[plan]
  const monthlyTotal = monthly * 12
  return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100)
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
  const payments = input.payments ?? []
  const memberships = input.memberships ?? []
  const hasApprovedPayment = payments.some((payment) => payment.status === 'APPROVED')
  const hasPaidMembership = memberships.some((membership) => membership.isTrial === false)

  if (hasApprovedPayment || hasPaidMembership) return false
  if (input.membership?.isTrial === false) return false
  if (input.membership?.isTrial) return true
  if (input.user?.createdAt) return true

  return !payments.length && !memberships.length
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
 * Get the price for a specific plan and billing period.
 */
export function getPlanPrice(plan: PaidPlanType, period: BillingPeriod): number {
  return PRICING[plan][period]
}

/**
 * Get monthly equivalent price (for yearly, divide by 12).
 */
export function getMonthlyEquivalent(plan: keyof typeof PRICING, period: BillingPeriod): number {
  if (period === 'monthly') return PRICING[plan].monthly
  return Math.round(PRICING[plan].yearly / 12)
}

export function getDisplayPricing(
  plan: keyof typeof PRICING,
  period: BillingPeriod,
  isPromoEligible: boolean
) {
  const normalPrice = getPlanPrice(plan, period)
  const promo = getPromoPricing(normalPrice, isPromoEligible)
  const monthlyEquivalent = period === 'yearly'
    ? Math.round(promo.finalAmount / 12)
    : promo.finalAmount

  return {
    normalPrice,
    finalPrice: promo.finalAmount,
    monthlyEquivalent,
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
