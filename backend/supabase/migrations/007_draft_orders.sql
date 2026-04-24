-- STEP 1 — SUPABASE MIGRATION
-- Create draft_orders table to capture abandoned carts from logged-in users.

CREATE TABLE IF NOT EXISTS draft_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  cart_items JSONB NOT NULL DEFAULT '[]',
  cart_total NUMERIC(10, 2) DEFAULT 0,
  reached_step TEXT DEFAULT 'cart',
  -- values: 'cart' | 'checkout' | 'payment'
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_recovered BOOLEAN DEFAULT false,
  recovered_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  UNIQUE(user_id) -- Ensures one draft per user
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_draft_orders_user_id ON draft_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_orders_last_activity ON draft_orders(last_activity_at DESC);

-- RLS: only service role can read (admin use).
-- Note: Service role bypasses RLS by default.
ALTER TABLE draft_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to draft_orders"
  ON draft_orders FOR ALL
  USING (auth.role() = 'service_role');

-- Optional: Allow users to see their own draft if needed, but not required for current spec.
-- CREATE POLICY "Users read own draft" ON draft_orders FOR SELECT USING (auth.uid() = user_id);
