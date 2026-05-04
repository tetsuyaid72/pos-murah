'use client'

import { useState, useCallback } from 'react'
import {
  Printer,
  Download,
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

  const handlePrint = useCallback(() => {
    if (isConnected) {
      handleThermalPrint()
    } else {
      // Fallback to browser print
      window.print()
    }
  }, [isConnected, handleThermalPrint])

  const handlePDF = () => {
    window.print()
  }

  const totalDiscount =
    transaction.discountType === 'percentage'
      ? (transaction.subtotal * transaction.discountAmount) / 100
      : transaction.discountAmount

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative z-10 w-full max-w-sm mx-4 max-h-[90vh] flex flex-col rounded-2xl border bg-card shadow-2xl">
          {/* Action buttons — hidden in print */}
          <div className="flex items-center justify-between border-b px-4 py-3 print:hidden">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Preview Struk</h3>
              {/* Printer status indicator */}
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
              <Button
                size="sm"
                variant={isConnected ? 'default' : 'outline'}
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isPrinting ? 'Cetak...' : 'Cetak'}
              </Button>
              <Button size="sm" variant="outline" onClick={handlePDF}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                PDF
              </Button>
              <button
                onClick={() => setShowPrinterSetup(true)}
                className="rounded-full p-1.5 hover:bg-accent cursor-pointer"
                title="Pengaturan Printer"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-accent cursor-pointer"
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

          {/* Receipt content — this is what gets printed */}
          <div className="overflow-y-auto p-4">
            <div
              id="receipt-print-area"
              className="receipt-content mx-auto max-w-[280px] font-mono text-xs leading-relaxed"
            >
              {/* Store header */}
              <div className="text-center">
                <p className="text-sm font-bold uppercase">
                  {storeName || 'Warung Madura'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {storeAddress}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {storePhone}
                </p>
              </div>

              <div className="my-2 border-t border-dashed border-foreground/30" />

              {/* Transaction info */}
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span>Invoice</span>
                  <span className="font-medium">
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

              <div className="my-2 border-t border-dashed border-foreground/30" />

              {/* Items */}
              <div className="space-y-1.5">
                {transaction.items.map((item) => (
                  <div key={item.id}>
                    <p className="font-medium">{item.productName}</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        {item.quantity} x {formatRupiah(item.unitPrice)}
                      </span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                    {item.discountAmount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Diskon item</span>
                        <span>-{formatRupiah(item.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="my-2 border-t border-dashed border-foreground/30" />

              {/* Totals */}
              <div className="space-y-0.5">
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

              <div className="my-2 border-t border-dashed border-foreground/30" />

              {/* Grand total */}
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>

              <div className="mt-1 space-y-0.5">
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
                      <span>
                        {formatRupiah(transaction.changeAmount)}
                      </span>
                    </div>
                  )}
              </div>

              <div className="my-2 border-t border-dashed border-foreground/30" />

              {/* Footer */}
              <div className="text-center text-[10px] text-muted-foreground">
                <p>
                  {receiptFooter || 'Terima kasih telah berbelanja!'}
                </p>
              </div>
            </div>
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
