/**
 * Supabase Client — untuk Storage dan fitur non-database
 *
 * Database queries tetap menggunakan Drizzle ORM (lib/db).
 * File ini hanya untuk Supabase Storage, Auth (opsional), dll.
 */

import { createClient } from '@supabase/supabase-js'

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value?.replace(/^['"]|['"]$/g, '')
}

// Server-side client (menggunakan service role key untuk full access)
export function createSupabaseAdmin() {
  const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseServiceKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')

  console.log('[Supabase Env Check]', {
    hasUrl: Boolean(supabaseUrl),
    url: supabaseUrl,
    hasServiceKey: Boolean(supabaseServiceKey),
    serviceKeyPrefix: supabaseServiceKey?.slice(0, 10),
  })

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables')
  }

  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.endsWith('.supabase.co')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL tidak valid. Gunakan format https://PROJECT_REF.supabase.co tanpa tanda kutip.')
  }

  if (!supabaseServiceKey.startsWith('sb_secret_') && !supabaseServiceKey.startsWith('eyJ')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY tidak valid. Gunakan service_role/secret key dari Supabase Dashboard > Settings > API tanpa tanda kutip.')
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
  const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

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

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('[Upload] Supabase upload error:', {
      message: error.message,
      bucket,
      filePath,
      contentType,
    })

    throw new Error(`Upload gagal: ${error.message}`)
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}
