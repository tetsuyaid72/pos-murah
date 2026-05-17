/**
 * Server-Side Plan Enforcement — Warung Madura POS
 *
 * Checks plan limits before allowing resource creation.
 * Full paid model: FREE / PRO / BUSINESS (no free tier).
 *
 * Usage:
 *   const check = await checkProductLimit(storeId)
 *   if (!check.allowed) return NextResponse.json({ error: check.message }, { status: 403 })
 */

import { eq, and, gte, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { memberships, products, transactions, customers } from '@/lib/db/schema'
import { PLAN_LIMITS, QUICK_TRIAL_LIMITS, normalizePlanType, type PlanType, type LimitKey } from '@/lib/features'

interface PlanCheckResult {
  allowed: boolean
  limit: number
  current: number
  message: string
  plan: PlanType
  isTrialActive: boolean
}

/**
 * Get the membership for a store from the database.
 */
async function getMembership(storeId: string) {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.storeId, storeId))
    .limit(1)

  return membership || null
}

/**
 * Check if the store's trial is still active.
 */
function checkTrialActive(membership: { isTrial: boolean; trialEndAt: Date }): boolean {
  if (!membership.isTrial) return false
  return new Date(membership.trialEndAt) > new Date()
}

function checkTrialExpired(membership: { isTrial: boolean; trialEndAt: Date }): boolean {
  if (!membership.isTrial) return false
  return new Date(membership.trialEndAt) <= new Date()
}

function checkSubscriptionExpired(membership: { plan: string; isTrial: boolean; subscriptionEndAt?: Date | null }): boolean {
  if (membership.isTrial || membership.plan !== 'PRO' || !membership.subscriptionEndAt) return false
  return new Date(membership.subscriptionEndAt) <= new Date()
}

/**
 * Get the effective limit for a store based on their plan and trial status.
 */
function getEffectiveLimit(
  membership: { plan: string; isTrial: boolean; trialEndAt: Date; subscriptionEndAt?: Date | null },
  limitKey: LimitKey
): number {
  if (checkTrialActive(membership)) {
    if (limitKey === 'max_products') return QUICK_TRIAL_LIMITS.max_products
    if (limitKey === 'max_transactions_monthly') return QUICK_TRIAL_LIMITS.max_transactions_monthly
    if (limitKey === 'max_customers') return QUICK_TRIAL_LIMITS.max_customers
  }

  if (checkTrialExpired(membership) || checkSubscriptionExpired(membership)) return 0

  const plan = normalizePlanType(membership.plan)
  return PLAN_LIMITS[limitKey][plan] ?? PLAN_LIMITS[limitKey].FREE
}

/**
 * Get the recommended upgrade plan based on current plan.
 */
function getUpgradeSuggestion(currentPlan: PlanType): string {
  switch (currentPlan) {
    case 'FREE':
      return 'Upgrade ke Pro (Rp49K/bulan) untuk limit lebih besar.'
    case 'PRO':
      return 'Upgrade ke Business (Rp199K sekali bayar, akses selamanya) untuk akses unlimited.'
    default:
      return 'Hubungi admin untuk menambah limit.'
  }
}

/**
 * Check if a store can add more products.
 */
export async function checkProductLimit(storeId: string): Promise<PlanCheckResult> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      limit: PLAN_LIMITS.max_products.FREE,
      current: 0,
      message: 'Membership tidak ditemukan. Silakan berlangganan terlebih dahulu.',
      plan: 'FREE',
      isTrialActive: false,
    }
  }

  const isTrialActive = checkTrialActive(membership)
  const limit = getEffectiveLimit(membership, 'max_products')

  const [result] = await db
    .select({ count: count() })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))

  const current = result?.count ?? 0

  if (current >= limit) {
    const plan = normalizePlanType(membership.plan)
    return {
      allowed: false,
      limit,
      current,
      message: `Batas produk tercapai (${current}/${limit}). ${getUpgradeSuggestion(plan)}`,
      plan,
      isTrialActive,
    }
  }

  return {
    allowed: true,
    limit,
    current,
    message: '',
    plan: normalizePlanType(membership.plan),
    isTrialActive,
  }
}

/**
 * Check if a store can create more transactions today.
 */
export async function checkTransactionLimit(storeId: string): Promise<PlanCheckResult> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      limit: PLAN_LIMITS.max_transactions_monthly.FREE,
      current: 0,
      message: 'Membership tidak ditemukan. Silakan berlangganan terlebih dahulu.',
      plan: 'FREE',
      isTrialActive: false,
    }
  }

  const isTrialActive = checkTrialActive(membership)
  const limit = getEffectiveLimit(membership, 'max_transactions_monthly')

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [result] = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.storeId, storeId),
        gte(transactions.createdAt, startOfDay)
      )
    )

  const current = result?.count ?? 0

  if (current >= limit) {
    const plan = normalizePlanType(membership.plan)
    return {
      allowed: false,
      limit,
      current,
      message: `Batas transaksi harian tercapai (${current}/${limit}). ${getUpgradeSuggestion(plan)}`,
      plan,
      isTrialActive,
    }
  }

  return {
    allowed: true,
    limit,
    current,
    message: '',
    plan: normalizePlanType(membership.plan),
    isTrialActive,
  }
}

