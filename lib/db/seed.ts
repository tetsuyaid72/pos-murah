/**
 * Database Seed Script — PostgreSQL (Supabase)
 *
 * Creates:
 * 1. Super Admin user (for developer dashboard)
 * 2. Default feature flags
 *
 * Run: npm run db:seed
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users, featureFlags } from './schema'
import { generateId } from '../utils'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})

const db = drizzle(pool)

async function main() {
  console.log('Seeding database...')

  // =========================================================================
  // 1. Super Admin
  // =========================================================================
  const adminEmail = 'admin@warungmadura.pos'
  const adminPassword = await bcrypt.hash('admin123456', 12)

  // Upsert: check if exists, then insert or skip
  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1)

  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      id: generateId(),
      email: adminEmail,
      name: 'Super Admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    })
    console.log(`  Super Admin created: ${adminEmail}`)
  } else {
    console.log(`  Super Admin already exists: ${adminEmail}`)
  }

  // =========================================================================
  // 2. Feature Flags
  // =========================================================================
  const featureFlagData = [
    {
      key: 'max_products',
      name: 'Batas Jumlah Produk',
      description: 'Jumlah maksimal produk yang bisa ditambahkan',
      planDefaults: { FREE: 999999, STARTER: 100, PRO: 999999, ENTERPRISE: 999999 },
    },
    {
      key: 'export_excel',
      name: 'Export Excel',
      description: 'Export data ke format Excel',
      planDefaults: { FREE: true, STARTER: true, PRO: true, ENTERPRISE: true },
    },
    {
      key: 'export_pdf',
      name: 'Export PDF',
      description: 'Export laporan ke format PDF',
      planDefaults: { FREE: true, STARTER: false, PRO: true, ENTERPRISE: true },
    },
    {
      key: 'multi_outlet',
      name: 'Multi Outlet',
      description: 'Kelola lebih dari satu toko',
      planDefaults: { FREE: false, STARTER: false, PRO: true, ENTERPRISE: true },
    },
    {
      key: 'thermal_printer',
      name: 'Printer Thermal',
      description: 'Cetak struk ke printer thermal Bluetooth',
      planDefaults: { FREE: true, STARTER: true, PRO: true, ENTERPRISE: true },
    },
    {
      key: 'advanced_reports',
      name: 'Laporan Lanjutan',
      description: 'Akses laporan analitik lanjutan',
      planDefaults: { FREE: true, STARTER: false, PRO: true, ENTERPRISE: true },
    },
    {
      key: 'customer_management',
      name: 'Manajemen Pelanggan',
      description: 'Kelola data pelanggan',
      planDefaults: { FREE: true, STARTER: true, PRO: true, ENTERPRISE: true },
    },
    {
      key: 'debt_tracking',
      name: 'Pencatatan Hutang',
      description: 'Catat dan kelola hutang pelanggan',
      planDefaults: { FREE: true, STARTER: true, PRO: true, ENTERPRISE: true },
    },
  ]

  for (const flag of featureFlagData) {
    const existing = await db
      .select({ id: featureFlags.id })
      .from(featureFlags)
      .where(eq(featureFlags.key, flag.key))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(featureFlags).values({
        id: generateId(),
        key: flag.key,
        name: flag.name,
        description: flag.description,
        planDefaults: flag.planDefaults,
      })
    } else {
      await db
        .update(featureFlags)
        .set({
          name: flag.name,
          description: flag.description,
          planDefaults: flag.planDefaults,
        })
        .where(eq(featureFlags.key, flag.key))
    }
  }
  console.log(`  Feature flags: ${featureFlagData.length} flags seeded`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
