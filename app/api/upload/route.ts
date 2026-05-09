/**
 * POST /api/upload — Upload a file (image)
 *
 * Uses Supabase Storage. Bucket must already exist in Supabase.
 *
 * Protected: requires authentication.
 * - Payment uploads: only require authenticated user (no store context needed)
 * - Other uploads: require full tenant context (auth + store)
 *
 * Buckets yang digunakan:
 * - "uploads" (single bucket dengan folder: products/, profiles/, logos/, payments/)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireTenant, handleTenantError, TenantError } from '@/lib/db/tenant'
import { uploadToStorage } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

// Valid upload types and their subfolder
const UPLOAD_FOLDERS: Record<string, string> = {
  product: 'products',
  profile: 'profiles',
  logo: 'logos',
  payment: 'payments',
}

// Bucket name di Supabase Storage
const STORAGE_BUCKET = 'uploads'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const fileValue = formData.get('file')
    const typeValue = formData.get('type')
    const file = fileValue instanceof File ? fileValue : null
    const typeParam = typeof typeValue === 'string' ? typeValue : null

    // Payment uploads only require authentication (no store context needed)
    // Other uploads require full tenant context
    if (typeParam === 'payment') {
      const session = await getSession()
      if (!session) {
        throw new TenantError('Tidak terautentikasi', 401)
      }
    } else {
      await requireTenant()
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 2MB.' },
        { status: 400 }
      )
    }

    // Determine upload subfolder
    const folder = UPLOAD_FOLDERS[typeParam || 'product'] || 'products'

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${random}.${ext}`
    const storagePath = `${folder}/${filename}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    try {
      const publicUrl = await uploadToStorage(
        STORAGE_BUCKET,
        storagePath,
        buffer,
        file.type
      )
      return NextResponse.json({ url: publicUrl }, { status: 200 })
    } catch (uploadErr) {
      const message = uploadErr instanceof Error ? uploadErr.message : 'Upload gagal'
      console.error('[Upload] Supabase Storage error:', {
        message,
        bucket: STORAGE_BUCKET,
        path: storagePath,
        type: typeParam || 'product',
      })
      return NextResponse.json(
        { error: message },
        { status: 500 }
      )
    }
  } catch (error) {
    return handleTenantError(error)
  }
}