/**
 * Check if a store can add more customers.
 */
export async function checkCustomerLimit(storeId: string): Promise<PlanCheckResult> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      limit: PLAN_LIMITS.max_customers.FREE,
      current: 0,
      message: 'Membership tidak ditemukan. Silakan berlangganan terlebih dahulu.',
      plan: 'FREE',
      isTrialActive: false,
    }
  }

  const isTrialActive = checkTrialActive(membership)
  const limit = getEffectiveLimit(membership, 'max_customers')

  const [result] = await db
    .select({ count: count() })
    .from(customers)
    .where(eq(customers.storeId, storeId))

  const current = result?.count ?? 0

  if (current >= limit) {
    const plan = normalizePlanType(membership.plan)
    return {
      allowed: false,
      limit,
      current,
      message: `Batas pelanggan tercapai (${current}/${limit}). ${getUpgradeSuggestion(plan)}`,
      plan,
      isTrialActive,
    }
  }

  return {
    allowed: true,
    limit,
    current,
    message: '',
    plan: normalizePlanType(membership.plan),
    isTrialActive,
  }
}

/**
 * Check if a store can access a boolean feature.
 */
export async function checkFeatureAccess(
  storeId: string,
  feature: string
): Promise<{ allowed: boolean; message: string; plan: PlanType }> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      message: 'Membership tidak ditemukan. Silakan berlangganan terlebih dahulu.',
      plan: 'FREE',
    }
  }

  if (checkTrialActive(membership)) {
    return { allowed: true, message: '', plan: normalizePlanType(membership.plan) }
  }

  if (checkTrialExpired(membership)) {
    return {
      allowed: false,
      message: 'Quick Trial Anda telah berakhir. Upgrade paket untuk melanjutkan menggunakan fitur POS.',
      plan: normalizePlanType(membership.plan),
    }
  }

  if (checkSubscriptionExpired(membership)) {
    return {
      allowed: false,
      message: 'Langganan Pro Anda telah berakhir. Perpanjang paket untuk melanjutkan menggunakan fitur POS.',
      plan: normalizePlanType(membership.plan),
    }
  }

  const { FEATURE_DEFAULTS } = await import('@/lib/features')
  const featureConfig = FEATURE_DEFAULTS[feature]
  const plan = normalizePlanType(membership.plan)
  const allowed = plan === 'BUSINESS' || featureConfig?.[plan] === true

  if (!allowed) {
    const featureNames: Record<string, string> = {
      export_excel: 'Export Excel',
      export_pdf: 'Export PDF',
      advanced_reports: 'Laporan Lanjutan',
      multi_outlet: 'Multi-Toko',
      backup_restore: 'Backup & Restore',
      bulk_import: 'Bulk Import',
      shift_management: 'Shift Management',
      cash_flow: 'Kas Masuk/Keluar',
      profit_report: 'Laporan Profit',
      auto_promo: 'Promo Otomatis',
      voucher_coupon: 'Voucher & Kupon',
      product_variant: 'Variasi Produk',
      wa_notification: 'Notifikasi WhatsApp',
      wa_debt_reminder: 'Reminder Hutang WhatsApp',
      auto_backup: 'Backup Otomatis',
      email_report: 'Email Laporan',
      api_access: 'API Access',
      loyalty_points: 'Loyalty Points',
      stock_prediction: 'Prediksi Stok',
      peak_hour_analysis: 'Analisis Jam Ramai',
      multi_staff_role: 'Role & Permission',
      debt_reminder_manual: 'Reminder Hutang',
      expense_tracking: 'Catatan Pengeluaran',
      stock_transfer: 'Transfer Stok',
      batch_price_update: 'Update Harga Massal',
      multi_payment_split: 'Multi-Payment Split',
    }

    const featureName = featureNames[feature] || feature
    return {
      allowed: false,
      message: `Fitur ${featureName} tidak tersedia di paket ${plan}. ${getUpgradeSuggestion(plan)}`,
      plan,
    }
  }

  return { allowed: true, message: '', plan }
}

/**
 * Strict feature access check — does NOT bypass for active trials.
 */
export async function checkStrictFeatureAccess(
  storeId: string,
  feature: string
): Promise<{ allowed: boolean; message: string; plan: PlanType }> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      message: 'Membership tidak ditemukan.',
      plan: 'FREE',
    }
  }

  if (checkTrialExpired(membership)) {
    return {
      allowed: false,
      message: 'Quick Trial Anda telah berakhir.',
      plan: normalizePlanType(membership.plan),
    }
  }

  if (checkSubscriptionExpired(membership)) {
    return {
      allowed: false,
      message: 'Langganan Pro Anda telah berakhir.',
      plan: normalizePlanType(membership.plan),
    }
  }

  const { FEATURE_DEFAULTS } = await import('@/lib/features')
  const featureConfig = FEATURE_DEFAULTS[feature]
  const plan = normalizePlanType(membership.plan)
  const allowed = plan === 'BUSINESS' || featureConfig?.[plan] === true

  if (!allowed) {
    return {
      allowed: false,
      message: `Fitur ini tidak tersedia di paket ${plan}. ${getUpgradeSuggestion(plan)}`,
      plan,
    }
  }

  return { allowed: true, message: '', plan }
}
