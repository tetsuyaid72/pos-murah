ALTER TABLE memberships
  ADD COLUMN IF NOT EXISTS billing_period text,
  ADD COLUMN IF NOT EXISTS subscription_start_at timestamp,
  ADD COLUMN IF NOT EXISTS subscription_end_at timestamp;

ALTER TABLE payments
  ALTER COLUMN billing_period DROP DEFAULT;

ALTER TABLE payments
  ALTER COLUMN billing_period SET DEFAULT 'lifetime';

UPDATE memberships
SET billing_period = CASE WHEN plan = 'PRO' AND is_trial = false THEN 'monthly' WHEN plan = 'BUSINESS' THEN 'lifetime' ELSE billing_period END
WHERE billing_period IS NULL;
