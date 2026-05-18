import { NextRequest, NextResponse } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { logActivityAsync } from '@/lib/activity'
import { handleTenantError, requireTenant } from '@/lib/db/tenant'
import { checkProductLimit } from '@/lib/plan-guard'

type ImportStatus = 'valid' | 'error' | 'duplicate'

interface ParsedRow {
  row: number
  name: string
  categoryName: string
  barcode: string
  sku: string
  costPrice: number
  sellingPrice: number
  stock: number
  minStock: number
  unit: string
  isActive: boolean
  status: ImportStatus
  notes: string[]
}

const HEADER_ALIASES: Record<string, string> = {
  'nama produk': 'name',
  nama: 'name',
  produk: 'name',
  kategori: 'categoryName',
  category: 'categoryName',
  barcode: 'barcode',
  sku: 'sku',
  'harga modal': 'costPrice',
  modal: 'costPrice',
  cost: 'costPrice',
  'harga jual': 'sellingPrice',
  jual: 'sellingPrice',
  price: 'sellingPrice',
  stok: 'stock',
  stock: 'stock',
  'stok minimum': 'minStock',
  'min stok': 'minStock',
  minstock: 'minStock',
  satuan: 'unit',
  unit: 'unit',
  aktif: 'isActive',
  active: 'isActive',
}

export async function POST(request: NextRequest) {
  try {
    const { session, storeId } = await requireTenant()
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File CSV wajib diupload' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Saat ini import mendukung file CSV yang bisa dibuka dari Excel.' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 })
    }

    const text = await file.text()
    const parsed = parseProductsCsv(text)
    if (parsed.length === 0) {
      return NextResponse.json({ error: 'File tidak berisi produk valid' }, { status: 400 })
    }

    const activeRows = parsed.filter((row) => row.isActive)
    const planCheck = await checkProductLimit(storeId)
    if (!planCheck.allowed || planCheck.current + activeRows.length > planCheck.limit) {
      return NextResponse.json({
        error: planCheck.message,
        code: 'PLAN_LIMIT_REACHED',
        limit: planCheck.limit,
        current: planCheck.current,
        incoming: activeRows.length,

      }, { status: 403 })
    }

    const existingProducts = await db.query.products.findMany({
      where: eq(products.storeId, storeId),
      columns: { name: true, barcode: true, sku: true },
    })
    const existingKeys = new Set<string>()
    existingProducts.forEach((product) => {
      if (product.barcode) existingKeys.add(`barcode:${product.barcode}`)
      if (product.sku) existingKeys.add(`sku:${product.sku.toLowerCase()}`)
      existingKeys.add(`name:${product.name.toLowerCase()}`)
    })

    const seenKeys = new Set<string>()
    const checkedRows = parsed.map((row) => markDuplicate(row, existingKeys, seenKeys))
    const validRows = checkedRows.filter((row) => row.status === 'valid')

    const categoryNames = [...new Set(validRows.map((row) => row.categoryName).filter(Boolean))]
    const existingCategories = categoryNames.length > 0
      ? await db.query.categories.findMany({
          where: and(eq(categories.storeId, storeId), inArray(categories.name, categoryNames)),
        })
      : []

    const categoryMap = new Map(existingCategories.map((category) => [category.name.toLowerCase(), category.id]))
    const missingCategoryNames = categoryNames.filter((name) => !categoryMap.has(name.toLowerCase()))

    for (const name of missingCategoryNames) {
      const [category] = await db.insert(categories).values({
        storeId,
        name,
        color: '#10b981',
      }).returning()
      categoryMap.set(category.name.toLowerCase(), category.id)
    }

    const inserted = validRows.length > 0
      ? await db.insert(products).values(validRows.map((row) => ({
          storeId,
          name: row.name,
          barcode: row.barcode || null,
          sku: row.sku || null,
          categoryId: categoryMap.get(row.categoryName.toLowerCase()) || null,
          costPrice: row.costPrice,
          sellingPrice: row.sellingPrice,
          stock: row.stock,
          minStock: row.minStock,
          unit: row.unit,
          isActive: row.isActive,
        }))).returning()
      : []

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'product.import',
      entity: 'product',
      metadata: { imported: inserted.length, totalRows: checkedRows.length },
    })

    return NextResponse.json({
      imported: inserted.length,
      skipped: checkedRows.filter((row) => row.status === 'duplicate').length,
      errors: checkedRows.filter((row) => row.status === 'error').length,
      totalRows: checkedRows.length,
      rows: checkedRows.slice(0, 100),
    })
  } catch (error) {
    return handleTenantError(error)
  }
}

