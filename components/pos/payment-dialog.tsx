'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import {
  X,
  Banknote,
  QrCode,
  BookOpen,
  CheckCircle2,
  ImageDown,
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
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { thermalPrinterService } from '@/lib/printer/thermal-printer-service'
import { queueOfflineTransaction } from '@/lib/offline-transactions'
import type { Customer, PaymentMethod, Transaction } from '@/types'

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
  const { items, getTotal, getSubtotal, paymentMethod, setPaymentMethod, clearCart, discountAmount, discountType, customerId, setCustomerId } =
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
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false)
  const [printMessage, setPrintMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [newCustomerName, setNewCustomerName] = useState('')
  const [debtError, setDebtError] = useState('')

  const total = getTotal()
  const subtotal = getSubtotal()
  const paidNum = parseInt(amountPaid) || 0
  const change = paidNum - total

  const canPay =
    paymentMethod === 'cash'
      ? paidNum >= total
      : paymentMethod === 'qris'
        ? true
        : Boolean(customerId)

  const resetDialogState = useCallback(() => {
    setAmountPaid('')
    setIsSuccess(false)
    setIsProcessing(false)
    setLastTransaction(null)
    setShowReceipt(false)
    setIsPrintingReceipt(false)
    setPrintMessage(null)
    setDebtError('')
    setNewCustomerName('')
  }, [])

  const handleClose = useCallback(() => {
    resetDialogState()
    onClose()
  }, [resetDialogState, onClose])

  const handlePayment = useCallback(async () => {
    if (!canPay || isProcessing) {
      if (paymentMethod === 'debt' && !customerId) setDebtError('Pilih pelanggan dulu untuk mencatat hutang.')
      return
    }

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

    const payload: Record<string, unknown> = {
      items: txItems,
      subtotal,
      discountAmount,
      discountType: discountType.toUpperCase(),
      taxAmount: 0,
      totalAmount: total,
      paymentMethod: paymentMethod.toUpperCase(),
      amountPaid: paymentMethod === 'cash' ? paidNum : paymentMethod === 'debt' ? 0 : total,
      changeAmount: paymentMethod === 'cash' ? Math.max(0, change) : 0,
      customerId: paymentMethod === 'debt' ? customerId : null,
      notes: paymentMethod === 'debt' ? 'Hutang pelanggan' : null,
    }

    const buildReceiptTransaction = (id: string, invoiceNumber: string): Transaction => ({
      id,
      invoiceNumber,
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
      amountPaid: paymentMethod === 'cash' ? paidNum : paymentMethod === 'debt' ? 0 : total,
      changeAmount: paymentMethod === 'cash' ? Math.max(0, change) : 0,
      customerId: paymentMethod === 'debt' ? customerId : null,
      cashierId: 'user-1',
      outletId: 'outlet-1',
      status: 'completed',
      notes: paymentMethod === 'debt' ? 'Hutang pelanggan' : null,
      createdAt: new Date().toISOString(),
    })

    // Save transaction via API (also decrements stock server-side)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        try {
          const errorJson = JSON.parse(errorText) as { error?: string; stack?: string }
          console.error('Transaction failed:', errorJson.error ?? errorText)
        } catch {
          console.error('Transaction failed:', errorText)
        }
        return
      }

      const { transaction: savedTx } = await res.json()

      const transaction = buildReceiptTransaction(savedTx.id, savedTx.invoiceNumber)

      // Save to local store for dashboard display
      addTransaction(transaction)

      startTransition(() => {
        fetchProducts()
      })

      // Store transaction for receipt
      setLastTransaction(transaction)

      // Show success
      setIsSuccess(true)

      // Auto-print is best-effort only; checkout must never fail because browser
      // cannot hold an active Bluetooth session to a paired thermal printer.
      if (autoPrint) {
        thermalPrinterService
          .printThermalReceipt(transaction, {
            paperSize: printerPaperSize,
            storeName,
            storeAddress,
            storePhone,
            receiptFooter,
            cashierName: userName,
          })
          .catch(() => {
            // Silently fail auto-print — user can still print manually from the success modal.
          })
      }
    } catch (err) {
      const offlineId = generateId()
      const invoiceNumber = `OFF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${offlineId.slice(0, 6).toUpperCase()}`
      const transaction = buildReceiptTransaction(offlineId, invoiceNumber)

      queueOfflineTransaction({
        id: offlineId,
        payload,
        receiptTransaction: transaction,
        createdAt: new Date().toISOString(),
        lastError: err instanceof Error ? err.message : 'Offline',
      })

      addTransaction(transaction)
      setLastTransaction(transaction)
      setPrintMessage({ type: 'success', text: 'Mode offline: transaksi disimpan lokal dan akan disinkronkan saat online.' })
      setIsSuccess(true)
    } finally {
      setIsProcessing(false)
    }
  }, [canPay, isProcessing, paymentMethod, customerId, items, subtotal, discountAmount, discountType, total, paidNum, change, addTransaction, fetchProducts, autoPrint, printerPaperSize, storeName, storeAddress, storePhone, receiptFooter, userName])

  useEffect(() => {
    if (!open || paymentMethod !== 'debt') return

    fetch('/api/customers')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { customers?: Customer[] }) => setCustomers(data.customers ?? []))
      .catch(() => setCustomers([]))
  }, [open, paymentMethod])

  const handleAddDebtCustomer = useCallback(async () => {
    const name = newCustomerName.trim()
    if (!name) return

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) return

    const data = await res.json() as { customer: Customer }
    setCustomers((prev) => [data.customer, ...prev])
    setCustomerId(data.customer.id)
    setNewCustomerName('')
    setDebtError('')
  }, [newCustomerName, setCustomerId])

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

  const handlePrintReceipt = useCallback(async () => {
    if (!lastTransaction || isPrintingReceipt) return
    setIsPrintingReceipt(true)
    setPrintMessage(null)

    try {
      const result = await thermalPrinterService.printThermalReceipt(lastTransaction, {
        paperSize: printerPaperSize,
        storeName,
        storeAddress,
        storePhone,
        receiptFooter,
        cashierName: userName,
      })
      setPrintMessage({ type: result.ok ? 'success' : 'error', text: result.message })
    } catch {
      setPrintMessage({
        type: 'error',
        text: 'Gagal mencetak struk. Pastikan Thermal-Bridge terpasang, Bluetooth aktif, dan ulangi pairing printer RPP02N.',
      })
    } finally {
      setIsPrintingReceipt(false)
    }
  }, [lastTransaction, isPrintingReceipt, printerPaperSize, storeName, storeAddress, storePhone, receiptFooter, userName])

  const handleDone = useCallback(() => {
    clearCart()
    resetDialogState()
    onClose()
  }, [clearCart, resetDialogState, onClose])

  const handleExactAmount = () => {
    setAmountPaid(total.toString())
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSuccess ? handleClose : undefined}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <SuccessView
              change={change}
              paymentMethod={paymentMethod}
              onSaveReceipt={() => setShowReceipt(true)}
              onPrintReceipt={handlePrintReceipt}
              onDone={handleDone}
              isPrintingReceipt={isPrintingReceipt}
              printMessage={printMessage}
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
              customerId={customerId}
              setCustomerId={setCustomerId}
              customers={customers}
              newCustomerName={newCustomerName}
              setNewCustomerName={setNewCustomerName}
              onAddDebtCustomer={handleAddDebtCustomer}
              debtError={debtError}
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
    </div>,
    document.body
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
  customerId,
  setCustomerId,
  customers,
  newCustomerName,
  setNewCustomerName,
  onAddDebtCustomer,
  debtError,
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
  customerId: string | null
  setCustomerId: (id: string | null) => void
  customers: Customer[]
  newCustomerName: string
  setNewCustomerName: (value: string) => void
  onAddDebtCustomer: () => void
  debtError: string
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

      {/* QRIS static: customer scans the physical QRIS sticker at the cashier desk. */}
      {paymentMethod === 'qris' && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-slate-950/40 dark:text-emerald-300">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold">Pembayaran QRIS fisik</p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800/80 dark:text-emerald-100/75">
                Minta pelanggan scan QRIS yang ditempel di meja kasir, lalu pastikan dana sudah masuk sebelum konfirmasi.
              </p>
            </div>
          </div>

        </div>
      )}

      {paymentMethod === 'debt' && (
        <div className="mb-5 space-y-3 rounded-xl border border-dashed p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Pilih pelanggan hutang</p>
              <p className="text-xs text-muted-foreground">Jika belum ada, tambahkan pelanggan dulu.</p>
            </div>
          </div>
          <Select value={customerId ?? ''} onChange={(e) => setCustomerId(e.target.value || null)}>
            <option value="">Pilih pelanggan</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Input
              placeholder="Nama pelanggan baru"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={onAddDebtCustomer} disabled={!newCustomerName.trim()}>
              Tambah
            </Button>
          </div>
          {debtError ? <p className="text-xs font-medium text-destructive">{debtError}</p> : null}
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
            ? 'Pembayaran QRIS Diterima'
            : 'Catat Hutang'}
      </Button>
    </motion.div>
  )
}

function SuccessView({
  change,
  paymentMethod,
  onSaveReceipt,
  onPrintReceipt,
  onDone,
  isPrintingReceipt,
  printMessage,
}: {
  change: number
  paymentMethod: PaymentMethod
  onSaveReceipt: () => void
  onPrintReceipt: () => void
  onDone: () => void
  isPrintingReceipt: boolean
  printMessage: { type: 'success' | 'error'; text: string } | null
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

      {printMessage && (
        <div className={cn(
          'mt-4 w-full rounded-xl px-3 py-2 text-xs font-medium',
          printMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
        )}>
          {printMessage.text}
        </div>
      )}

      {/* Receipt & Done buttons */}
      <div className="mt-5 grid w-full grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onSaveReceipt}
        >
          <ImageDown className="mr-1.5 h-4 w-4" />
          Simpan
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onPrintReceipt}
          disabled={isPrintingReceipt}
        >
          <Printer className="mr-1.5 h-4 w-4" />
          {isPrintingReceipt ? 'Cetak...' : 'Cetak'}
        </Button>
        <Button
          className="w-full"
          onClick={onDone}
        >
          Selesai
        </Button>
      </div>
    </motion.div>
  )
}
