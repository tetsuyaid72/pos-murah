'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionDetail } from '@/components/transactions/transaction-detail'
import type { Transaction } from '@/types'

export default function DemoTransactionDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransaction() {
      try {
        const res = await fetch(`/api/demo/transactions/${params.id}`)
        if (!res.ok) {
          router.push('/demo/transactions')
          return
        }
        const data = await res.json()
        const t = data.transaction
        setTransaction({
          ...t,
          paymentMethod: (t.paymentMethod || 'cash').toLowerCase(),
          status: (t.status || 'completed').toLowerCase(),
          discountType: (t.discountType || 'fixed').toLowerCase(),
        } as Transaction)
      } catch {
        router.push('/demo/transactions')
      } finally {
        setLoading(false)
      }
    }
    loadTransaction()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Memuat transaksi...</p>
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b px-4 py-4 md:px-6">
        <Link href="/demo/transactions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Detail Transaksi</h1>
          <p className="text-sm text-muted-foreground">{transaction.invoiceNumber}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <TransactionDetail transaction={transaction} />
      </div>
    </div>
  )
}
