'use client'

import { useState } from 'react'
import { Plus, Search, Phone, MapPin, Banknote, User } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { sampleCustomers } from '@/data/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { generateId } from '@/lib/utils'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  // Add form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  )

  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0)

  const handleAdd = () => {
    if (!formName.trim()) return

    const newCustomer: Customer = {
      id: generateId(),
      name: formName.trim(),
      phone: formPhone || null,
      address: formAddress || null,
      totalDebt: 0,
      createdAt: new Date().toISOString(),
    }

    setCustomers([...customers, newCustomer])
    setFormName('')
    setFormPhone('')
    setFormAddress('')
    setAddOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h1 className="text-2xl font-bold">Pelanggan</h1>
          <p className="text-sm text-muted-foreground">
            {customers.length} pelanggan — Total hutang: {formatRupiah(totalDebt)}
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Search */}
      <div className="border-b px-4 py-3 md:px-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Customer list */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <User className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {search ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {filtered.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{customer.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                      )}
                      {customer.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Debt */}
                  {customer.totalDebt > 0 ? (
                    <Badge variant="destructive" className="shrink-0">
                      <Banknote className="mr-1 h-3 w-3" />
                      {formatRupiah(customer.totalDebt)}
                    </Badge>
                  ) : (
                    <Badge variant="success" className="shrink-0">Lunas</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add customer dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan</DialogTitle>
          <DialogClose onClose={() => setAddOpen(false)} />
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama *</Label>
            <Input
              placeholder="Nama pelanggan"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Nomor Telepon</Label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input
              placeholder="Alamat pelanggan"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd} disabled={!formName.trim()}>
              Tambah
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
