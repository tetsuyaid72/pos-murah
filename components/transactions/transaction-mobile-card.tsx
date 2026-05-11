'use client'

import Link from 'next/link'
import { Banknote, BookOpen, QrCode, Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatRupiah } from '@/lib/format'
import type { PaymentMethod, Transaction } from '@/types'

interface TransactionMobileCardProps {
  transaction: Transaction
  href: string
}

const paymentIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  qris: QrCode,
  debt: BookOpen,
}

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  debt: 'Hutang',
}

function getStatusMeta(status: Transaction['status']) {
  if (status === 'completed') {
    return { label: 'Selesai', variant: 'success' as const, dotClassName: 'bg-emerald-500' }
  }

  if (status === 'voided') {
    return { label: 'Batal', variant: 'destructive' as const, dotClassName: 'bg-rose-500' }
  }

  return { label: 'Pending', variant: 'warning' as const, dotClassName: 'bg-amber-500' }
}

export function TransactionMobileCard({ transaction, href }: TransactionMobileCardProps) {
  const PayIcon = paymentIcons[transaction.paymentMethod]
  const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0)
  const statusMeta = getStatusMeta(transaction.status)

  return (
    <Link href={href} className="block">
      <div className="cursor-pointer rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition active:scale-[0.99]">
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="truncate text-sm font-semibold text-foreground">
                  {transaction.invoiceNumber}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(transaction.createdAt)}
              </p>
            </div>
            <Badge variant={statusMeta.variant} className="shrink-0 px-2.5 py-1 text-[11px] font-semibold">
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusMeta.dotClassName}`} />
              {statusMeta.label}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted px-2 py-2">
              <p className="text-[11px] text-muted-foreground">Bayar</p>
              <div className="mt-0.5 flex items-center gap-1">
                <PayIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                <p className="truncate text-xs font-semibold text-foreground">
                  {paymentLabels[transaction.paymentMethod]}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-muted px-2 py-2">
              <p className="text-[11px] text-muted-foreground">Total</p>
              <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                {formatRupiah(transaction.totalAmount)}
              </p>
            </div>
            <div className="rounded-xl bg-muted px-2 py-2">
              <p className="text-[11px] text-muted-foreground">Item</p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">
                {itemCount} item
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
