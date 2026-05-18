export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED'

export type MidtransTransactionStatus =
  | 'capture'
  | 'settlement'
  | 'pending'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'failure'
  | 'refund'
  | 'partial_refund'
  | string

export function mapMidtransStatus(status: MidtransTransactionStatus, fraudStatus?: string | null): PaymentStatus {
  if (status === 'capture') {
    return fraudStatus === 'challenge' ? 'PENDING' : 'PAID'
  }

  if (status === 'settlement') return 'PAID'
  if (status === 'pending') return 'PENDING'
  if (status === 'expire') return 'EXPIRED'
  if (status === 'cancel') return 'CANCELLED'
  if (status === 'deny' || status === 'failure') return 'FAILED'
  if (status === 'refund' || status === 'partial_refund') return 'REFUNDED'

  return 'PENDING'
}

export function isFinalPaymentStatus(status: PaymentStatus): boolean {
  return ['PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'APPROVED', 'REJECTED'].includes(status)
}
