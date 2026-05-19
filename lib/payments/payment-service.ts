import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { memberships, payments } from '@/lib/db/schema'
import { TRIAL_DAYS, type BillingPeriod, type PaidPlanType } from '@/lib/pricing'
import type { PaymentStatus } from '@/lib/payments/status'

export interface ActivateMembershipInput {
  storeId: string
  plan: PaidPlanType
  billingPeriod: BillingPeriod
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + months,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
}

export async function activateMembership(input: ActivateMembershipInput): Promise<void> {
  const now = new Date()
  const current = await db.query.memberships.findFirst({
    where: eq(memberships.storeId, input.storeId),
  })

  const subscriptionEndAt = input.plan === 'PRO' && input.billingPeriod === 'monthly'
    ? addMonths(
        current?.subscriptionEndAt && current.subscriptionEndAt > now
          ? current.subscriptionEndAt
          : now,
        1
      )
    : null

  await db.update(memberships).set({
    plan: input.plan,
    isTrial: false,
    billingPeriod: input.billingPeriod,
    subscriptionStartAt: now,
    subscriptionEndAt,
  }).where(eq(memberships.storeId, input.storeId))
}

export async function activateTrialMembership(storeId: string): Promise<void> {
  const now = new Date()

  await db.update(memberships).set({
    plan: 'PRO',
    isTrial: true,
    billingPeriod: null,
    trialStartAt: now,
    trialEndAt: addDays(now, TRIAL_DAYS),
    subscriptionStartAt: null,
    subscriptionEndAt: null,
  }).where(eq(memberships.storeId, storeId))
}

export async function markPaymentFromGateway(input: {
  paymentId: string
  status: PaymentStatus
  providerTransactionId?: string | null
  providerStatus?: string | null
  expiredAt?: Date | null
  metadata: Record<string, unknown>
}): Promise<void> {
  const paidAt = input.status === 'PAID' ? new Date() : undefined

  await db.update(payments).set({
    status: input.status,
    providerTransactionId: input.providerTransactionId ?? null,
    providerStatus: input.providerStatus ?? null,
    paidAt,
    expiredAt: input.expiredAt ?? null,
    metadata: input.metadata,
  }).where(eq(payments.id, input.paymentId))
}
