export type DebtStatus = 'unpaid' | 'partial' | 'paid'
export type CustomerStatus = 'PAID' | 'DEBT'
export type DebtPaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS'

export interface Customer {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  notes?: string | null
  debt: number
  totalTransactions: number
  lastTransactionAt?: string | null
  createdAt: string
}

export interface DebtPayment {
  id: string
  customerId: string
  amount: number
  method: DebtPaymentMethod
  note?: string | null
  createdAt: string
}

export interface CustomerTransaction {
  id: string
  customerId: string
  invoiceNumber: string
  total: number
  paidAmount: number
  debtAmount: number
  createdAt: string
}

export interface DebtRecord {
  id: string
  customerId: string
  transactionId: string
  amount: number
  paidAmount: number
  status: DebtStatus
  dueDate: string | null
  createdAt: string
}
