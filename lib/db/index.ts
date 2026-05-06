/**
 * Drizzle ORM Client Singleton — PostgreSQL (Supabase)
 *
 * Uses node-postgres (pg) driver connected to Supabase PostgreSQL.
 *
 * Usage:
 *   import { db } from '@/lib/db'
 *   const allUsers = await db.select().from(users)
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDrizzle = globalThis as unknown as {
  pool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL!

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  })

  return pool
}

const pool = globalForDrizzle.pool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.pool = pool
}

export const db = drizzle(pool, { schema })
