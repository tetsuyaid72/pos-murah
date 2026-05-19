/**
 * GET /api/backup/export-csv — Export all store data as CSV files in a ZIP
 *
 * Returns a downloadable ZIP file containing CSV files:
 * - categories.csv
 * - products.csv
 * - customers.csv
 * - transactions.csv
 * - transaction_items.csv
 * - debt_records.csv
 */

import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  stores,
  categories,
  products,
  customers,
  transactions,
  debtRecords,
} from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { checkStrictFeatureAccess } from '@/lib/plan-guard'
import { logActivityAsync } from '@/lib/activity'
import { convertToCSV, buildZip } from '@/lib/backup/utils'

export async function GET() {
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

    // Fetch store info for filename
    const [store] = await db
      .select({ name: stores.name })
      .from(stores)
      .where(eq(stores.id, storeId))

    if (!store) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    }

    // Fetch all data in parallel
    const [
      categoriesData,
      productsData,
      customersData,
      transactionsData,
      debtRecordsData,
    ] = await Promise.all([
      db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          color: categories.color,
          icon: categories.icon,
          sortOrder: categories.sortOrder,
        })
        .from(categories)
        .where(eq(categories.storeId, storeId)),

      db
        .select({
          id: products.id,
          name: products.name,
          barcode: products.barcode,
          sku: products.sku,
          categoryId: products.categoryId,
          costPrice: products.costPrice,
          sellingPrice: products.sellingPrice,
          stock: products.stock,
          minStock: products.minStock,
          unit: products.unit,
          isActive: products.isActive,
        })
        .from(products)
        .where(eq(products.storeId, storeId)),

      db
        .select({
          id: customers.id,
          name: customers.name,
          phone: customers.phone,
          address: customers.address,
          totalDebt: customers.totalDebt,
        })
        .from(customers)
        .where(eq(customers.storeId, storeId)),

      // Transactions with items via relational query
      db.query.transactions.findMany({
        where: eq(transactions.storeId, storeId),
        with: {
          items: {
            columns: {
              id: true,
              transactionId: true,
              productId: true,
              productName: true,
              quantity: true,
              unitPrice: true,
              costPrice: true,
              discountAmount: true,
              subtotal: true,
            },
          },
        },
        columns: {
          id: true,
          invoiceNumber: true,
          subtotal: true,
          discountAmount: true,
          discountType: true,
          taxAmount: true,
          totalAmount: true,
          paymentMethod: true,
          amountPaid: true,
          changeAmount: true,
          customerId: true,
          status: true,
          notes: true,
          createdAt: true,
        },
      }),

      db
        .select({
          id: debtRecords.id,
          customerId: debtRecords.customerId,
          transactionId: debtRecords.transactionId,
          amount: debtRecords.amount,
          paidAmount: debtRecords.paidAmount,
          status: debtRecords.status,
          dueDate: debtRecords.dueDate,
          createdAt: debtRecords.createdAt,
        })
        .from(debtRecords)
        .where(eq(debtRecords.storeId, storeId)),
    ])

    // Flatten transaction items for CSV
    const allItems: Record<string, unknown>[] = []
    const flatTransactions: Record<string, unknown>[] = []

    for (const t of transactionsData) {
      const createdAt = t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt)
      flatTransactions.push({
        id: t.id,
        invoiceNumber: t.invoiceNumber,
        subtotal: t.subtotal,
        discountAmount: t.discountAmount,
        discountType: t.discountType,
        taxAmount: t.taxAmount,
        totalAmount: t.totalAmount,
        paymentMethod: t.paymentMethod,
        amountPaid: t.amountPaid,
        changeAmount: t.changeAmount,
        customerId: t.customerId,
        status: t.status,
        notes: t.notes,
        createdAt,
      })

      for (const item of t.items) {
        allItems.push({
          id: item.id,
          transactionId: item.transactionId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          discountAmount: item.discountAmount,
          subtotal: item.subtotal,
        })
      }
    }

    // Format debt records dates
    const flatDebtRecords = debtRecordsData.map((d) => ({
      ...d,
      dueDate: d.dueDate instanceof Date ? d.dueDate.toISOString() : d.dueDate ?? '',
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt ?? '',
    }))

    // Build CSV files
    const csvFiles: Record<string, string> = {}

    if (categoriesData.length > 0) {
      csvFiles['categories.csv'] = convertToCSV(categoriesData as Record<string, unknown>[])
    }
    if (productsData.length > 0) {
      csvFiles['products.csv'] = convertToCSV(productsData as Record<string, unknown>[])
    }
    if (customersData.length > 0) {
      csvFiles['customers.csv'] = convertToCSV(customersData as Record<string, unknown>[])
    }
    if (flatTransactions.length > 0) {
      csvFiles['transactions.csv'] = convertToCSV(flatTransactions)
    }
    if (allItems.length > 0) {
      csvFiles['transaction_items.csv'] = convertToCSV(allItems)
    }
    if (flatDebtRecords.length > 0) {
      csvFiles['debt_records.csv'] = convertToCSV(flatDebtRecords as Record<string, unknown>[])
    }

    // If no data at all, add a readme
    if (Object.keys(csvFiles).length === 0) {
      csvFiles['README.txt'] = 'Tidak ada data untuk di-export.'
    }

    // Build ZIP
    const zipBytes = buildZip(csvFiles)

    // Log activity
    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'backup.export',
      entity: 'backup',
      metadata: {
        format: 'csv',
        categories: categoriesData.length,
        products: productsData.length,
        customers: customersData.length,
        transactions: transactionsData.length,
      },
    })

    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `backup-${store.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${dateStr}.zip`

    return new NextResponse(Buffer.from(zipBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
