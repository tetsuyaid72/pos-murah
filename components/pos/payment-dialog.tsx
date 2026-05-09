'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import dynamic from 'next/dynamic'
import {
  X,
  Banknote,
  QrCode,
  BookOpen,
  CheckCircle2,
  Printer,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRupiah } from '@/lib/format'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useProductStore } from '@/stores/product-store'
import { useTransactionStore } from '@/stores/transaction-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { PaymentMethod, Transaction } from '@/types'

const ReceiptPreview = dynamic(
  () => import('@/components/pos/receipt-preview').then((mod) => mod.ReceiptPreview),
  { ssr: false }
)

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
}

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000]

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: 'Tunai', icon: Banknote },
  { value: 'qris', label: 'QRIS', icon: QrCode },
  { value: 'debt', label: 'Hutang', icon: BookOpen },
]

export function PaymentDialog({ open, onClose }: PaymentDialogProps) {
  const { items, getTotal, getSubtotal, paymentMethod, setPaymentMethod, clearCart, discountAmount, discountType } =
    useCartStore()
  const { fetchProducts } = useProductStore()
  const { addTransaction } = useTransactionStore()
  const {
    autoPrint,
    printerPaperSize,
    storeName,
    storeAddress,
    storePhone,
    receiptFooter,
    userName,
  } = useSettingsStore()

  const [amountPaid, setAmountPaid] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const total = getTotal()
  const subtotal = getSubtotal()
  const paidNum = parseInt(amountPaid) || 0
  const change = paidNum - total

  const canPay =
    paymentMethod === 'cash'
      ? paidNum >= total
      : paymentMethod === 'qris'
        ? true
        : true // debt

  const resetDialogState = useCallback(() => {
    setAmountPaid('')
    setIsSuccess(false)
    setIsProcessing(false)
    setLastTransaction(null)
    setShowReceipt(false)
  }, [])

  const handleClose = useCallback(() => {
    resetDialogState()
    onClose()
  }, [resetDialogState, onClose])

  const handlePayment = useCallback(async () => {
    if (!canPay || isProcessing) return

    setIsProcessing(true)

    // Build transaction items for API
    const txItems = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice,
      discountAmount: item.discountAmount,
      subtotal: item.subtotal,
    }))

    // Save transaction via API (also decrements stock server-side)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: txItems,
          subtotal,
          discountAmount,
          discountType: discountType.toUpperCase(),
          taxAmount: 0,
          totalAmount: total,
          paymentMethod: paymentMethod.toUpperCase(),
          amountPaid: paymentMethod === 'cash' ? paidNum : total,
          changeAmount: paymentMethod === 'cash' ? Math.max(0, change) : 0,
          customerId: null,
          notes: null,
        }),
      })

      if (!res.ok) {
        console.error('Transaction failed:', await res.text())
        return
      }

      const { transaction: savedTx } = await res.json()

      // Build local transaction object for receipt display
      const transaction: Transaction = {
        id: savedTx.id,
        invoiceNumber: savedTx.invoiceNumber,
        items: items.map((item) => ({
          id: generateId(),
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          discountAmount: item.discountAmount,
          subtotal: item.subtotal,
        })),
        subtotal,
        discountAmount,
        discountType,
        taxAmount: 0,
        totalAmount: total,
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? paidNum : total,
        changeAmount: paymentMethod === 'cash' ? Math.max(0, change) : 0,
        customerId: null,
        cashierId: 'user-1',
        outletId: 'outlet-1',
        status: 'completed',
        notes: null,
        createdAt: new Date().toISOString(),
      }

      // Save to local store for dashboard display
      addTransaction(transaction)

      startTransition(() => {
        fetchProducts()
      })

      // Store transaction for receipt
      setLastTransaction(transaction)

      // Show success
      setIsSuccess(true)

      // Auto-print to thermal printer if enabled and connected
      if (autoPrint) {
        try {
          const [{ getPrinter }, { buildReceipt }] = await Promise.all([
            import('@/lib/printer/bluetooth'),
            import('@/lib/printer/receipt-builder'),
          ])

          const printer = getPrinter()
          if (printer.isConnected) {
            const receiptData = buildReceipt(transaction, {
              paperSize: printerPaperSize,
              storeName,
              storeAddress,
              storePhone,
              receiptFooter,
              cashierName: userName,
            })
            printer.print(receiptData).catch(() => {
              // Silently fail auto-print — user can still manually print
            })
          }
        } catch {
          // Silently fail — don't block the success flow
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [canPay, isProcessing, items, subtotal, discountAmount, discountType, total, paymentMethod, paidNum, change, addTransaction, fetchProducts, autoPrint, printerPaperSize, storeName, storeAddress, storePhone, receiptFooter, userName])

  // Keyboard shortcut: Enter to confirm payment
  useEffect(() => {
    if (!open || isSuccess || isProcessing) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canPay) {
        handlePayment()
      }
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isSuccess, isProcessing, canPay, handlePayment, handleClose])

  const handleDone = useCallback(() => {
    clearCart()
    resetDialogState()
    onClose()
  }, [clearCart, resetDialogState, onClose])

  const handleExactAmount = () => {
    setAmountPaid(total.toString())
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSuccess ? handleClose : undefined}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl mx-4"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <SuccessView
              change={change}
              paymentMethod={paymentMethod}
              onPrintReceipt={() => setShowReceipt(true)}
              onDone={handleDone}
            />
          ) : (
            <PaymentForm
              total={total}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              amountPaid={amountPaid}
              setAmountPaid={setAmountPaid}
              paidNum={paidNum}
              change={change}
              canPay={canPay}
              isProcessing={isProcessing}
              onPay={handlePayment}
              onClose={handleClose}
              onExactAmount={handleExactAmount}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Receipt preview modal */}
      {showReceipt && lastTransaction && (
        <ReceiptPreview
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}

function PaymentForm({
  total,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  paidNum,
  change,
  canPay,
  isProcessing,
  onPay,
  onClose,
  onExactAmount,
}: {
  total: number
  paymentMethod: PaymentMethod
  setPaymentMethod: (m: PaymentMethod) => void
  amountPaid: string
  setAmountPaid: (v: string) => void
  paidNum: number
  change: number
  canPay: boolean
  isProcessing: boolean
  onPay: () => void
  onClose: () => void
  onExactAmount: () => void
}) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pembayaran</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-accent cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Total */}
      <div className="mb-5 rounded-xl bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">Total Pembayaran</p>
        <p className="text-3xl font-bold text-primary tabular-nums">
          {formatRupiah(total)}
        </p>
      </div>

      {/* Payment method */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Metode Pembayaran</p>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setPaymentMethod(option.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all cursor-pointer',
                  paymentMethod === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cash input */}
      {paymentMethod === 'cash' && (
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Jumlah Dibayar</p>
          <Input
            type="number"
            placeholder="Masukkan nominal..."
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="text-lg font-semibold h-12"
            autoFocus
          />

          {/* Quick amounts */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExactAmount}
              className="text-xs"
            >
              Uang Pas
            </Button>
            {QUICK_AMOUNTS.filter((a) => a >= total).slice(0, 4).map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setAmountPaid(amount.toString())}
                className="text-xs"
              >
                {formatRupiah(amount)}
              </Button>
            ))}
          </div>

          {/* Change */}
          {paidNum > 0 && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kembalian</span>
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums',
                    change >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {change >= 0 ? formatRupiah(change) : `-${formatRupiah(Math.abs(change))}`}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* QRIS placeholder */}
      {paymentMethod === 'qris' && (
        <div className="mb-5 rounded-xl border border-dashed p-6 text-center">
          <QrCode className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            QR Code akan ditampilkan di sini
          </p>
        </div>
      )}

      {/* Debt placeholder */}
      {paymentMethod === 'debt' && (
        <div className="mb-5 rounded-xl border border-dashed p-4 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Transaksi akan dicatat sebagai hutang pelanggan
          </p>
        </div>
      )}

      {/* Confirm button */}
      <Button
        size="lg"
        className="w-full text-base font-bold"
        disabled={!canPay || isProcessing}
        onClick={onPay}
      >
        {isProcessing
          ? 'Memproses...'
          : paymentMethod === 'cash'
          ? 'Konfirmasi Pembayaran'
          : paymentMethod === 'qris'
            ? 'Konfirmasi QRIS'
            : 'Catat Hutang'}
      </Button>
    </motion.div>
  )
}

function SuccessView({
  change,
  paymentMethod,
  onPrintReceipt,
  onDone,
}: {
  change: number
  paymentMethod: PaymentMethod
  onPrintReceipt: () => void
  onDone: () => void
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckCircle2 className="h-16 w-16 text-success" />
      </motion.div>

      <h3 className="mt-4 text-xl font-bold text-foreground">
        Transaksi Berhasil!
      </h3>

      {paymentMethod === 'cash' && change > 0 && (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">Kembalian</p>
          <p className="text-2xl font-bold text-success tabular-nums">
            {formatRupiah(change)}
          </p>
        </div>
      )}

      {/* Receipt & Done buttons */}
      <div className="mt-5 flex w-full gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onPrintReceipt}
        >
          <Printer className="mr-1.5 h-4 w-4" />
          Cetak Struk
        </Button>
        <Button
          className="flex-1"
          onClick={onDone}
        >
          Selesai
        </Button>
      </div>
    </motion.div>
  )
}
