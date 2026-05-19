'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Trash2, Banknote, QrCode, BookOpen, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { formatDateTime } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTransactionStore } from '@/stores/transaction-store'
import { useToast } from '@/components/ui/toast'
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
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteTransaction } = useTransactionStore()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const result = await deleteTransaction(deleteTarget.id)

    if (result.success) {
      toast('Transaksi berhasil dihapus', 'success')
    } else {
      toast(result.error || 'Gagal menghapus transaksi', 'error')
    }

    setIsDeleting(false)
    setDeleteTarget(null)
  }

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
    <>
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
                    <div className="inline-flex items-center gap-1">
                      <Link href={`/transactions/${trx.id}`}>
                        <Button variant="ghost" size="icon-sm" title="Lihat detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Hapus transaksi"
                        onClick={() => setDeleteTarget(trx)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">
              Hapus transaksi?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Transaksi <span className="font-medium text-foreground">{deleteTarget.invoiceNumber}</span> yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
