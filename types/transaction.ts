export type PaymentMethod = 'cash' | 'qris' | 'debt'
export type TransactionStatus = 'completed' | 'pending' | 'voided'

export interface TransactionItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  costPrice: number
  discountAmount: number
  subtotal: number
}

export interface Transaction {
  id: string
  invoiceNumber: string
  items: TransactionItem[]
  subtotal: number
  discountAmount: number
  discountType: 'percentage' | 'fixed'
  taxAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  amountPaid: number
  changeAmount: number
  customerId: string | null
  cashierId: string
  outletId: string
  status: TransactionStatus
  notes: string | null
  createdAt: string
}
