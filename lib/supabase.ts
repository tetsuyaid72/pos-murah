/**
 * Supabase Client — untuk Storage dan fitur non-database
 *
 * Database queries tetap menggunakan Drizzle ORM (lib/db).
 * File ini hanya untuk Supabase Storage, Auth (opsional), dll.
 */

import { createClient } from '@supabase/supabase-js'

// Server-side client (menggunakan service role key untuk full access)
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

// Client-side Supabase (menggunakan anon key, untuk public access)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Ensure a storage bucket exists (create if missing).
 * Uses service role key so it has permission to create buckets.
 */
async function ensureBucket(bucket: string): Promise<void> {
  const supabase = createSupabaseAdmin()

  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === bucket)

  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    })
    if (error && !error.message.includes('already exists')) {
      throw new Error(`Gagal membuat bucket "${bucket}": ${error.message}`)
    }
  }
}

/**
 * Upload file ke Supabase Storage
 *
 * @param bucket - Nama bucket (e.g. "uploads")
 * @param filePath - Path di dalam bucket (e.g. "payments/1234-abc.jpg")
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

  // Ensure bucket exists before uploading
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

  // Get public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}
