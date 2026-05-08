/**
 * Pricing Constants — Warung Madura POS
 *
 * Centralized pricing configuration for all plans and billing periods.
 * Full paid model: BASIC / PRO / BUSINESS (no free tier).
 *
 * Harga dalam Rupiah (integer, tanpa desimal).
 */

import type { PlanType } from '@/lib/features'

export type BillingPeriod = 'monthly' | 'yearly'

export interface PlanPricing {
  monthly: number
  yearly: number
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

/**
 * Pricing per plan (in Rupiah).
 */
export const PRICING: Record<Exclude<PlanType, 'ENTERPRISE'>, PlanPricing> = {
  BASIC: {
    monthly: 19_900,
    yearly: 189_000, // hemat ~21%
  },
  PRO: {
    monthly: 49_900,
    yearly: 479_000, // hemat ~20%
  },
  BUSINESS: {
    monthly: 99_900,
    yearly: 949_000, // hemat ~21%
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

/**
 * Complete plan information for display purposes.
 */
export const PLANS: Record<Exclude<PlanType, 'ENTERPRISE'>, PlanInfo> = {
  BASIC: {
    name: 'Basic',
    slug: 'basic',
    description: 'Untuk warung kecil yang baru mulai jualan digital.',
    pricing: PRICING.BASIC,
    popular: false,
    features: [
      '50 produk',
      '300 transaksi/bulan',
      '1 kasir',
      'Dashboard + grafik profit',
      'Cetak struk Bluetooth',
      'Export Excel',
      'Kas masuk/keluar',
      'Backup & restore',
      'Logo toko di struk',
      'WhatsApp support',
    ],
    limits: {
      products: 50,
      transactionsMonthly: 300,
      cashiers: 1,
      customers: 50,
      reportHistoryDays: 30,
      storageMb: 100,
    },
  },
  PRO: {
    name: 'Pro',
    slug: 'pro',
    description: 'Untuk warung aktif yang ingin kelola tim & promo.',
    pricing: PRICING.PRO,
    popular: true,
    features: [
      '500 produk',
      '3.000 transaksi/bulan',
      '5 kasir + shift management',
      'Promo & voucher otomatis',
      'Bulk import + variasi produk',
      'WhatsApp reminder hutang',
      'Backup otomatis mingguan',
      'Laporan per kasir & kategori',
      'Export Excel & PDF',
      'Priority support',
    ],
    limits: {
      products: 500,
      transactionsMonthly: 3_000,
      cashiers: 5,
      customers: 500,
      reportHistoryDays: 365,
      storageMb: 1_024,
    },
  },
  BUSINESS: {
    name: 'Business',
    slug: 'business',
    description: 'Untuk bisnis serius dengan multi-cabang tanpa batas.',
    pricing: PRICING.BUSINESS,
    popular: false,
    features: [
      'Unlimited produk & transaksi',
      'Unlimited kasir & pelanggan',
      'Multi-toko / outlet',
      'Transfer stok antar toko',
      'Loyalty points pelanggan',
      'Prediksi stok + jam ramai',
      'Email laporan otomatis',
      'Backup otomatis harian',
      'API access & webhook',
      'Dedicated support (< 6 jam)',
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
export function getPlanPrice(plan: PlanType, period: BillingPeriod): number {
  if (plan === 'ENTERPRISE') return 0 // Custom pricing
  return PRICING[plan][period]
}

/**
 * Get monthly equivalent price (for yearly, divide by 12).
 */
export function getMonthlyEquivalent(plan: keyof typeof PRICING, period: BillingPeriod): number {
  if (period === 'monthly') return PRICING[plan].monthly
  return Math.round(PRICING[plan].yearly / 12)
}

/**
 * Get the next upgrade plan suggestion.
 */
export function getNextPlan(currentPlan: PlanType): PlanType | null {
  switch (currentPlan) {
    case 'BASIC': return 'PRO'
    case 'PRO': return 'BUSINESS'
    case 'BUSINESS': return null
    case 'ENTERPRISE': return null
    default: return 'BASIC'
  }
}
