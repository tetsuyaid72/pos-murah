/**
 * Supabase Client — untuk Storage dan fitur non-database
 *
 * Database queries tetap menggunakan Drizzle ORM (lib/db).
 * File ini hanya untuk Supabase Storage, Auth (opsional), dll.
 */

import { createClient } from '@supabase/supabase-js'

const STORAGE_FILE_SIZE_LIMIT = 2 * 1024 * 1024 // 2MB
const STORAGE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Server-side client (menggunakan service role key untuk full access)
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah di-set di environment variables.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Ensure a storage bucket exists. Some hosted environments cannot create
 * buckets automatically, so return a clear error if creation fails.
 */
async function ensureBucket(bucket: string): Promise<void> {
  const supabase = createSupabaseAdmin()

  const { data: bucketInfo, error: getError } = await supabase.storage.getBucket(bucket)
  if (bucketInfo) return

  const canCreate =
    getError &&
    (getError.message.toLowerCase().includes('not found') || getError.message.includes('404'))

  if (!canCreate) {
    throw new Error(`Gagal memeriksa bucket "${bucket}": ${getError?.message || 'Bucket tidak dapat diakses'}`)
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: STORAGE_FILE_SIZE_LIMIT,
    allowedMimeTypes: STORAGE_ALLOWED_MIME_TYPES,
  })

  if (createError && !createError.message.toLowerCase().includes('already exists')) {
    throw new Error(`Gagal membuat bucket "${bucket}": ${createError.message}`)
  }
}

// Client-side Supabase (menggunakan anon key, untuk public access)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Upload file ke Supabase Storage
 *
 * @param bucket - Nama bucket, contoh: "uploads"
 * @param filePath - Path di dalam bucket, contoh: "payments/1234-abc.jpg"
 * @param file - File buffer
 * @param contentType - MIME type
 * @returns Public URL dari file yang diupload
 */
export async function uploadToStorage(
  bucket: string,
  filePath: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createSupabaseAdmin()

  await ensureBucket(bucket)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`)
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}
