'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { useProductStore } from '@/stores/product-store'
import { PRODUCT_UNITS } from '@/lib/constants'
import type { Product } from '@/types'

// Zod validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(100, 'Maksimal 100 karakter'),
  barcode: z.string().max(50, 'Maksimal 50 karakter').optional().or(z.literal('')),
  sku: z.string().max(30, 'Maksimal 30 karakter').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  costPrice: z.number().min(0, 'Harga modal tidak boleh negatif'),
  sellingPrice: z.number().min(1, 'Harga jual wajib diisi'),
  stock: z.number().min(0, 'Stok tidak boleh negatif').int('Stok harus bilangan bulat'),
  minStock: z.number().min(0, 'Minimal stok tidak boleh negatif').int(),
  unit: z.string().min(1, 'Satuan wajib dipilih'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product // If provided, we're editing
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const { createProduct, updateProduct, categories } = useProductStore()
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl || null)
  const [apiError, setApiError] = useState<string | null>(null)

  const isEditing = !!product

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          barcode: product.barcode || '',
          sku: product.sku || '',
          categoryId: product.categoryId || '',
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          stock: product.stock,
          minStock: product.minStock,
          unit: product.unit,
        }
      : {
          name: '',
          barcode: '',
          sku: '',
          categoryId: '',
          costPrice: 0,
          sellingPrice: 0,
          stock: 0,
          minStock: 5,
          unit: 'pcs',
        },
  })

  const onSubmit = async (data: ProductFormData) => {
    setApiError(null)

    if (isEditing && product) {
      const result = await updateProduct(product.id, {
        ...data,
        barcode: data.barcode || null,
        sku: data.sku || null,
        imageUrl,
      })
      if (!result) {
        setApiError('Gagal menyimpan perubahan. Silakan coba lagi.')
        return
      }
    } else {
      const result = await createProduct({
        name: data.name,
        barcode: data.barcode || null,
        sku: data.sku || null,
        categoryId: data.categoryId,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        stock: data.stock,
        minStock: data.minStock,
        unit: data.unit,
        imageUrl,
      })
      if (!result) {
        setApiError('Gagal menambah produk. Silakan coba lagi.')
        return
      }
    }

    router.push('/products')
  }

  return (
    <div className="mx-auto max-w-2xl">

      {/* Header */}
      <div className="mb-4 flex items-start gap-3 md:mb-6 md:items-center md:gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg md:h-10 md:w-10">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[20px] font-bold leading-tight md:text-2xl">
            {isEditing ? 'Edit Produk' : 'Tambah Produk'}
          </h1>
          <p className="text-[12px] leading-tight text-muted-foreground md:text-sm">
            {isEditing
              ? 'Perbarui informasi produk'
              : 'Isi data produk baru untuk ditambahkan ke inventori'}
          </p>
        </div>
      </div>

      {apiError && (
        <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[12px] text-destructive md:mb-4 md:px-4 md:py-3 md:text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Product Image */}
        <Card>
          <CardHeader className="px-4 py-2.5 md:px-6 md:py-6">
            <CardTitle className="text-[14px] md:text-base">Gambar Produk</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 md:px-6 md:pb-6">
            <ImageUpload value={imageUrl} onChange={setImageUrl} compact />
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardHeader className="px-4 py-3 md:px-6 md:py-6">
            <CardTitle className="text-[14px] md:text-base">Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 pt-0 md:space-y-4 md:px-6 md:pb-6">
            {/* Name */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="name" className="text-[12px] md:text-sm">Nama Produk *</Label>
              <Input
                id="name"
                placeholder="Contoh: Indomie Goreng"
                className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Barcode & SKU */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="barcode" className="text-[12px] md:text-sm">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="Scan atau ketik barcode"
                  className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                  {...register('barcode')}
                />
                {errors.barcode && (
                  <p className="text-xs text-destructive">{errors.barcode.message}</p>
                )}
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="sku" className="text-[12px] md:text-sm">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Kode internal"
                  className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                  {...register('sku')}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku.message}</p>
                )}
              </div>
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="categoryId" className="text-[12px] md:text-sm">Kategori *</Label>
                <Select id="categoryId" className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:px-3 md:text-sm" {...register('categoryId')}>
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="unit" className="text-[12px] md:text-sm">Satuan *</Label>
                <Select id="unit" className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:px-3 md:text-sm" {...register('unit')}>
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Select>
                {errors.unit && (
                  <p className="text-xs text-destructive">{errors.unit.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className="px-4 py-3 md:px-6 md:py-6">
            <CardTitle className="text-[14px] md:text-base">Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 pt-0 md:space-y-4 md:px-6 md:pb-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="costPrice" className="text-[12px] md:text-sm">Harga Modal (Rp)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  placeholder="0"
                  className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                  {...register('costPrice', { valueAsNumber: true })}
                />
                {errors.costPrice && (
                  <p className="text-xs text-destructive">{errors.costPrice.message}</p>
                )}
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="sellingPrice" className="text-[12px] md:text-sm">Harga Jual (Rp) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  placeholder="0"
                  className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                  {...register('sellingPrice', { valueAsNumber: true })}
                />
                {errors.sellingPrice && (
                  <p className="text-xs text-destructive">{errors.sellingPrice.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock */}
        <Card>
          <CardHeader className="px-4 py-3 md:px-6 md:py-6">
            <CardTitle className="text-[14px] md:text-base">Stok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 pt-0 md:space-y-4 md:px-6 md:pb-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="stock" className="text-[12px] md:text-sm">Stok Saat Ini</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                  {...register('stock', { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock.message}</p>
                )}
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="minStock" className="text-[12px] md:text-sm">Minimal Stok (Warning)</Label>
                <Input
                  id="minStock"
                  type="number"
                  placeholder="5"
                  className="h-9 rounded-lg px-3 text-[13px] md:h-10 md:rounded-xl md:px-4 md:text-sm"
                  {...register('minStock', { valueAsNumber: true })}
                />
                {errors.minStock && (
                  <p className="text-xs text-destructive">{errors.minStock.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 md:gap-3">
          <Link href="/products">
            <Button type="button" variant="outline" className="h-9 px-3 text-[12px] md:h-10 md:px-4 md:text-sm">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="h-9 px-3 text-[12px] md:h-10 md:px-4 md:text-sm">
            <Save className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
            {isSubmitting
              ? 'Menyimpan...'
              : isEditing
                ? 'Simpan Perubahan'
                : 'Tambah Produk'}
          </Button>
        </div>
      </form>
    </div>
  )
}
