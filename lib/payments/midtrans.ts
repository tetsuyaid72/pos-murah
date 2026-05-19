import { createHash } from 'crypto'
import { getAppUrl } from '@/lib/app-url'
import type { CheckoutPlanType } from '@/lib/pricing'

const SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1'
const PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1'

export interface MidtransCustomerDetails {
  firstName: string
  email: string
}

export interface CreateSnapInput {
  orderId: string
  grossAmount: number
  plan: CheckoutPlanType
  billingPeriod?: 'monthly' | 'lifetime'
  customer: MidtransCustomerDetails
}

export interface SnapResponse {
  token: string
  redirect_url: string
}

export interface MidtransNotificationPayload {
  order_id?: string
  transaction_id?: string
  transaction_status?: string
  fraud_status?: string
  gross_amount?: string
  status_code?: string
  signature_key?: string
  expiry_time?: string
  [key: string]: unknown
}

function getServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY
  if (!key) throw new Error('MIDTRANS_SERVER_KEY is not set')
  return key
}

function getSnapBaseUrl(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL
}

export function getMidtransMode(): 'sandbox' | 'production' {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'production' : 'sandbox'
}

export async function createSnapTransaction(input: CreateSnapInput): Promise<SnapResponse> {
  const serverKey = getServerKey()
  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  const appUrl = getAppUrl()
  const itemName = input.plan === 'TRIAL'
    ? 'Warung Madura POS Masa Trial 7 Hari'
    : `Warung Madura POS ${input.plan} ${input.billingPeriod}`

  const payload = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    item_details: [
      {
        id: input.plan,
        price: input.grossAmount,
        quantity: 1,
        name: itemName,
      },
    ],
    customer_details: {
      first_name: input.customer.firstName,
      email: input.customer.email,
    },
    callbacks: {
      finish: `${appUrl}/successpayment?plan=${input.plan.toLowerCase()}&method=midtrans&amount=${input.grossAmount}`,
      pending: `${appUrl}/pricing?payment=pending`,
      error: `${appUrl}/pricing?payment=error`,
    },
    credit_card: {
      secure: true,
    },
  }

  const res = await fetch(`${getSnapBaseUrl()}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.error_messages?.[0] === 'string' ? data.error_messages[0] : 'Gagal membuat transaksi Midtrans')
  }

  return data as SnapResponse
}

export function verifyMidtransSignature(payload: MidtransNotificationPayload): boolean {
  const orderId = payload.order_id
  const statusCode = payload.status_code
  const grossAmount = payload.gross_amount
  const signatureKey = payload.signature_key

  if (!orderId || !statusCode || !grossAmount || !signatureKey) return false

  const expected = createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${getServerKey()}`)
    .digest('hex')

  return expected === signatureKey
}
