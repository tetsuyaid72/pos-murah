/**
 * POST /api/backup/import — Import/restore data from a JSON backup file
 *
 * Accepts a JSON backup file, validates it, then replaces all store data
 * within a database transaction. All IDs are re-generated for cross-account
 * restore support.
 *
 * Request: multipart/form-data with a "file" field containing the JSON backup
 * Response: { success: true, imported: { categories, products, ... } }
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  stores,
  categories,
  products,
  customers,
  transactions,
  transactionItems,
  debtRecords,
} from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { checkStrictFeatureAccess } from '@/lib/plan-guard'
import { logActivityAsync } from '@/lib/activity'
import { backupFileSchema } from '@/lib/backup/schema'
import { generateIdMapping, resolveId } from '@/lib/backup/utils'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const { session, storeId } = await requireTenant()

    // Check Pro plan access
    const access = await checkStrictFeatureAccess(storeId, 'backup_restore')
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.message, code: 'PLAN_LIMIT_REACHED' },
        { status: 403 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'File backup tidak ditemukan. Upload file JSON.' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      )
    }

    // Parse JSON
    let rawData: unknown
    try {
      const text = await file.text()
      rawData = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: 'File bukan JSON yang valid.' },
        { status: 400 }
      )
    }

    // Validate with Zod schema
    const parseResult = backupFileSchema.safeParse(rawData)
    if (!parseResult.success) {
      const issues = parseResult.error.issues.slice(0, 5).map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
      return NextResponse.json(
        { error: 'Format file backup tidak valid.', details: issues },
        { status: 400 }
      )
    }

    const backup = parseResult.data

    // Generate ID mappings for all entities
    const categoryIds = generateIdMapping(backup.categories.map((c) => c.id))
    const productIds = generateIdMapping(backup.products.map((p) => p.id))
    const customerIds = generateIdMapping(backup.customers.map((c) => c.id))
    const transactionIds = generateIdMapping(backup.transactions.map((t) => t.id))
    const debtRecordIds = generateIdMapping(backup.debtRecords.map((d) => d.id))

    // Also map transaction item IDs
    const allItemIds: string[] = []
    for (const t of backup.transactions) {
      for (const item of t.items) {
        if (item.id) allItemIds.push(item.id)
      }
    }
    const transactionItemIds = generateIdMapping(allItemIds)

    // Execute import in a database transaction
    const imported = await db.transaction(async (tx) => {
      // 1. Delete existing data (order matters due to foreign keys)
      //    Delete debt records first (references customers & transactions)
      await tx.delete(debtRecords).where(eq(debtRecords.storeId, storeId))
      //    Delete transactions (cascades to transactionItems automatically)
      await tx.delete(transactions).where(eq(transactions.storeId, storeId))
      //    Delete products (after transactions since transactionItems ref products with SET NULL)
      await tx.delete(products).where(eq(products.storeId, storeId))
      //    Delete customers (after transactions since transactions ref customers with SET NULL)
      await tx.delete(customers).where(eq(customers.storeId, storeId))
      //    Delete categories last (products ref categories with SET NULL, already deleted)
      await tx.delete(categories).where(eq(categories.storeId, storeId))

      // 2. Import categories
      if (backup.categories.length > 0) {
        await tx.insert(categories).values(
          backup.categories.map((c) => ({
            id: categoryIds.get(c.id)!,
            storeId,
            name: c.name,
            description: c.description ?? null,
            color: c.color ?? '#6366f1',
            icon: c.icon ?? null,
            sortOrder: c.sortOrder ?? 0,
          }))
        )
      }

      // 3. Import products (uses category mapping)
      if (backup.products.length > 0) {
        await tx.insert(products).values(
          backup.products.map((p) => ({
            id: productIds.get(p.id)!,
            storeId,
            name: p.name,
            barcode: p.barcode ?? null,
            sku: p.sku ?? null,
            categoryId: resolveId(categoryIds, p.categoryId),
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            stock: p.stock,
            minStock: p.minStock ?? 0,
            unit: p.unit ?? 'pcs',
            imageUrl: p.imageUrl ?? null,
            isActive: p.isActive ?? true,
          }))
        )
      }

      // 4. Import customers
      if (backup.customers.length > 0) {
        await tx.insert(customers).values(
          backup.customers.map((c) => ({
            id: customerIds.get(c.id)!,
            storeId,
            name: c.name,
            phone: c.phone ?? null,
            address: c.address ?? null,
            totalDebt: c.totalDebt ?? 0,
          }))
        )
      }

      // 5. Import transactions + items
      if (backup.transactions.length > 0) {
        // Insert transactions
        await tx.insert(transactions).values(
          backup.transactions.map((t) => ({
            id: transactionIds.get(t.id)!,
            storeId,
            invoiceNumber: t.invoiceNumber,
            subtotal: t.subtotal,
            discountAmount: t.discountAmount ?? 0,
            discountType: (t.discountType as 'PERCENTAGE' | 'FIXED') ?? 'FIXED',
            taxAmount: t.taxAmount ?? 0,
            totalAmount: t.totalAmount,
            paymentMethod: (t.paymentMethod as 'CASH' | 'QRIS' | 'DEBT') ?? 'CASH',
            amountPaid: t.amountPaid,
            changeAmount: t.changeAmount ?? 0,
            customerId: resolveId(customerIds, t.customerId),
            status: (t.status as 'COMPLETED' | 'PENDING' | 'VOIDED') ?? 'COMPLETED',
            notes: t.notes ?? null,
            // Preserve original createdAt timestamp
            createdAt: new Date(t.createdAt),
          }))
        )

        // Insert all transaction items
        const allItems = backup.transactions.flatMap((t) =>
          t.items.map((item) => ({
            id: item.id ? (transactionItemIds.get(item.id) ?? undefined) : undefined,
            transactionId: transactionIds.get(t.id)!,
            productId: resolveId(productIds, item.productId),
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice ?? 0,
            discountAmount: item.discountAmount ?? 0,
            subtotal: item.subtotal,
          }))
        )

        if (allItems.length > 0) {
          // Insert in batches of 500 to avoid query size limits
          const BATCH_SIZE = 500
          for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
            const batch = allItems.slice(i, i + BATCH_SIZE)
            await tx.insert(transactionItems).values(batch)
          }
        }
      }

      // 6. Import debt records
      if (backup.debtRecords.length > 0) {
        await tx.insert(debtRecords).values(
          backup.debtRecords.map((d) => ({
            id: debtRecordIds.get(d.id)!,
            storeId,
            customerId: customerIds.get(d.customerId)!,
            transactionId: resolveId(transactionIds, d.transactionId),
            amount: d.amount,
            paidAmount: d.paidAmount ?? 0,
            status: (d.status as 'UNPAID' | 'PARTIAL' | 'PAID') ?? 'UNPAID',
            dueDate: d.dueDate ? new Date(d.dueDate) : null,
            createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          }))
        )
      }

      // 7. Update store info if provided
      if (backup.store) {
        await tx
          .update(stores)
          .set({
            name: backup.store.name,
            address: backup.store.address ?? null,
            phone: backup.store.phone ?? null,
          })
          .where(eq(stores.id, storeId))
      }

      return {
        categories: backup.categories.length,
        products: backup.products.length,
        customers: backup.customers.length,
        transactions: backup.transactions.length,
        transactionItems: backup.transactions.reduce((sum, t) => sum + t.items.length, 0),
        debtRecords: backup.debtRecords.length,
      }
    })

    // Log activity
    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'backup.import',
      entity: 'backup',
      metadata: {
        ...imported,
        version: backup.version,
        exportedAt: backup.exportedAt,
      },
    })

    return NextResponse.json({
      success: true,
      imported,
      message: 'Data berhasil di-import.',
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
