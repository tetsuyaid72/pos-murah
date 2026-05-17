import type { Transaction } from '@/types'
import { formatDate, formatRupiah } from '@/lib/format'

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getPaymentLabel(method: Transaction['paymentMethod']): string {
  if (method === 'cash') return 'Tunai'
  if (method === 'qris') return 'QRIS'
  return 'Hutang'
}

function getStatusLabel(status: Transaction['status']): string {
  if (status === 'completed') return 'Selesai'
  if (status === 'pending') return 'Pending'
  return 'Void'
}

export function generateReportHTML(transactions: Transaction[]): string {
  const completedTransactions = transactions.filter((trx) => trx.status === 'completed')
  const totalRevenue = completedTransactions.reduce((sum, trx) => sum + trx.totalAmount, 0)
  const totalProfit = completedTransactions.reduce(
    (sum, trx) =>
      sum +
      trx.items.reduce(
        (itemSum, item) => itemSum + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount,
        0
      ),
    0
  )
  const rows = transactions
    .map((trx) => {
      const itemNames = trx.items.map((item) => `${item.quantity}x ${item.productName}`).join(', ')
      return `
        <tr>
          <td>${escapeHtml(formatDate(trx.createdAt))}</td>
          <td>${escapeHtml(trx.invoiceNumber)}</td>
          <td>${escapeHtml(itemNames)}</td>
          <td class="num">${formatRupiah(trx.totalAmount)}</td>
          <td>${getPaymentLabel(trx.paymentMethod)}</td>
          <td>${getStatusLabel(trx.status)}</td>
        </tr>
      `
    })
    .join('')

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Laporan Penjualan</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { color: #0f172a; font-family: Arial, sans-serif; margin: 0; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #64748b; font-size: 12px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 18px 0; }
    .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
    .label { color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .value { font-size: 18px; font-weight: 800; margin-top: 6px; }
    table { border-collapse: collapse; font-size: 11px; width: 100%; }
    th { background: #f1f5f9; color: #475569; font-size: 10px; letter-spacing: .06em; text-align: left; text-transform: uppercase; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
    .num { text-align: right; white-space: nowrap; }
    .footer { color: #94a3b8; font-size: 10px; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Laporan Penjualan</h1>
  <div class="muted">Dicetak pada ${escapeHtml(new Date().toLocaleString('id-ID'))}</div>

  <section class="summary">
    <div class="card"><div class="label">Pendapatan</div><div class="value">${formatRupiah(totalRevenue)}</div></div>
    <div class="card"><div class="label">Profit</div><div class="value">${formatRupiah(totalProfit)}</div></div>
    <div class="card"><div class="label">Transaksi</div><div class="value">${completedTransactions.length}</div></div>
  </section>

  <table>
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Invoice</th>
        <th>Item</th>
        <th class="num">Total</th>
        <th>Metode</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="6">Tidak ada transaksi.</td></tr>'}</tbody>
  </table>
  <div class="footer">Gunakan dialog cetak browser untuk menyimpan laporan ini sebagai PDF.</div>
</body>
</html>`
}

export function downloadPDF(transactions: Transaction[]) {
  const printWindow = window.open('', '_blank', 'width=1024,height=768')
  if (!printWindow) return

  printWindow.document.open()
  printWindow.document.write(generateReportHTML(transactions))
  printWindow.document.close()
  printWindow.focus()
  printWindow.setTimeout(() => {
    printWindow.print()
  }, 250)
}