function parseProductsCsv(text: string): ParsedRow[] {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''))
  if (rows.length < 2) return []

  const headers = rows[0].map((header) => normalizeHeader(header))
  return rows.slice(1)
    .map((values, index) => parseRow(values, headers, index + 2))
    .filter((row) => row.name || row.notes.length > 0)
}

function parseRow(values: string[], headers: string[], rowNumber: number): ParsedRow {
  const row: Record<string, string> = {}
  headers.forEach((key, index) => {
    if (key) row[key] = values[index]?.trim() || ''
  })

  const notes: string[] = []
  const name = row.name?.trim() || ''
  const categoryName = row.categoryName?.trim() || 'Lainnya'
  const barcode = cleanCode(row.barcode)
  const sku = cleanCode(row.sku)
  const costPrice = parseMoney(row.costPrice)
  const sellingPrice = parseMoney(row.sellingPrice)
  const stock = parseInteger(row.stock)
  const minStock = parseInteger(row.minStock)
  const unit = row.unit?.trim() || 'pcs'
  const isActive = parseActive(row.isActive)

  if (!name) notes.push('Nama produk wajib diisi')
  if (sellingPrice <= 0) notes.push('Harga jual wajib angka lebih dari 0')
  if (costPrice < 0) notes.push('Harga modal tidak boleh minus')
  if (stock < 0) notes.push('Stok tidak boleh minus')
  if (minStock < 0) notes.push('Stok minimum tidak boleh minus')
  if (costPrice > sellingPrice && sellingPrice > 0) notes.push('Harga jual lebih kecil dari harga modal')

  return {
    row: rowNumber,
    name,
    categoryName,
    barcode,
    sku,
    costPrice,
    sellingPrice,
    stock,
    minStock,
    unit,
    isActive,
    status: notes.length > 0 ? 'error' : 'valid',
    notes,
  }
}

function markDuplicate(row: ParsedRow, existingKeys: Set<string>, seenKeys: Set<string>): ParsedRow {
  if (row.status === 'error') return row

  const keys = [
    row.barcode ? `barcode:${row.barcode}` : '',
    row.sku ? `sku:${row.sku.toLowerCase()}` : '',
    `name:${row.name.toLowerCase()}`,
  ].filter(Boolean)

  const duplicate = keys.some((key) => existingKeys.has(key) || seenKeys.has(key))
  keys.forEach((key) => seenKeys.add(key))

  return duplicate
    ? { ...row, status: 'duplicate', notes: ['Produk duplikat, dilewati'] }
    : row
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(current)
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  row.push(current)
  if (row.some((cell) => cell.trim())) rows.push(row)
  return rows
}

function normalizeHeader(header: string): string {
  const normalized = header.trim().toLowerCase().replace(/_/g, ' ')
  return HEADER_ALIASES[normalized] || ''
}

function parseMoney(value = ''): number {
  const cleaned = value.replace(/rp/gi, '').replace(/\./g, '').replace(/,/g, '').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function parseInteger(value = ''): number {
  const parsed = Number(value.replace(/\./g, '').replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

function parseActive(value = ''): boolean {
  const normalized = value.trim().toLowerCase()
  return !['tidak', 'no', 'false', '0', 'nonaktif'].includes(normalized)
}

function cleanCode(value = ''): string {
  return value.trim().replace(/\.0$/, '')
}
