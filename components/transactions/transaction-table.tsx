'use client'

import Link from 'next/link'
import { Eye, Banknote, QrCode, BookOpen } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Transaction, PaymentMethod } from '@/types'

interface TransactionTableProps {
  transactions: Transaction[]
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

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">Belum ada transaksi.</p>
        <p className="text-sm text-muted-foreground/70">
          Transaksi akan muncul setelah Anda melakukan penjualan di kasir.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Invoice
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
              Waktu
            </th>
            <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground md:table-cell">
              Item
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">
              Bayar
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Total
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((trx) => {
            const PayIcon = paymentIcons[trx.paymentMethod]
            const itemCount = trx.items.reduce((sum, i) => sum + i.quantity, 0)

            return (
              <tr
                key={trx.id}
                className="border-b transition-colors hover:bg-muted/30"
              >
                {/* Invoice */}
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{trx.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {formatDateTime(trx.createdAt)}
                  </p>
                </td>

                {/* Time */}
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {formatDateTime(trx.createdAt)}
                </td>

                {/* Item count */}
                <td className="hidden px-4 py-3 text-center text-muted-foreground md:table-cell">
                  {itemCount}
                </td>

                {/* Payment method */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <PayIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{paymentLabels[trx.paymentMethod]}</span>
                  </div>
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {formatRupiah(trx.totalAmount)}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={
                      trx.status === 'completed'
                        ? 'success'
                        : trx.status === 'voided'
                          ? 'destructive'
                          : 'warning'
                    }
                  >
                    {trx.status === 'completed'
                      ? 'Selesai'
                      : trx.status === 'voided'
                        ? 'Batal'
                        : 'Pending'}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <Link href={`/transactions/${trx.id}`}>
                    <Button variant="ghost" size="icon-sm" title="Lihat detail">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
