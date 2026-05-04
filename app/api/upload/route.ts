/**
 * POST /api/upload — Upload a file (image)
 *
 * Protected: requires authentication + store context.
 * Files are stored in public/uploads/{type}/ with unique filenames.
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

// Valid upload types and their subfolder
const UPLOAD_FOLDERS: Record<string, string> = {
  product: 'products',
  profile: 'profiles',
  logo: 'logos',
}

export async function POST(request: NextRequest) {
  try {
    // Auth + tenant guard — only authenticated store owners can upload
    await requireTenant()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

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

    // Determine upload subfolder from query param or form field
    const typeParam = formData.get('type') as string | null
    const folder = UPLOAD_FOLDERS[typeParam || 'product'] || 'products'

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${random}.${ext}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Return the public URL path
    const url = `/uploads/${folder}/${filename}`

    return NextResponse.json({ url }, { status: 200 })
  } catch (error) {
    return handleTenantError(error)
  }
}
