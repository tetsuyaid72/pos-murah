ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS provider_order_id text,
  ADD COLUMN IF NOT EXISTS provider_transaction_id text,
  ADD COLUMN IF NOT EXISTS provider_status text,
  ADD COLUMN IF NOT EXISTS snap_token text,
  ADD COLUMN IF NOT EXISTS snap_redirect_url text,
  ADD COLUMN IF NOT EXISTS paid_at timestamp,
  ADD COLUMN IF NOT EXISTS expired_at timestamp,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', c.conname);
  END LOOP;

  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND pg_get_constraintdef(oid) ILIKE '%method%'
  LOOP
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'));

ALTER TABLE payments
  ADD CONSTRAINT payments_method_check
  CHECK (method IN ('BANK_TRANSFER', 'QRIS', 'MIDTRANS'));

ALTER TABLE payments
  ADD CONSTRAINT payments_provider_check
  CHECK (provider IN ('MANUAL', 'MIDTRANS'));

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_order_id_unique_idx
  ON payments(provider_order_id)
  WHERE provider_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_provider_order_id_idx ON payments(provider_order_id);
