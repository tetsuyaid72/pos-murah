'use client'

import type React from 'react'
import { useState, useCallback } from 'react'
import {
  X,
  Settings2,
  Bluetooth,
  BluetoothOff,
  Loader2,
  ImageDown,
  Printer,
} from 'lucide-react'
import { formatRupiah, formatDateTime } from '@/lib/format'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { isBluetoothSupported } from '@/lib/printer/bluetooth'
import { thermalPrinterService } from '@/lib/printer/thermal-printer-service'
import { PrinterSetup } from '@/components/pos/printer-setup'
import type { Transaction } from '@/types'

interface ReceiptPreviewProps {
  transaction: Transaction
  onClose: () => void
}

const CANVAS_WIDTH = 384
const PADDING_X = 18
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING_X * 2
const LINE_HEIGHT = 24
const HEADER_FONT = '700 24px "Courier New", monospace'
const BODY_FONT = '600 15px "Courier New", monospace'
const TOTAL_FONT = '700 21px "Courier New", monospace'
const SMALL_FONT = '600 14px "Courier New", monospace'
const TEXT_COLOR = '#000000'
const BG_COLOR = '#ffffff'

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const trimmed = text.trim()
  if (!trimmed) return ['']

  const words = trimmed.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
      continue
    }

    if (current) lines.push(current)
    current = ''

    if (ctx.measureText(word).width <= maxWidth) {
      current = word
      continue
    }

    let chunk = ''
    for (const char of word) {
      const next = chunk + char
      if (ctx.measureText(next).width <= maxWidth) {
        chunk = next
      } else {
        if (chunk) lines.push(chunk)
        chunk = char
      }
    }
    current = chunk
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

