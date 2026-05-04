export type DebtStatus = 'unpaid' | 'partial' | 'paid'

export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  totalDebt: number
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
