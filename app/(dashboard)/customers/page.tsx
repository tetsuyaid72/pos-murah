'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BanknoteArrowDown,
  CreditCard,
  Ellipsis,
  Plus,
  Search,
  Users,
  Wallet,
} from 'lucide-react'
import { formatDateTime, formatRupiah } from '@/lib/format'
import { cn, generateId } from '@/lib/utils'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type {
  Customer,
  CustomerStatus,
  CustomerTransaction,
  DebtPayment,
  DebtPaymentMethod,
} from '@/types'

type StatusFilter = 'ALL' | CustomerStatus

type CustomerFormState = {
  name: string
  phone: string
  address: string
  notes: string
}

type PaymentFormState = {
  amount: string
  method: DebtPaymentMethod
  note: string
}

const emptyCustomerForm: CustomerFormState = {
  name: '',
  phone: '',
  address: '',
  notes: '',
}

const emptyPaymentForm: PaymentFormState = {
  amount: '',
  method: 'CASH',
  note: '',
}

function calculateCustomerStatus(customer: Customer): CustomerStatus {
  return customer.debt <= 0 ? 'PAID' : 'DEBT'
}

function formatCurrency(amount: number): string {
  return formatRupiah(amount)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function normalizeText(value?: string | null): string {
  return (value ?? '').toLowerCase()
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([])
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const [addOpen, setAddOpen] = useState(false)
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null)
  const [payCustomerId, setPayCustomerId] = useState<string | null>(null)
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)

  const [customerForm, setCustomerForm] = useState<CustomerFormState>(emptyCustomerForm)
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(emptyPaymentForm)
  const [formError, setFormError] = useState('')
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { customers?: Array<{ id: string; name: string; phone?: string | null; address?: string | null; totalDebt?: number; createdAt: string }> }) => {
        setCustomers(
          (data.customers ?? []).map((customer) => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone ?? null,
            address: customer.address ?? null,
            notes: null,
            debt: customer.totalDebt ?? 0,
            totalTransactions: 0,
            lastTransactionAt: null,
            createdAt: customer.createdAt,
          }))
        )
      })
      .catch(() => setCustomers([]))
  }, [])

  const totalDebt = useMemo(
    () => customers.reduce((sum, customer) => sum + customer.debt, 0),
    [customers]
  )
  const customersWithDebt = useMemo(
    () => customers.filter((customer) => customer.debt > 0),
    [customers]
  )
  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        normalizeText(customer.name).includes(query) ||
        normalizeText(customer.phone).includes(query) ||
        normalizeText(customer.address).includes(query)

      const status = calculateCustomerStatus(customer)
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [customers, search, statusFilter])

  const selectedCustomer = customers.find((customer) => customer.id === detailCustomerId) ?? null
  const customerToPay = customers.find((customer) => customer.id === payCustomerId) ?? null
  const customerToDelete = customers.find((customer) => customer.id === deleteCustomerId) ?? null

  const openAddDialog = () => {
    setCustomerForm(emptyCustomerForm)
    setFormError('')
    setEditCustomerId(null)
    setAddOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    setCustomerForm({
      name: customer.name,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      notes: customer.notes ?? '',
    })
    setFormError('')
    setEditCustomerId(customer.id)
    setAddOpen(true)
  }

  const openPayDialog = (customer: Customer) => {
    setPaymentForm({
      amount: customer.debt > 0 ? String(customer.debt) : '',
      method: 'CASH',
      note: '',
    })
    setPaymentError('')
    setPayCustomerId(customer.id)
  }

  const handleAddCustomer = (data: CustomerFormState) => {
    if (!data.name.trim()) {
      setFormError('Nama pelanggan wajib diisi.')
      return
    }

    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name.trim(),
        phone: data.phone.trim() || null,
        address: data.address.trim() || null,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((result: { customer: { id: string; name: string; phone?: string | null; address?: string | null; totalDebt?: number; createdAt: string } }) => {
        const customer = result.customer
        setCustomers((prev) => [
          {
            id: customer.id,
            name: customer.name,
            phone: customer.phone ?? null,
            address: customer.address ?? null,
            notes: data.notes.trim() || null,
            debt: customer.totalDebt ?? 0,
            totalTransactions: 0,
            lastTransactionAt: null,
            createdAt: customer.createdAt,
          },
          ...prev,
        ])
        setCustomerForm(emptyCustomerForm)
        setFormError('')
        setAddOpen(false)
      })
      .catch(() => setFormError('Gagal menambahkan pelanggan.'))
  }

  const handleUpdateCustomer = (id: string, data: CustomerFormState) => {
    if (!data.name.trim()) {
      setFormError('Nama pelanggan wajib diisi.')
      return
    }

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              name: data.name.trim(),
              phone: data.phone.trim() || null,
              address: data.address.trim() || null,
              notes: data.notes.trim() || null,
            }
          : customer
      )
    )

    setCustomerForm(emptyCustomerForm)
    setFormError('')
    setEditCustomerId(null)
    setAddOpen(false)
  }

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))
    setTransactions((prev) => prev.filter((transaction) => transaction.customerId !== id))
    setDebtPayments((prev) => prev.filter((payment) => payment.customerId !== id))
    if (detailCustomerId === id) setDetailCustomerId(null)
    if (payCustomerId === id) setPayCustomerId(null)
  }

  const handlePayDebt = (
    customerId: string,
    amount: number,
    method: DebtPaymentMethod,
    note: string
  ) => {
    const customer = customers.find((item) => item.id === customerId)

    if (!customer) {
      setPaymentError('Pelanggan tidak ditemukan.')
      return
    }

    if (amount <= 0) {
      setPaymentError('Nominal pembayaran harus lebih besar dari 0.')
      return
    }

    if (amount > customer.debt) {
      setPaymentError('Nominal pembayaran tidak boleh melebihi total hutang.')
      return
    }

    setCustomers((prev) =>
      prev.map((item) =>
        item.id === customerId
          ? {
              ...item,
              debt: Math.max(0, item.debt - amount),
            }
          : item
      )
    )

    setDebtPayments((prev) => [
      {
        id: generateId(),
        customerId,
        amount,
        method,
        note: note.trim() || null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])

    setPaymentForm(emptyPaymentForm)
    setPaymentError('')
    setPayCustomerId(null)
  }

  const handleCustomerSubmit = () => {
    if (editCustomerId) {
      handleUpdateCustomer(editCustomerId, customerForm)
      return
    }

    handleAddCustomer(customerForm)
  }

  const handlePaymentSubmit = () => {
    if (!customerToPay) return

    handlePayDebt(
      customerToPay.id,
      Number(paymentForm.amount),
      paymentForm.method,
      paymentForm.note
    )
  }

  const getCustomerTransactions = (customerId: string) =>
    transactions.filter((transaction) => transaction.customerId === customerId)

  const getCustomerPayments = (customerId: string) =>
    debtPayments.filter((payment) => payment.customerId === customerId)

  const hasCustomers = customers.length > 0
  const hasFilteredCustomers = filteredCustomers.length > 0

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1480px] flex-col gap-3 overflow-hidden p-5">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">Pelanggan & Piutang</h1>
              <p className="text-sm text-muted-foreground">Kelola pelanggan dan hutang warung</p>
            </div>
            <Button onClick={openAddDialog} className="h-9 rounded-xl px-4">
              <Plus className="h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </div>

          <section className="grid shrink-0 grid-cols-3 gap-3">
            <SummaryCard
              title="Total Pelanggan"
              value={String(customers.length)}
              description="Pelanggan aktif"
              icon={Users}
            />
            <SummaryCard
              title="Total Piutang"
              value={formatCurrency(totalDebt)}
              description="Akumulasi hutang"
              icon={Wallet}
            />
            <SummaryCard
              title="Berhutang"
              value={String(customersWithDebt.length)}
              description="Perlu follow-up"
              icon={BanknoteArrowDown}
            />
          </section>

          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)} className="min-h-0 flex flex-1 flex-col overflow-hidden">
            <Card className="shrink-0 rounded-xl border bg-card shadow-sm">
              <CardContent className="p-2">
                <div className="flex h-12 items-center justify-between gap-3">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari nama, nomor telepon, atau alamat pelanggan"
                      className="h-9 rounded-xl border-0 bg-muted/30 pl-10 shadow-none"
                    />
                  </div>

                  <TabsList className="h-9 rounded-xl border-0 bg-muted/40 p-1">
                    <TabsTrigger value="ALL">Semua</TabsTrigger>
                    <TabsTrigger value="DEBT">Berhutang</TabsTrigger>
                    <TabsTrigger value="PAID">Lunas</TabsTrigger>
                  </TabsList>
                </div>
              </CardContent>
            </Card>

            <TabsContent className="min-h-0 flex-1 overflow-hidden pt-3">
              <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                {!hasCustomers ? (
                  <EmptyState
                    icon={Users}
                    title="Belum ada pelanggan"
                    description="Tambahkan pelanggan langganan pertama Anda untuk mulai mencatat piutang."
                    actionLabel="Tambah Pelanggan"
                    onAction={openAddDialog}
                  />
                ) : !hasFilteredCustomers ? (
                  <EmptyState
                    icon={Search}
                    title="Pelanggan tidak ditemukan"
                    description="Coba kata kunci lain atau ubah filter status pelanggan."
                  />
                ) : (
                  <div className="space-y-2 pb-2">
                    {filteredCustomers.map((customer) => {
                      const status = calculateCustomerStatus(customer)

                      return (
                        <div
                          key={customer.id}
                          className="flex h-[76px] items-center justify-between rounded-xl border bg-card px-4 transition-colors hover:bg-muted/30"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                              {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{customer.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {customer.phone || '-'}
                                {customer.address ? ` • ${customer.address}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="ml-4 flex shrink-0 items-center gap-3">
                            <Badge
                              className={cn(
                                'border px-2.5 py-1 text-[11px] font-medium',
                                status === 'DEBT'
                                  ? 'border-rose-100 bg-rose-50 text-rose-600'
                                  : 'border-emerald-100 bg-emerald-50 text-emerald-600'
                              )}
                            >
                              {status === 'DEBT' ? 'Berhutang' : 'Lunas'}
                            </Badge>
                            <div className="min-w-[110px] text-right">
                              <p className="text-sm font-bold text-foreground">{formatCurrency(customer.debt)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg px-2.5 text-xs"
                              onClick={() => setDetailCustomerId(customer.id)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 rounded-lg bg-emerald-500 px-2.5 text-xs hover:bg-emerald-600"
                              onClick={() => openPayDialog(customer)}
                              disabled={customer.debt <= 0}
                            >
                              Bayar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg px-2.5 text-xs"
                              onClick={() => setDetailCustomerId(customer.id)}
                            >
                              Riwayat
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg" aria-label="Aksi pelanggan">
                                  <Ellipsis className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi Pelanggan</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDetailCustomerId(customer.id)}>
                                  Detail pelanggan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openPayDialog(customer)}>
                                  Bayar hutang
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                                  Edit pelanggan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteCustomerId(customer.id)}>
                                  Hapus pelanggan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CustomerFormDialog
        open={addOpen}
        editMode={Boolean(editCustomerId)}
        form={customerForm}
        error={formError}
        onClose={() => {
          setAddOpen(false)
          setEditCustomerId(null)
          setFormError('')
        }}
        onChange={setCustomerForm}
        onSubmit={handleCustomerSubmit}
      />

      <CustomerDetailDialog
        customer={selectedCustomer}
        transactions={selectedCustomer ? getCustomerTransactions(selectedCustomer.id) : []}
        payments={selectedCustomer ? getCustomerPayments(selectedCustomer.id) : []}
        onClose={() => setDetailCustomerId(null)}
      />

      <PayDebtDialog
        customer={customerToPay}
        form={paymentForm}
        error={paymentError}
        onClose={() => {
          setPayCustomerId(null)
          setPaymentError('')
          setPaymentForm(emptyPaymentForm)
        }}
        onChange={setPaymentForm}
        onSubmit={handlePaymentSubmit}
      />

      <AlertDialog
        open={Boolean(customerToDelete)}
        onOpenChange={(open) => {
          if (!open) setDeleteCustomerId(null)
        }}
        title="Hapus pelanggan"
        description={`Yakin ingin menghapus ${customerToDelete?.name ?? 'pelanggan'}? Riwayat transaksi dan pembayaran hutang pelanggan ini juga akan dihapus dari tampilan.`}
        confirmLabel="Hapus pelanggan"
        onConfirm={() => {
          if (customerToDelete) handleDeleteCustomer(customerToDelete.id)
          setDeleteCustomerId(null)
        }}
      />
    </div>
  )
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="h-[88px] rounded-xl border bg-card shadow-sm">
      <CardContent className="flex h-full items-center justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <Card className="rounded-xl border border-dashed border-border/60 bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {actionLabel && onAction ? (
          <Button className="mt-5" onClick={onAction}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

function CustomerFormDialog({
  open,
  editMode,
  form,
  error,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  editMode: boolean
  form: CustomerFormState
  error: string
  onClose: () => void
  onChange: React.Dispatch<React.SetStateAction<CustomerFormState>>
  onSubmit: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl border-border/60 shadow-2xl">
      <DialogHeader>
        <DialogTitle>{editMode ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nama pelanggan *</Label>
          <Input
            placeholder="Contoh: Pak Slamet"
            value={form.name}
            onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))}
            autoFocus
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nomor telepon</Label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(event) => onChange((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input
              placeholder="Jl. Melati No. 5"
              value={form.address}
              onChange={(event) => onChange((prev) => ({ ...prev, address: event.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Catatan</Label>
          <Textarea
            placeholder="Catatan tambahan pelanggan, preferensi belanja, atau pengingat penagihan."
            value={form.notes}
            onChange={(event) => onChange((prev) => ({ ...prev, notes: event.target.value }))}
            rows={4}
          />
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onSubmit}>{editMode ? 'Simpan Perubahan' : 'Tambah Pelanggan'}</Button>
        </div>
      </div>
    </Dialog>
  )
}

function CustomerDetailDialog({
  customer,
  transactions,
  payments,
  onClose,
}: {
  customer: Customer | null
  transactions: CustomerTransaction[]
  payments: DebtPayment[]
  onClose: () => void
}) {
  const status = customer ? calculateCustomerStatus(customer) : null

  return (
    <Dialog
      open={Boolean(customer)}
      onClose={onClose}
      className="max-w-[560px] max-h-[78vh] overflow-hidden rounded-2xl border-border/60 p-0 shadow-2xl"
    >
      {customer ? (
        <>
          <DialogHeader className="mb-0 flex items-center justify-between border-b px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                {getInitials(customer.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="truncate text-base font-semibold">{customer.name}</DialogTitle>
                  <Badge
                    className={cn(
                      'border px-2 py-0.5 text-[10px] font-medium',
                      status === 'DEBT'
                        ? 'border-rose-100 bg-rose-50 text-rose-600'
                        : 'border-emerald-100 bg-emerald-50 text-emerald-600'
                    )}
                  >
                    {status === 'DEBT' ? 'Berhutang' : 'Lunas'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Detail pelanggan dan riwayat piutang</p>
              </div>
            </div>
            <DialogClose onClose={onClose} />
          </DialogHeader>

          <ScrollArea className="max-h-[calc(78vh-72px)]">
            <div className="space-y-4 px-5 py-4">
              <div className="rounded-xl bg-muted/30 p-3 text-sm">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{customer.phone || 'Nomor telepon belum diisi'}</p>
                  <p>{customer.address || 'Alamat belum diisi'}</p>
                  <p>{customer.notes || 'Tanpa catatan tambahan'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MiniStat title="Total Hutang" value={formatCurrency(customer.debt)} />
                <MiniStat title="Total Transaksi" value={`${customer.totalTransactions} transaksi`} />
                <MiniStat
                  title="Last Transaction"
                  value={customer.lastTransactionAt ? formatDateTime(customer.lastTransactionAt) : '-'}
                />
              </div>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Riwayat Transaksi</h3>
                  <span className="text-xs text-muted-foreground">{transactions.length} transaksi</span>
                </div>
                <div className="space-y-2">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="space-y-2 rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {transaction.invoiceNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(transaction.createdAt)}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              'border px-2 py-0.5 text-[10px] font-medium',
                              transaction.debtAmount > 0
                                ? 'border-rose-100 bg-rose-50 text-rose-600'
                                : 'border-emerald-100 bg-emerald-50 text-emerald-600'
                            )}
                          >
                            {transaction.debtAmount > 0 ? 'Piutang' : 'Lunas'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-2">
                          <MetricBox label="Total" value={formatCurrency(transaction.total)} />
                          <MetricBox label="Dibayar" value={formatCurrency(transaction.paidAmount)} />
                          <MetricBox label="Hutang" value={formatCurrency(transaction.debtAmount)} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Belum ada histori transaksi.</p>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Riwayat Pembayaran</h3>
                  <span className="text-xs text-muted-foreground">{payments.length} pembayaran</span>
                </div>
                <div className="space-y-2">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <div key={payment.id} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(payment.createdAt)}
                            </p>
                          </div>
                          <Badge variant="info" className="px-2 py-0.5 text-[10px]">
                            {payment.method}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {payment.note || 'Tanpa catatan'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Belum ada pembayaran hutang</p>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>
        </>
      ) : null}
    </Dialog>
  )
}

function PayDebtDialog({
  customer,
  form,
  error,
  onClose,
  onChange,
  onSubmit,
}: {
  customer: Customer | null
  form: PaymentFormState
  error: string
  onClose: () => void
  onChange: React.Dispatch<React.SetStateAction<PaymentFormState>>
  onSubmit: () => void
}) {
  return (
    <Dialog open={Boolean(customer)} onClose={onClose} className="max-w-lg border-border/60 shadow-2xl">
      <DialogHeader>
        <DialogTitle>Bayar Hutang</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>

      {customer ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">{customer.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sisa hutang saat ini: <span className="font-semibold text-foreground">{formatCurrency(customer.debt)}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nominal pembayaran</Label>
            <Input
              type="number"
              min={1}
              max={customer.debt}
              placeholder="Masukkan nominal"
              value={form.amount}
              onChange={(event) => onChange((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Metode pembayaran</Label>
            <Select
              value={form.method}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  method: event.target.value as DebtPaymentMethod,
                }))
              }
            >
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="QRIS">QRIS</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              rows={3}
              placeholder="Contoh: Bayar sebagian setelah gajian"
              value={form.note}
              onChange={(event) => onChange((prev) => ({ ...prev, note: event.target.value }))}
            />
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={onSubmit}>
              <CreditCard className="h-4 w-4" />
              Simpan Pembayaran
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  )
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-[11px] text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
