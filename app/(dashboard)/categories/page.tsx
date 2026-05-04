'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import type { Category } from '@/types'

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

export default function CategoriesPage() {
  const { categories, products, fetchCategories, fetchProducts } = useProductStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState(PRESET_COLORS[0])
  const [formDescription, setFormDescription] = useState('')

  // Fetch from database on mount
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.categoryId === categoryId).length
  }

  const resetForm = () => {
    setFormName('')
    setFormColor(PRESET_COLORS[0])
    setFormDescription('')
    setIsAdding(false)
    setEditingId(null)
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setFormName(category.name)
    setFormColor(category.color)
    setFormDescription(category.description || '')
    setIsAdding(false)
  }

  const startAdd = () => {
    resetForm()
    setIsAdding(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setIsSaving(true)

    try {
      if (editingId) {
        // Update existing via API
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            color: formColor,
            description: formDescription || null,
          }),
        })
        if (!res.ok) throw new Error('Gagal mengupdate kategori')
      } else {
        // Create new via API
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            color: formColor,
            description: formDescription || null,
            sortOrder: categories.length + 1,
          }),
        })
        if (!res.ok) throw new Error('Gagal menambah kategori')
      }

      // Refresh from database
      await fetchCategories()
      resetForm()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus kategori')

      await fetchCategories()
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-4 py-4 md:px-6">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Kategori</h1>
          <p className="text-sm text-muted-foreground">
            Kelola kategori produk Anda
          </p>
        </div>
        <Button size="sm" onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {/* Add form */}
          {isAdding && (
            <CategoryFormCard
              name={formName}
              color={formColor}
              description={formDescription}
              onNameChange={setFormName}
              onColorChange={setFormColor}
              onDescriptionChange={setFormDescription}
              onSave={handleSave}
              onCancel={resetForm}
              isSaving={isSaving}
              isNew
            />
          )}

          {/* Category list */}
          {categories.map((category) =>
            editingId === category.id ? (
              <CategoryFormCard
                key={category.id}
                name={formName}
                color={formColor}
                description={formDescription}
                onNameChange={setFormName}
                onColorChange={setFormColor}
                onDescriptionChange={setFormDescription}
                onSave={handleSave}
                onCancel={resetForm}
                isSaving={isSaving}
                isNew={false}
              />
            ) : (
              <Card key={category.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Color dot */}
                  <div
                    className="h-8 w-8 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getProductCount(category.id)} produk
                      {category.description && ` — ${category.description}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEdit(category)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(category)}
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {categories.length === 0 && !isAdding && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">Belum ada kategori.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Hapus Kategori</DialogTitle>
          <DialogClose onClose={() => setDeleteTarget(null)} />
        </DialogHeader>
        <p className="mb-2 text-sm text-muted-foreground">
          Apakah Anda yakin ingin menghapus kategori{' '}
          <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
        </p>
        {deleteTarget && getProductCount(deleteTarget.id) > 0 && (
          <p className="mb-4 rounded-lg bg-warning/10 p-3 text-sm text-warning">
            Kategori ini memiliki {getProductCount(deleteTarget.id)} produk.
            Produk tidak akan dihapus, tetapi kategorinya akan kosong.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isSaving ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

function CategoryFormCard({
  name,
  color,
  description,
  onNameChange,
  onColorChange,
  onDescriptionChange,
  onSave,
  onCancel,
  isSaving,
  isNew,
}: {
  name: string
  color: string
  description: string
  onNameChange: (v: string) => void
  onColorChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  isNew: boolean
}) {
  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium">
          {isNew ? 'Kategori Baru' : 'Edit Kategori'}
        </p>

        <div className="space-y-2">
          <Label>Nama Kategori</Label>
          <Input
            placeholder="Contoh: Minuman"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>Deskripsi (opsional)</Label>
          <Input
            placeholder="Deskripsi singkat"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Warna</Label>
          <div className="flex gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? 'var(--foreground)' : 'transparent',
                }}
                aria-label={`Warna ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" />
            Batal
          </Button>
          <Button size="sm" onClick={onSave} disabled={!name.trim() || isSaving}>
            <Save className="mr-1 h-4 w-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
