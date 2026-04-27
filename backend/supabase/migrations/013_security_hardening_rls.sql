-- 🔒 Security Hardening: Enabling RLS for Abandoned Checkouts and Draft Orders
-- These tables contain PII (Names, Phone Numbers) and should not be public.

-- 1. Abandoned Checkouts
ALTER TABLE abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- We only allow the Service Role to manage this table (automatic bypass).
-- No public policies means no access via anon key.
COMMENT ON TABLE abandoned_checkouts IS 'PII sensitive: Managed via Server Actions using Service Role only.';

-- 2. Draft Orders (Legacy)
-- Even though they are legacy, they should be secure while they exist.
ALTER TABLE draft_orders ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup existing data (Optional)
-- Ensure last_activity_at is indexed for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_activity ON abandoned_checkouts(last_activity_at);
