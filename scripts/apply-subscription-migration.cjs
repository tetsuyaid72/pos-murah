require('dotenv/config')

const { Client } = require('pg')

const sql = `
ALTER TABLE memberships
  ADD COLUMN IF NOT EXISTS billing_period text,
  ADD COLUMN IF NOT EXISTS subscription_start_at timestamp,
  ADD COLUMN IF NOT EXISTS subscription_end_at timestamp;

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND pg_get_constraintdef(oid) ILIKE '%billing_period%'
  LOOP
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE payments
  ALTER COLUMN billing_period DROP DEFAULT;

ALTER TABLE payments
  ALTER COLUMN billing_period SET DEFAULT 'lifetime';

ALTER TABLE payments
  ADD CONSTRAINT payments_billing_period_check
  CHECK (billing_period IN ('monthly', 'lifetime'));

UPDATE memberships
SET billing_period = CASE
  WHEN plan = 'PRO' AND is_trial = false THEN 'monthly'
  WHEN plan = 'BUSINESS' THEN 'lifetime'
  ELSE billing_period
END
WHERE billing_period IS NULL;
`

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  await client.query(sql)

  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'memberships'
      AND column_name IN ('billing_period', 'subscription_start_at', 'subscription_end_at')
    ORDER BY column_name
  `)

  const constraint = await client.query(`
    SELECT pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND conname = 'payments_billing_period_check'
  `)

  console.log('membership columns:', columns.rows.map((row) => row.column_name).join(', '))
  console.log('payment constraint:', constraint.rows[0]?.def || 'missing')

  await client.end()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
