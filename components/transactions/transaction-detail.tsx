'use client'

import { Banknote, QrCode, BookOpen, Calendar, User, Hash } from 'lucide-react'
import { formatRupiah, formatDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Transaction, PaymentMethod } from '@/types'

interface TransactionDetailProps {
  transaction: Transaction
}

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  debt: 'Hutang',
}

const paymentIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  qris: QrCode,
  debt: BookOpen,
}

export function TransactionDetail({ transaction: trx }: TransactionDetailProps) {
  const PayIcon = paymentIcons[trx.paymentMethod]
  const profit = trx.items.reduce(
    (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount,
    0
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{trx.invoiceNumber}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(trx.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <PayIcon className="h-4 w-4" />
                  {paymentLabels[trx.paymentMethod]}
                </span>
              </div>
            </div>
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
          </div>
        </CardHeader>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trx.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(item.unitPrice)} x {item.quantity}
                    {item.discountAmount > 0 && (
                      <span className="text-destructive">
                        {' '}- {formatRupiah(item.discountAmount)}
                      </span>
                    )}
                  </p>
                </div>
                <p className="shrink-0 font-medium tabular-nums">
                  {formatRupiah(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatRupiah(trx.subtotal)}</span>
            </div>

            {trx.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Diskon</span>
                <span className="tabular-nums">-{formatRupiah(trx.discountAmount)}</span>
              </div>
            )}

            {trx.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pajak</span>
                <span className="tabular-nums">{formatRupiah(trx.taxAmount)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary tabular-nums">
                {formatRupiah(trx.totalAmount)}
              </span>
            </div>

            {trx.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dibayar</span>
                  <span className="tabular-nums">{formatRupiah(trx.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span className="font-medium text-success tabular-nums">
                    {formatRupiah(trx.changeAmount)}
                  </span>
                </div>
              </>
            )}
          </div>

          <Separator className="my-4" />

          {/* Profit */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimasi Profit</span>
            <span className="font-semibold text-success tabular-nums">
              {formatRupiah(profit)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {trx.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{trx.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
