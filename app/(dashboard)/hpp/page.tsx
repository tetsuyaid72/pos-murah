'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calculator, Check, Menu, PackageSearch, Pencil, TrendingDown, TrendingUp, WalletCards, X } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/format'

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getMarginStatus(margin: number, profit: number) {
  if (profit < 0) return { label: 'Rugi', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' }
  if (margin < 15) return { label: 'Tipis', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' }
  return { label: 'Sehat', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' }
}

export default function HppPage() {
  const { products, fetchProducts, updateProduct, isLoading } = useProductStore()
  const { setSidebarOpen } = useUIStore()
  const [purchaseTotal, setPurchaseTotal] = useState('')
  const [quantity, setQuantity] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [packingCost, setPackingCost] = useState('')
  const [otherCost, setOtherCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [draftHpp, setDraftHpp] = useState('')
  const [savingProductId, setSavingProductId] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const activeProducts = useMemo(() => products.filter((product) => product.isActive), [products])

  const stats = useMemo(() => {
    const withHpp = activeProducts.filter((product) => product.costPrice > 0)
    const totalMargin = withHpp.reduce((sum, product) => {
      if (product.sellingPrice <= 0) return sum
      return sum + ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100
    }, 0)
    const lowMargin = withHpp.filter((product) => {
      if (product.sellingPrice <= 0) return true
      return ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 < 15
    })

    return {
      withHpp: withHpp.length,
      withoutHpp: activeProducts.length - withHpp.length,
      averageMargin: withHpp.length ? totalMargin / withHpp.length : 0,
      lowMargin: lowMargin.length,
    }
  }, [activeProducts])

  const calculator = useMemo(() => {
    const totalCost = toNumber(purchaseTotal) + toNumber(shippingCost) + toNumber(packingCost) + toNumber(otherCost)
    const unitCount = toNumber(quantity)
    const hpp = unitCount > 0 ? totalCost / unitCount : 0
    const profit = toNumber(sellingPrice) - hpp
    const margin = toNumber(sellingPrice) > 0 ? (profit / toNumber(sellingPrice)) * 100 : 0
    const markup = hpp > 0 ? (profit / hpp) * 100 : 0

    return { totalCost, hpp, profit, margin, markup }
  }, [purchaseTotal, quantity, shippingCost, packingCost, otherCost, sellingPrice])

  const startEditHpp = (productId: string, currentHpp: number) => {
    setEditingProductId(productId)
    setDraftHpp(String(currentHpp))
  }

  const cancelEditHpp = () => {
    setEditingProductId(null)
    setDraftHpp('')
  }

  const saveHpp = async (productId: string) => {
    const nextHpp = Math.max(0, Math.round(toNumber(draftHpp)))
    setSavingProductId(productId)
    const updatedProduct = await updateProduct(productId, { costPrice: nextHpp })
    setSavingProductId(null)

    if (updatedProduct) {
      cancelEditHpp()
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-[1480px] space-y-3 p-3 md:p-4 lg:p-5">
        <header className="flex items-start gap-3 md:items-center md:justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-9 w-9 shrink-0 rounded-xl md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">HPP</h1>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pantau modal produk, margin, dan simulasi harga jual.
            </p>
          </div>
        </header>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Produk Ada HPP" value={stats.withHpp.toString()} icon={WalletCards} />
          <StatCard title="Belum Ada HPP" value={stats.withoutHpp.toString()} icon={PackageSearch} />
          <StatCard title="Rata-rata Margin" value={`${stats.averageMargin.toFixed(1)}%`} icon={TrendingUp} />
          <StatCard title="Margin Rendah" value={stats.lowMargin.toString()} icon={TrendingDown} />
        </div>

        <div className="grid gap-3 lg:grid-cols-[340px_1fr]">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm">Kalkulator HPP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 px-4 pb-4">
              <Field label="Harga beli total" value={purchaseTotal} onChange={setPurchaseTotal} />
              <Field label="Jumlah unit" value={quantity} onChange={setQuantity} />
              <div className="grid grid-cols-3 gap-2">
                <Field label="Ongkir" value={shippingCost} onChange={setShippingCost} />
                <Field label="Packing" value={packingCost} onChange={setPackingCost} />
                <Field label="Lainnya" value={otherCost} onChange={setOtherCost} />
              </div>
              <Field label="Harga jual simulasi" value={sellingPrice} onChange={setSellingPrice} />

              <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">HPP per unit</p>
                <p className="mt-0.5 text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{formatRupiah(Math.round(calculator.hpp))}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <Result label="Total biaya" value={formatRupiah(calculator.totalCost)} />
                  <Result label="Laba/unit" value={formatRupiah(Math.round(calculator.profit))} />
                  <Result label="Margin" value={`${calculator.margin.toFixed(1)}%`} />
                  <Result label="Markup" value={`${calculator.markup.toFixed(1)}%`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm">Daftar HPP Produk</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-y border-border bg-muted/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Produk</th>
                      <th className="px-4 py-2">HPP</th>
                      <th className="px-4 py-2">Harga Jual</th>
                      <th className="px-4 py-2">Laba</th>
                      <th className="px-4 py-2">Margin</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeProducts.map((product) => {
                      const isEditing = editingProductId === product.id
                      const effectiveHpp = isEditing ? Math.max(0, Math.round(toNumber(draftHpp))) : product.costPrice
                      const profit = product.sellingPrice - effectiveHpp
                      const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0
                      const status = getMarginStatus(margin, profit)
                      const isSaving = savingProductId === product.id

                      return (
                        <tr key={product.id} className="hover:bg-muted/40">
                          <td className="px-4 py-2.5 font-semibold">{product.name}</td>
                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                value={draftHpp}
                                onChange={(event) => setDraftHpp(event.target.value)}
                                className="h-8 w-28"
                                autoFocus
                              />
                            ) : (
                              formatRupiah(product.costPrice)
                            )}
                          </td>
                          <td className="px-4 py-2.5">{formatRupiah(product.sellingPrice)}</td>
                          <td className="px-4 py-2.5">{formatRupiah(profit)}</td>
                          <td className="px-4 py-2.5">{margin.toFixed(1)}%</td>
                          <td className="px-4 py-2.5"><Badge className={status.className}>{status.label}</Badge></td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => saveHpp(product.id)}
                                    disabled={isSaving}
                                    className="h-8 rounded-xl bg-emerald-600 px-2.5 text-white hover:bg-emerald-700"
                                  >
                                    <Check className="h-4 w-4" />
                                    <span className="ml-1.5">Simpan</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelEditHpp}
                                    disabled={isSaving}
                                    className="h-8 rounded-xl px-2.5"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditHpp(product.id, product.costPrice)}
                                  className="h-8 rounded-xl px-2.5"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="ml-1.5">Ubah HPP</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {!isLoading && activeProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Belum ada produk aktif.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Calculator }) {
  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-2.5 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
          <p className="text-lg font-extrabold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <Input type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" className="h-8 rounded-lg px-3" />
    </label>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-bold">{value}</p>
    </div>
  )
}
