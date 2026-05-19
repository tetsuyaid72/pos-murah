/**
 * Receipt Builder
 *
 * Converts a Transaction object into ESC/POS byte data ready to send to a thermal printer.
 * Uses the same formatting logic (formatRupiah, formatDateTime) as the on-screen receipt.
 */

import { EscPosEncoder, type PaperSize } from './escpos'
import { formatRupiah } from '@/lib/format'
import type { Transaction } from '@/types'

/** Configuration for receipt generation */
export interface ReceiptConfig {
  paperSize: PaperSize
  storeName: string
  storeAddress: string
  storePhone: string
  receiptFooter: string
  cashierName: string
}

/**
 * Format a Rupiah amount as a plain string (no currency symbol prefix for alignment).
 * Uses the same Intl formatter as formatRupiah but strips the "Rp" prefix for compact display.
 */
function rupiahCompact(amount: number): string {
  // formatRupiah returns "Rp 50.000" — we keep it as-is for receipt readability
  return formatRupiah(amount)
}

/**
 * Format a date string for receipt display.
 * Uses a compact format: DD/MM/YYYY HH:mm
 */
function receiptDate(dateString: string): string {
  const d = new Date(dateString)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Build a complete receipt as ESC/POS byte data.
 *
 * Receipt layout:
 * ```
 *       WARUNG MADURA           <- center, bold
 *   Jl. Raya No. 123, Jakarta   <- center
 *        08123456789             <- center
 * --------------------------------
 * Invoice    INV-2024-0001
 * Tanggal    03/05/2026 21:00
 * Kasir      Admin
 * --------------------------------
 * Gudang Garam Surya 16
 *   2 x Rp 31.000    Rp 62.000
 * Aqua 600ml
 *   3 x Rp 4.000     Rp 12.000
 * --------------------------------
 * Subtotal            Rp 74.000
 * Diskon              -Rp 5.000
 * --------------------------------
 * TOTAL               Rp 69.000   <- bold
 * Bayar (Tunai)       Rp 100.000
 * Kembalian           Rp 31.000
 * --------------------------------
 *   Terima kasih telah berbelanja!  <- center
 *
 * [cut]
 * ```
 */
export function buildReceipt(
  transaction: Transaction,
  config: ReceiptConfig
): Uint8Array {
  const encoder = new EscPosEncoder(config.paperSize)

  encoder.initialize()

  // ===== Store Header =====
  encoder
    .align('center')
    .bold(true)
    .fontSize('large')
    .textLine(config.storeName || 'Toko')
    .fontSize('normal')
    .bold(false)

  if (config.storeAddress) {
    encoder.textLine(config.storeAddress)
  }
  if (config.storePhone) {
    encoder.textLine(config.storePhone)
  }

  encoder.align('left')

  // ===== Separator =====
  encoder.separator()

  // ===== Transaction Info =====
  encoder
    .twoColumns('Invoice', transaction.invoiceNumber)
    .twoColumns('Tanggal', receiptDate(transaction.createdAt))
    .twoColumns('Kasir', config.cashierName || 'Admin')

  // ===== Separator =====
  encoder.separator()

  // ===== Items =====
  for (const item of transaction.items) {
    // Product name on its own line
    encoder.textLine(item.productName)

    // Quantity x price    subtotal
    const qtyPrice = `  ${item.quantity} x ${rupiahCompact(item.unitPrice)}`
    const subtotal = rupiahCompact(item.subtotal)
    encoder.twoColumns(qtyPrice, subtotal)

    // Item discount (if any)
    if (item.discountAmount > 0) {
      encoder.twoColumns('  Diskon item', `-${rupiahCompact(item.discountAmount)}`)
    }
  }

  // ===== Separator =====
  encoder.separator()

  // ===== Subtotal =====
  encoder.twoColumns('Subtotal', rupiahCompact(transaction.subtotal))

  // ===== Transaction Discount =====
  const totalDiscount =
    transaction.discountType === 'percentage'
      ? (transaction.subtotal * transaction.discountAmount) / 100
      : transaction.discountAmount

  if (totalDiscount > 0) {
    encoder.twoColumns('Diskon', `-${rupiahCompact(totalDiscount)}`)
  }

  // ===== Tax (if any) =====
  if (transaction.taxAmount > 0) {
    encoder.twoColumns('Pajak', rupiahCompact(transaction.taxAmount))
  }

  // ===== Separator =====
  encoder.separator()

  // ===== Grand Total =====
  encoder
    .bold(true)
    .twoColumns('TOTAL', rupiahCompact(transaction.totalAmount))
    .bold(false)

  // ===== Payment Info =====
  const paymentLabel =
    transaction.paymentMethod === 'cash'
      ? 'Bayar (Tunai)'
      : transaction.paymentMethod === 'qris'
        ? 'Bayar (QRIS)'
        : 'Bayar (Hutang)'

  encoder.twoColumns(paymentLabel, rupiahCompact(transaction.amountPaid))

  if (transaction.paymentMethod === 'cash' && transaction.changeAmount > 0) {
    encoder.twoColumns('Kembalian', rupiahCompact(transaction.changeAmount))
  }

  // ===== Separator =====
  encoder.separator()

  // ===== Footer =====
  if (config.receiptFooter) {
    encoder
      .align('center')
      .textLine(config.receiptFooter)
      .align('left')
  }

  // ===== Cut =====
  encoder.cut()

  return encoder.encode()
}

/**
 * Build a test receipt for verifying printer connection.
 */
export function buildTestReceipt(
  config: Pick<ReceiptConfig, 'paperSize' | 'storeName'>
): Uint8Array {
  const encoder = new EscPosEncoder(config.paperSize)

  encoder
    .initialize()
    .align('center')
    .bold(true)
    .fontSize('large')
    .textLine('TEST PRINT')
    .fontSize('normal')
    .bold(false)
    .newline()
    .textLine(config.storeName || 'Warung Madura POS')
    .newline()
    .separator()
    .textLine('Printer terhubung dengan baik!')
    .textLine(`Ukuran kertas: ${config.paperSize}`)
    .textLine(`Lebar: ${encoder.getWidth()} karakter`)
    .separator()
    .newline()
    .textLine('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef')
    .textLine('0123456789 !@#$%^&*()_+-=[]{}')
    .newline()
    .align('center')
    .textLine('-- Tes Selesai --')
    .align('left')
    .cut()

  return encoder.encode()
}
