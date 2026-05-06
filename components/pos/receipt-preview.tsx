'use client'

import { useState, useCallback } from 'react'
import {
  Printer,
  X,
  Settings2,
  Bluetooth,
  BluetoothOff,
  Loader2,
} from 'lucide-react'
import { formatRupiah, formatDateTime } from '@/lib/format'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { getPrinter, isBluetoothSupported } from '@/lib/printer/bluetooth'
import { buildReceipt } from '@/lib/printer/receipt-builder'
import { PrinterSetup } from '@/components/pos/printer-setup'
import type { Transaction } from '@/types'

interface ReceiptPreviewProps {
  transaction: Transaction
  onClose: () => void
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
  const [isPrinting, setIsPrinting] = useState(false)
  const [printError, setPrintError] = useState<string | null>(null)

  const printer = getPrinter()
  const isConnected = printer.isConnected

  const handleThermalPrint = useCallback(async () => {
    setPrintError(null)
    setIsPrinting(true)

    try {
      const data = buildReceipt(transaction, {
        paperSize: printerPaperSize,
        storeName,
        storeAddress,
        storePhone,
        receiptFooter,
        cashierName: userName,
      })
      await printer.print(data)
    } catch (err) {
      setPrintError(
        err instanceof Error ? err.message : 'Gagal mencetak struk.'
      )
    } finally {
      setIsPrinting(false)
    }
  }, [
    transaction,
    printer,
    printerPaperSize,
    storeName,
    storeAddress,
    storePhone,
    receiptFooter,
    userName,
  ])

  const handleBrowserPrint = useCallback(() => {
    const printArea = document.getElementById('receipt-print-area')
    if (!printArea) return

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      setPrintError('Popup diblokir oleh browser. Izinkan popup untuk mencetak.')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Struk</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.5;
            color: #000;
            background: #fff;
            padding: 10px;
            width: 80mm;
          }
          .flex {
            display: flex;
          }
          .justify-between {
            justify-content: space-between;
          }
          .text-center {
            text-align: center;
          }
          @media print {
            body {
              padding: 0;
              width: 80mm;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to render then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }

    // Fallback: if onload doesn't fire (some browsers)
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }, 500)
  }, [])

  const handlePrint = useCallback(() => {
    if (isConnected) {
      handleThermalPrint()
    } else {
      handleBrowserPrint()
    }
  }, [isConnected, handleThermalPrint, handleBrowserPrint])

  const totalDiscount =
    transaction.discountType === 'percentage'
      ? (transaction.subtotal * transaction.discountAmount) / 100
      : transaction.discountAmount

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative z-10 w-full max-w-[380px] mx-4 max-h-[90vh] flex flex-col rounded-2xl border bg-card shadow-2xl print:shadow-none print:border-none print:rounded-none print:max-w-none print:max-h-none print:m-0">
          {/* Action bar — hidden in print */}
          <div className="flex items-center justify-between border-b px-4 py-3 print:hidden">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Struk Pembayaran</h3>
              {isBluetoothSupported() && (
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isConnected ? (
                    <Bluetooth className="h-2.5 w-2.5" />
                  ) : (
                    <BluetoothOff className="h-2.5 w-2.5" />
                  )}
                  {isConnected ? 'Printer' : 'Offline'}
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

          {/* Print error */}
          {printError && (
            <div className="mx-4 mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 print:hidden">
              <p className="text-xs text-destructive">{printError}</p>
            </div>
          )}

          {/* Receipt content — thermal receipt style */}
          <div className="overflow-y-auto flex-1 p-5 bg-gray-50 dark:bg-neutral-900/50 print:bg-white print:p-0">
            <div
              id="receipt-print-area"
              className="receipt-content mx-auto w-[300px] bg-white text-black shadow-md print:shadow-none print:w-full"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '12px',
                lineHeight: '1.5',
                padding: '24px 20px',
              }}
            >
              {/* === HEADER === */}
              <div className="text-center">
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    marginBottom: '2px',
                  }}
                >
                  {storeName || 'TOKO SAYA'}
                </p>
                {storeAddress && (
                  <p style={{ fontSize: '10px', color: '#555', margin: '0' }}>
                    {storeAddress}
                  </p>
                )}
                {storePhone && (
                  <p style={{ fontSize: '10px', color: '#555', margin: '0' }}>
                    {storePhone}
                  </p>
                )}
              </div>

              {/* Dashed divider */}
              <div
                style={{
                  borderTop: '1px dashed #000',
                  margin: '10px 0',
                }}
              />

              {/* === INFO TRANSAKSI === */}
              <div style={{ fontSize: '11px' }}>
                <div className="flex justify-between">
                  <span>No. Invoice</span>
                  <span style={{ fontWeight: 600 }}>
                    {transaction.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal</span>
                  <span>{formatDateTime(transaction.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir</span>
                  <span>{userName || 'Admin'}</span>
                </div>
              </div>

              {/* Dashed divider */}
              <div
                style={{
                  borderTop: '1px dashed #000',
                  margin: '10px 0',
                }}
              />

              {/* === ITEM LIST === */}
              <div>
                {transaction.items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom:
                        index < transaction.items.length - 1 ? '8px' : '0',
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        margin: '0 0 1px 0',
                        fontSize: '11px',
                      }}
                    >
                      {item.productName}
                    </p>
                    <div className="flex justify-between" style={{ fontSize: '11px' }}>
                      <span>
                        {item.quantity} x {formatRupiah(item.unitPrice)}
                      </span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                    {item.discountAmount > 0 && (
                      <div
                        className="flex justify-between"
                        style={{ fontSize: '10px', color: '#666' }}
                      >
                        <span>&nbsp;&nbsp;Diskon item</span>
                        <span>-{formatRupiah(item.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Dashed divider */}
              <div
                style={{
                  borderTop: '1px dashed #000',
                  margin: '10px 0',
                }}
              />

              {/* === SUMMARY === */}
              <div style={{ fontSize: '11px' }}>
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

              {/* Dashed divider */}
              <div
                style={{
                  borderTop: '1px dashed #000',
                  margin: '10px 0',
                }}
              />

              {/* === TOTAL === */}
              <div
                className="flex justify-between"
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}
              >
                <span>TOTAL</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>

              {/* === PAYMENT === */}
              <div style={{ fontSize: '11px', marginTop: '6px' }}>
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
                {transaction.paymentMethod === 'cash' &&
                  transaction.changeAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Kembalian</span>
                      <span>{formatRupiah(transaction.changeAmount)}</span>
                    </div>
                  )}
              </div>

              {/* Dashed divider */}
              <div
                style={{
                  borderTop: '1px dashed #000',
                  margin: '12px 0 10px 0',
                }}
              />

              {/* === FOOTER === */}
              <div className="text-center" style={{ fontSize: '10px', color: '#555' }}>
                <p style={{ margin: '0 0 2px 0' }}>
                  {receiptFooter || 'Terima kasih telah berbelanja!'}
                </p>
                <p style={{ margin: '0', fontSize: '9px' }}>
                  Barang yang sudah dibeli tidak dapat dikembalikan
                </p>
              </div>
            </div>
          </div>

          {/* Bottom action buttons — hidden in print */}
          <div className="flex items-center gap-3 border-t px-4 py-3 print:hidden">
            <Button
              className="flex-1"
              variant={isConnected ? 'default' : 'outline'}
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {isPrinting ? 'Mencetak...' : 'Cetak Struk'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* Printer setup dialog */}
      <PrinterSetup
        open={showPrinterSetup}
        onClose={() => setShowPrinterSetup(false)}
      />
    </>
  )
}
