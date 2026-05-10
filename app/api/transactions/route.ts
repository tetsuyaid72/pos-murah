/**
 * GET  /api/transactions — List transactions (scoped to store)
 * POST /api/transactions — Create a transaction (POS checkout)
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, gte, lte, desc, isNull, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transactions, transactionItems, products } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'
import { generateId } from '@/lib/utils'
import { checkTransactionLimit } from '@/lib/plan-guard'

type TransactionItemInput = {
  productId?: string
  productName: string
  quantity: number
  unitPrice: number
  costPrice?: number
  discountAmount?: number
  subtotal: number
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

function normalizeTransactionItems(items: TransactionItemInput[]) {
  return items.map((item, index) => {
    if (!item.productId || typeof item.productId !== 'string') {
      throw new Error(`Item ke-${index + 1} tidak memiliki productId yang valid`)
    }
    if (!item.productName || typeof item.productName !== 'string') {
      throw new Error(`Item ke-${index + 1} tidak memiliki nama produk yang valid`)
    }
    if (!isPositiveInteger(item.quantity)) {
      throw new Error(`Qty untuk ${item.productName} tidak valid`)
    }
    if (!isNonNegativeInteger(item.unitPrice)) {
      throw new Error(`Harga jual untuk ${item.productName} tidak valid`)
    }
    if (!isNonNegativeInteger(item.subtotal)) {
      throw new Error(`Subtotal untuk ${item.productName} tidak valid`)
    }

    const costPrice = isNonNegativeInteger(item.costPrice) ? item.costPrice : 0
    const discountAmount = isNonNegativeInteger(item.discountAmount) ? item.discountAmount : 0
    const expectedSubtotal = item.quantity * item.unitPrice - discountAmount

    if (expectedSubtotal !== item.subtotal) {
      throw new Error(`Subtotal untuk ${item.productName} tidak cocok dengan qty dan harga`)
    }

    return {
      productId: item.productId,
      productName: item.productName.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice,
      discountAmount,
      subtotal: item.subtotal,
    }
  })
}

function toTransactionItemValues(items: TransactionItemInput[], transactionId: string) {
  return items.map((item) => ({
    transactionId,
    productId: item.productId || null,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    costPrice: item.costPrice ?? 0,
    discountAmount: item.discountAmount ?? 0,
    subtotal: item.subtotal,
  }))
}

function mergeStockQuantities(items: TransactionItemInput[]) {
  const quantities = new Map<string, number>()

  for (const item of items) {
    if (!item.productId) continue

    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
  }

  return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }))
}

export async function GET(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = Math.min(Number(searchParams.get('limit') || 50), 100)
    const offset = Number(searchParams.get('offset') || 0)

    const conditions = [eq(transactions.storeId, storeId), isNull(transactions.deletedAt)]

    if (status) {
      conditions.push(eq(transactions.status, status as 'COMPLETED' | 'PENDING' | 'VOIDED'))
    }
    if (from) {
      conditions.push(gte(transactions.createdAt, new Date(from)))
    }
    if (to) {
      conditions.push(lte(transactions.createdAt, new Date(to)))
    }

    const result = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        items: true,
        customer: { columns: { id: true, name: true } },
      },
      orderBy: desc(transactions.createdAt),
      limit,
      offset,
    })

    return NextResponse.json({ transactions: result })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, storeId } = await requireTenant()

    // Check plan limit before creating transaction
    const planCheck = await checkTransactionLimit(storeId)
    if (!planCheck.allowed) {
      return NextResponse.json(
        {
          error: planCheck.message,
          code: 'PLAN_LIMIT_REACHED',
          limit: planCheck.limit,
          current: planCheck.current,
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      items: rawItems,
      subtotal,
      discountAmount = 0,
      discountType = 'FIXED',
      taxAmount = 0,
      totalAmount,
      paymentMethod = 'CASH',
      amountPaid = 0,
      changeAmount = 0,
      customerId,
      notes,
    } = body

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Transaksi harus memiliki minimal 1 item' }, { status: 400 })
    }

    const items = normalizeTransactionItems(rawItems as TransactionItemInput[])

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Total transaksi tidak valid' }, { status: 400 })
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId).filter(Boolean)))
    const existingProducts = productIds.length
      ? await db.query.products.findMany({
          where: and(inArray(products.id, productIds), eq(products.storeId, storeId)),
          columns: { id: true, name: true, costPrice: true, sellingPrice: true, stock: true, isActive: true },
        })
      : []

    const productMap = new Map(existingProducts.map((product) => [product.id, product]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produk untuk item "${item.productName}" tidak ditemukan atau bukan milik toko ini` },
          { status: 400 }
        )
      }
      if (!product.isActive) {
        return NextResponse.json(
          { error: `Produk "${product.name}" sudah nonaktif dan tidak bisa dijual` },
          { status: 400 }
        )
      }
    }

    // Generate invoice number: INV-{YYYYMMDD}-{random}
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
    const invoiceNumber = `INV-${dateStr}-${rand}`

    const transactionId = generateId()

    // Create transaction + items + update stock in an async transaction (PostgreSQL)
    await db.transaction(async (tx) => {
      // 1. Insert transaction
      await tx.insert(transactions).values({
        id: transactionId,
        storeId,
        invoiceNumber,
        subtotal: subtotal ?? 0,
        discountAmount,
        discountType,
        taxAmount,
        totalAmount,
        paymentMethod,
        amountPaid,
        changeAmount,
        customerId: customerId || null,
        status: 'COMPLETED',
        notes: notes || null,
      })

      // 2. Insert transaction items
      const itemValues = toTransactionItemValues(items, transactionId)
      const stockAdjustments = mergeStockQuantities(items)

      await tx.insert(transactionItems).values(itemValues)

      // 3. Decrease stock per unique product without extra select queries
      for (const item of stockAdjustments) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(and(eq(products.id, item.productId), eq(products.storeId, storeId)))
      }
    })

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'transaction.create',
      entity: 'transaction',
      entityId: transactionId,
      metadata: { invoiceNumber, totalAmount, itemCount: items.length },
    })

    return NextResponse.json(
      { transaction: { id: transactionId, invoiceNumber, totalAmount, status: 'COMPLETED' } },
      { status: 201 }
    )
  } catch (error) {
    return handleTenantError(error)
  }
}