function createReceiptCanvas(
  transaction: Transaction,
  options: {
    storeName: string
    storeAddress: string
    storePhone: string
    receiptFooter: string
    userName: string
  }
) {
  const { storeName, storeAddress, storePhone, receiptFooter, userName } = options
  const totalDiscount =
    transaction.discountType === 'percentage'
      ? (transaction.subtotal * transaction.discountAmount) / 100
      : transaction.discountAmount

  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d', { alpha: false })
  if (!measureCtx) {
    throw new Error('Canvas export tidak tersedia.')
  }

  const rowGap = 3
  const sectionGap = 9

  const lines: Array<
    | { type: 'text-left'; text: string; font: string }
    | { type: 'text-center'; text: string; font: string }
    | { type: 'row'; left: string; right: string; font: string }
    | { type: 'meta'; label: string; value: string; font: string }
    | { type: 'separator' }
    | { type: 'space'; height: number }
  > = []

  const pushWrappedCenter = (text: string, font = BODY_FONT) => {
    measureCtx.font = font
    for (const line of wrapCanvasText(measureCtx, text, CONTENT_WIDTH)) {
      lines.push({ type: 'text-center', text: line, font })
    }
  }

  lines.push({ type: 'text-center', text: storeName || 'TOKO SAYA', font: HEADER_FONT })
  if (storeAddress) pushWrappedCenter(storeAddress, SMALL_FONT)
  if (storePhone) pushWrappedCenter(storePhone, SMALL_FONT)
  lines.push({ type: 'space', height: 5 })
  lines.push({ type: 'separator' })
  lines.push({ type: 'space', height: 5 })

  lines.push({
    type: 'meta',
    label: 'No. Invoice',
    value: transaction.invoiceNumber,
    font: BODY_FONT,
  })
  lines.push({ type: 'space', height: rowGap })
  lines.push({
    type: 'meta',
    label: 'Tanggal',
    value: formatDateTime(transaction.createdAt),
    font: BODY_FONT,
  })
  lines.push({ type: 'space', height: rowGap })
  lines.push({
    type: 'meta',
    label: 'Kasir',
    value: userName || 'Admin',
    font: BODY_FONT,
  })
  lines.push({ type: 'space', height: 5 })
  lines.push({ type: 'separator' })
  lines.push({ type: 'space', height: 5 })

  for (const item of transaction.items) {
    measureCtx.font = BODY_FONT
    for (const line of wrapCanvasText(measureCtx, item.productName, CONTENT_WIDTH)) {
      lines.push({ type: 'text-left', text: line, font: BODY_FONT })
    }
    lines.push({
      type: 'row',
      left: `${item.quantity} x ${formatRupiah(item.unitPrice)}`,
      right: formatRupiah(item.subtotal),
      font: BODY_FONT,
    })
    if (item.discountAmount > 0) {
      lines.push({
        type: 'row',
        left: 'Diskon item',
        right: `-${formatRupiah(item.discountAmount)}`,
        font: SMALL_FONT,
      })
    }
    lines.push({ type: 'space', height: rowGap })
  }

  lines.push({ type: 'separator' })
  lines.push({ type: 'space', height: 5 })
  lines.push({
    type: 'row',
    left: 'Subtotal',
    right: formatRupiah(transaction.subtotal),
    font: BODY_FONT,
  })
  if (totalDiscount > 0) {
    lines.push({
      type: 'row',
      left: 'Diskon',
      right: `-${formatRupiah(totalDiscount)}`,
      font: BODY_FONT,
    })
  }
  lines.push({ type: 'space', height: 5 })
  lines.push({ type: 'separator' })
  lines.push({ type: 'space', height: 5 })
  lines.push({
    type: 'row',
    left: 'TOTAL',
    right: formatRupiah(transaction.totalAmount),
    font: TOTAL_FONT,
  })
  lines.push({ type: 'space', height: 5 })
  lines.push({
    type: 'row',
    left: `Bayar (${transaction.paymentMethod === 'cash' ? 'Tunai' : transaction.paymentMethod === 'qris' ? 'QRIS' : 'Hutang'})`,
    right: formatRupiah(transaction.amountPaid),
    font: BODY_FONT,
  })
  if (transaction.paymentMethod === 'cash' && transaction.changeAmount > 0) {
    lines.push({
      type: 'row',
      left: 'Kembalian',
      right: formatRupiah(transaction.changeAmount),
      font: BODY_FONT,
    })
  }
  lines.push({ type: 'space', height: 5 })
  lines.push({ type: 'separator' })
  lines.push({ type: 'space', height: 6 })
  pushWrappedCenter(receiptFooter || 'Terima kasih telah berbelanja!', SMALL_FONT)
  pushWrappedCenter('Barang yang sudah dibeli tidak dapat dikembalikan', SMALL_FONT)

  let height = 18
  for (const line of lines) {
    if (line.type === 'space') {
      height += line.height
    } else if (line.type === 'separator') {
      height += sectionGap
    } else {
      height += LINE_HEIGHT
    }
  }
  height += 18

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    throw new Error('Canvas export tidak tersedia.')
  }

  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = TEXT_COLOR
  ctx.textBaseline = 'top'
  ctx.imageSmoothingEnabled = false

  const drawTextLeft = (text: string, y: number) => {
    ctx.fillText(text, PADDING_X, y)
  }

  const drawTextCenter = (text: string, y: number) => {
    const width = ctx.measureText(text).width
    ctx.fillText(text, (CANVAS_WIDTH - width) / 2, y)
  }

  const drawTextRight = (text: string, y: number) => {
    const width = ctx.measureText(text).width
    ctx.fillText(text, CANVAS_WIDTH - PADDING_X - width, y)
  }

  const drawRowLeftRight = (leftText: string, rightText: string, y: number) => {
    const rightWidth = ctx.measureText(rightText).width
    const maxLeftWidth = CONTENT_WIDTH - rightWidth - 14
    const leftLines = wrapCanvasText(ctx, leftText, Math.max(40, maxLeftWidth))

    for (let index = 0; index < leftLines.length; index += 1) {
      drawTextLeft(leftLines[index], y + index * LINE_HEIGHT)
    }
    drawTextRight(rightText, y + (leftLines.length - 1) * LINE_HEIGHT)

    return leftLines.length * LINE_HEIGHT
  }

  const drawMetaRow = (label: string, value: string, y: number) => {
    const labelWidth = 120
    const valueX = PADDING_X + labelWidth
    const valueWidth = CANVAS_WIDTH - PADDING_X - valueX
    const valueTextWidth = ctx.measureText(value).width

    drawTextLeft(label, y)

    if (valueTextWidth <= valueWidth) {
      ctx.fillText(value, CANVAS_WIDTH - PADDING_X - valueTextWidth, y)
      return LINE_HEIGHT
    }

    const wrappedValueLines = wrapCanvasText(ctx, value, valueWidth)
    for (let index = 0; index < wrappedValueLines.length; index += 1) {
      const line = wrappedValueLines[index]
      const lineWidth = ctx.measureText(line).width
      ctx.fillText(line, CANVAS_WIDTH - PADDING_X - lineWidth, y + index * LINE_HEIGHT)
    }

    return wrappedValueLines.length * LINE_HEIGHT
  }

  const drawSeparator = (y: number) => {
    ctx.strokeStyle = TEXT_COLOR
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(PADDING_X, y + 7)
    ctx.lineTo(CANVAS_WIDTH - PADDING_X, y + 7)
    ctx.stroke()
  }

  let y = 18
  for (const line of lines) {
    if (line.type === 'space') {
      y += line.height
      continue
    }

    if (line.type === 'separator') {
      drawSeparator(y)
      y += sectionGap
      continue
    }

    ctx.font = line.font

    if (line.type === 'text-left') {
      drawTextLeft(line.text, y)
      y += LINE_HEIGHT
      continue
    }

    if (line.type === 'text-center') {
      drawTextCenter(line.text, y)
      y += LINE_HEIGHT
      continue
    }

    if (line.type === 'row') {
      y += drawRowLeftRight(line.left, line.right, y)
      continue
    }

    if (line.type === 'meta') {
      y += drawMetaRow(line.label, line.value, y)
    }
  }

  return canvas
}

