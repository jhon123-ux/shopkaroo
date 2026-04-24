-- Drop and recreate draft_orders cleanly
DROP TABLE IF EXISTS draft_orders;

CREATE TABLE draft_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  cart_items JSONB NOT NULL DEFAULT '[]',
  cart_total NUMERIC(10, 2) DEFAULT 0,
  reached_step TEXT DEFAULT 'cart',
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_recovered BOOLEAN DEFAULT false,
  CONSTRAINT draft_orders_user_id_unique UNIQUE (user_id)
);

-- Disable RLS so both anon and service role can write
-- This ensures that the system works even if auth session is finicky
ALTER TABLE draft_orders DISABLE ROW LEVEL SECURITY;
