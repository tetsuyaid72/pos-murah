import type { Transaction } from '@/types'
import { formatRupiah } from '@/lib/format'

/**
 * Generate CSV string from transactions
 * Uses BOM prefix for Excel UTF-8 compatibility
 */
export function generateCSV(transactions: Transaction[]): string {
  const BOM = '\uFEFF'
  const headers = [
    'Tanggal',
    'Invoice',
    'Item',
    'Qty',
    'Harga Satuan',
    'Subtotal Item',
    'Total Transaksi',
    'Metode Bayar',
    'Status',
  ]

  const rows: string[] = []

  for (const trx of transactions) {
    for (const item of trx.items) {
      rows.push(
        [
          trx.createdAt.slice(0, 10),
          trx.invoiceNumber,
          `"${item.productName}"`,
          item.quantity.toString(),
          item.unitPrice.toString(),
          item.subtotal.toString(),
          trx.totalAmount.toString(),
          trx.paymentMethod === 'cash'
            ? 'Tunai'
            : trx.paymentMethod === 'qris'
              ? 'QRIS'
              : 'Hutang',
          trx.status === 'completed'
            ? 'Selesai'
            : trx.status === 'pending'
              ? 'Pending'
              : 'Void',
        ].join(',')
      )
    }
  }

  return BOM + headers.join(',') + '\n' + rows.join('\n')
}

/**
 * Download CSV file via Blob API
 */
export function downloadCSV(transactions: Transaction[], filename?: string) {
  const csv = generateCSV(transactions)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `laporan-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