export function ReceiptPreview({ transaction, onClose }: ReceiptPreviewProps) {
  const {
    storeName,
    storeAddress,
    storePhone,
    receiptFooter,
    userName,
    printerPaperSize,
  } = useSettingsStore()

  const [showPrinterSetup, setShowPrinterSetup] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printError, setPrintError] = useState<string | null>(null)

  const saveReceiptImage = useCallback(async () => {
    setPrintError(null)
    setIsSavingImage(true)

    try {
      const canvas = createReceiptCanvas(transaction, {
        storeName,
        storeAddress,
        storePhone,
        receiptFooter,
        userName,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `struk-${transaction.invoiceNumber}.png`
      link.click()
    } catch {
      setPrintError('Gagal menyimpan struk sebagai gambar PNG.')
    } finally {
      setIsSavingImage(false)
    }
  }, [transaction, storeName, storeAddress, storePhone, receiptFooter, userName])

  const printThermalReceipt = useCallback(async () => {
    setPrintError(null)
    setIsPrinting(true)

    try {
      const result = await thermalPrinterService.printThermalReceipt(transaction, {
        paperSize: printerPaperSize,
        storeName,
        storeAddress,
        storePhone,
        receiptFooter,
        cashierName: userName,
      })

      if (!result.ok) {
        setPrintError(result.message)
      }
    } catch {
      setPrintError('Gagal mencetak struk. Pastikan Thermal-Bridge terpasang, Bluetooth aktif, dan ulangi pairing printer RPP02N.')
    } finally {
      setIsPrinting(false)
    }
  }, [transaction, printerPaperSize, storeName, storeAddress, storePhone, receiptFooter, userName])

  const totalDiscount =
    transaction.discountType === 'percentage'
      ? (transaction.subtotal * transaction.discountAmount) / 100
      : transaction.discountAmount

  const paperWidth = printerPaperSize === '80mm' ? '80mm' : '58mm'

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        style={{ '--receipt-paper-width': paperWidth } as React.CSSProperties}
      >
        <div
          className="no-print absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative z-10 mx-4 flex max-h-[90vh] w-full max-w-[380px] flex-col rounded-2xl border bg-card shadow-2xl">
          <div className="no-print flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Struk Pembayaran</h3>
              {isBluetoothSupported() && (
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    printerPaperSize === '58mm'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {printerPaperSize === '58mm' ? (
                    <Bluetooth className="h-2.5 w-2.5" />
                  ) : (
                    <BluetoothOff className="h-2.5 w-2.5" />
                  )}
                  {printerPaperSize === '58mm' ? 'Thermal 58mm' : 'Thermal 80mm'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPrinterSetup(true)}
                className="rounded-full p-1.5 hover:bg-accent cursor-pointer"
                title="Pengaturan Printer"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-accent cursor-pointer"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {printError && (
            <div className="no-print mx-4 mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-xs text-destructive">{printError}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-neutral-900/50 sm:p-5">
            <div
              id="receipt-print-area"
              className="receipt-print-area receipt-content mx-auto bg-white text-black shadow-md"
              style={{
                width: paperWidth,
                maxWidth: paperWidth,
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '10px',
                lineHeight: '1.45',
                padding: '4mm 3mm',
              }}
            >
              <div className="text-center">
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '0.2px',
                    marginBottom: '2px',
                  }}
                >
                  {storeName || 'TOKO SAYA'}
                </p>
                {storeAddress && (
                  <p style={{ fontSize: '9px', color: '#000', margin: '0' }}>
                    {storeAddress}
                  </p>
                )}
                {storePhone && (
                  <p style={{ fontSize: '9px', color: '#000', margin: '0' }}>
                    {storePhone}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  alignItems: 'start',
                  columnGap: '8px',
                  rowGap: '4px',
                  fontSize: '10px',
                }}
              >
                <span>No. Invoice</span>
                <span
                  style={{
                    fontWeight: 600,
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {transaction.invoiceNumber}
                </span>
                <span>Tanggal</span>
                <span
                  style={{
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {formatDateTime(transaction.createdAt)}
                </span>
                <span>Kasir</span>
                <span
                  style={{
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {userName || 'Admin'}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

              <div>
                {transaction.items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ marginBottom: index < transaction.items.length - 1 ? '8px' : '0' }}
                  >
                    <p style={{ fontWeight: 600, margin: '0 0 1px 0', fontSize: '10px' }}>
                      {item.productName}
                    </p>
                    <div className="flex justify-between" style={{ fontSize: '10px' }}>
                      <span>
                        {item.quantity} x {formatRupiah(item.unitPrice)}
                      </span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                    {item.discountAmount > 0 && (
                      <div className="flex justify-between" style={{ fontSize: '9px', color: '#000' }}>
                        <span>&nbsp;&nbsp;Diskon item</span>
                        <span>-{formatRupiah(item.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

              <div style={{ fontSize: '10px' }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(transaction.subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Diskon</span>
                    <span>-{formatRupiah(totalDiscount)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

              <div
                className="flex justify-between"
                style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
              >
                <span>TOTAL</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>

              <div style={{ fontSize: '10px', marginTop: '6px' }}>
                <div className="flex justify-between">
                  <span>
                    Bayar (
                    {transaction.paymentMethod === 'cash'
                      ? 'Tunai'
                      : transaction.paymentMethod === 'qris'
                        ? 'QRIS'
                        : 'Hutang'}
                    )
                  </span>
                  <span>{formatRupiah(transaction.amountPaid)}</span>
                </div>
                {transaction.paymentMethod === 'cash' && transaction.changeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Kembalian</span>
                    <span>{formatRupiah(transaction.changeAmount)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px dashed #000', margin: '12px 0 10px 0' }} />

              <div className="text-center" style={{ fontSize: '9px', color: '#000' }}>
                <p style={{ margin: '0 0 2px 0' }}>
                  {receiptFooter || 'Terima kasih telah berbelanja!'}
                </p>
                <p style={{ margin: '0', fontSize: '8px' }}>
                  Barang yang sudah dibeli tidak dapat dikembalikan
                </p>
              </div>
            </div>
          </div>

          <div className="no-print border-t px-4 py-3">
            <div className="grid gap-2">
              <Button
                className="w-full"
                variant="default"
                onClick={printThermalReceipt}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                {isPrinting ? 'Mencetak...' : 'Cetak Struk'}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={saveReceiptImage}
                disabled={isSavingImage}
              >
                {isSavingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageDown className="mr-2 h-4 w-4" />
                )}
                {isSavingImage ? 'Menyimpan...' : 'Simpan Gambar'}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PrinterSetup
        open={showPrinterSetup}
        onClose={() => setShowPrinterSetup(false)}
      />
    </>
  )
}
