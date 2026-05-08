/**
 * GET /api/backup/export — Export all store data as JSON backup
 *
 * Returns a downloadable JSON file containing:
 * - Store info (name, address, phone)
 * - Categories, Products, Customers
 * - Transactions with items
 * - Debt records
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
  transactionItems,
  debtRecords,
} from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { checkStrictFeatureAccess } from '@/lib/plan-guard'
import { logActivityAsync } from '@/lib/activity'

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

    // Fetch store info
    const [store] = await db
      .select({
        name: stores.name,
        address: stores.address,
        phone: stores.phone,
      })
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
          imageUrl: products.imageUrl,
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

      db.query.transactions.findMany({
        where: eq(transactions.storeId, storeId),
        with: {
          items: {
            columns: {
              id: true,
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

    // Format transactions — convert createdAt to ISO string
    const formattedTransactions = transactionsData.map((t) => ({
      ...t,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
    }))

    // Format debt records — convert dates to ISO strings
    const formattedDebtRecords = debtRecordsData.map((d) => ({
      ...d,
      dueDate: d.dueDate instanceof Date ? d.dueDate.toISOString() : d.dueDate ? String(d.dueDate) : null,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt ? String(d.createdAt) : undefined,
    }))

    const backup = {
      version: '1.0',
      appName: 'warung-madura-pos' as const,
      exportedAt: new Date().toISOString(),
      store: {
        name: store.name,
        address: store.address,
        phone: store.phone,
      },
      categories: categoriesData,
      products: productsData,
      customers: customersData,
      transactions: formattedTransactions,
      debtRecords: formattedDebtRecords,
    }

    // Log activity
    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'backup.export',
      entity: 'backup',
      metadata: {
        format: 'json',
        categories: categoriesData.length,
        products: productsData.length,
        customers: customersData.length,
        transactions: transactionsData.length,
        debtRecords: debtRecordsData.length,
      },
    })

    // Return as downloadable JSON
    const json = JSON.stringify(backup, null, 2)
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `backup-${store.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${dateStr}.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
