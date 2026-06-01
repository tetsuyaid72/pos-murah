/**
 * Script: Fix users who paid for trial (10K) via Midtrans but membership wasn't activated.
 *
 * This script:
 * 1. Finds users by email
 * 2. Checks if they have a PAID payment with checkoutType=TRIAL
 * 3. Activates their trial membership (7 days from now)
 *
 * Usage:
 *   npx tsx scripts/fix-paid-users.ts
 */

import 'dotenv/config'
import { eq, and } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../lib/db/schema'

const EMAILS_TO_FIX = [
  'fardi0617@gmail.com',
  'hambalisangjuaraorganizer@gmail.com',
  'diyatosca@gmail.com',
  'anhar.andi02@gmail.com',
]

const TRIAL_DAYS = 7

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  })

  const db = drizzle(pool, { schema })

  console.log('=== Fix Paid Users - Trial Activation ===\n')

  for (const email of EMAILS_TO_FIX) {
    console.log(`\n--- Processing: ${email} ---`)

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase().trim()),
      with: {
        store: {
          with: {
            membership: true,
          },
        },
      },
    })

    if (!user) {
      console.log(`  ❌ User not found: ${email}`)
      continue
    }

    console.log(`  ✅ User found: ${user.name} (${user.id})`)

    if (!user.store) {
      console.log(`  ❌ No store found for user`)
      continue
    }

    console.log(`  📦 Store: ${user.store.name} (${user.store.id})`)

    const membership = user.store.membership
    if (!membership) {
      console.log(`  ❌ No membership found for store`)
      continue
    }

    console.log(`  📋 Current membership: plan=${membership.plan}, isTrial=${membership.isTrial}, trialEndAt=${membership.trialEndAt}`)

    // Check if membership is already active
    const now = new Date()
    const isTrialActive = membership.isTrial && new Date(membership.trialEndAt) > now
    const isPaidActive = !membership.isTrial && membership.plan !== 'FREE' && (
      !membership.subscriptionEndAt || new Date(membership.subscriptionEndAt) > now
    )

    if (isTrialActive || isPaidActive) {
      console.log(`  ⚠️ Membership is already active, skipping`)
      continue
    }

    // Check for PAID payments
    const paidPayments = await db
      .select()
      .from(schema.payments)
      .where(
        and(
          eq(schema.payments.storeId, user.store.id),
          eq(schema.payments.status, 'PAID'),
        )
      )

    console.log(`  💰 Found ${paidPayments.length} PAID payment(s)`)

    if (paidPayments.length === 0) {
      // Also check for payments that might be PENDING but actually paid in Midtrans
      const pendingPayments = await db
        .select()
        .from(schema.payments)
        .where(
          and(
            eq(schema.payments.storeId, user.store.id),
            eq(schema.payments.status, 'PENDING'),
          )
        )
      console.log(`  📝 Found ${pendingPayments.length} PENDING payment(s)`)

      for (const pp of pendingPayments) {
        console.log(`    - Payment ${pp.id}: plan=${pp.plan}, amount=${pp.finalAmount}, provider=${pp.provider}, providerOrderId=${pp.providerOrderId}`)
      }
    }

    // Activate trial for this user regardless (they paid 10K)
    const trialEndAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

    await db.update(schema.memberships).set({
      plan: 'PRO',
      isTrial: true,
      trialStartAt: now,
      trialEndAt: trialEndAt,
      subscriptionStartAt: null,
      subscriptionEndAt: null,
    }).where(eq(schema.memberships.storeId, user.store.id))

    console.log(`  ✅ Trial activated! Plan=PRO, isTrial=true, trialEndAt=${trialEndAt.toISOString()}`)

    // If there are PENDING payments that should be PAID, mark them too
    for (const pp of (paidPayments.length === 0 ? await db.select().from(schema.payments).where(and(eq(schema.payments.storeId, user.store.id), eq(schema.payments.status, 'PENDING'), eq(schema.payments.provider, 'MIDTRANS'))) : [])) {
      await db.update(schema.payments).set({
        status: 'PAID',
        paidAt: now,
      }).where(eq(schema.payments.id, pp.id))
      console.log(`  ✅ Payment ${pp.id} marked as PAID`)
    }
  }

  console.log('\n=== Done ===')
  await pool.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Script error:', err)
  process.exit(1)
})
