/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv/config')

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const migrationPath = path.join(__dirname, '..', 'lib', 'db', 'migrations', '202502_add_midtrans_payments.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  await client.query(sql)

  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'payments'
      AND column_name IN (
        'provider',
        'provider_order_id',
        'provider_transaction_id',
        'provider_status',
        'snap_token',
        'snap_redirect_url',
        'paid_at',
        'expired_at',
        'metadata'
      )
    ORDER BY column_name
  `)

  console.log('midtrans payment columns:', columns.rows.map((row) => row.column_name).join(', '))
  await client.end()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
