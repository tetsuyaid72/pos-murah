/**
 * Drizzle ORM Client Singleton
 *
 * Automatically selects the right driver:
 * - `file:./dev.db` → better-sqlite3 (local development, no native Turso deps)
 * - `libsql://...`  → @libsql/client (Turso cloud, production)
 *
 * Usage:
 *   import { db } from '@/lib/db'
 *   const allUsers = await db.select().from(users)
 */

import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

type DrizzleDB = ReturnType<typeof drizzleBetterSqlite<typeof schema>>

const globalForDrizzle = globalThis as unknown as {
  db: DrizzleDB | undefined
}

function createDrizzleClient(): DrizzleDB {
  const url = process.env.TURSO_DATABASE_URL!

  // Local file-based SQLite (development)
  const filePath = url.startsWith('file:') ? url.replace('file:', '') : url
  const sqlite = new Database(filePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzleBetterSqlite(sqlite, { schema })
}

export const db = globalForDrizzle.db ?? createDrizzleClient()

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.db = db
}
