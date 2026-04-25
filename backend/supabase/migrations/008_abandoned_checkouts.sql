-- Implementation of Shopify-style abandoned checkout capture
-- This captures data progressively for both guests and logged-in users

DROP TABLE IF EXISTS abandoned_checkouts;

CREATE TABLE abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity: session for guests, user_id for logged-in
  session_id TEXT NOT NULL,          -- always set (localStorage UUID)
  user_id UUID,                      -- set only if logged in
  
  -- Contact info (captured progressively as user types)
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_city TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  
  -- Cart snapshot
  cart_items JSONB NOT NULL DEFAULT '[]',
  cart_total NUMERIC(10, 2) DEFAULT 0,
  
  -- How far they got
  reached_step TEXT DEFAULT 'cart',
  -- 'cart'     → had items in cart, never went to checkout
  -- 'checkout' → opened checkout form
  -- 'phone'    → filled phone number (HIGH VALUE — can call/whatsapp)
  -- 'address'  → filled full address (HIGHEST VALUE — almost bought)
  
  -- Status
  is_recovered BOOLEAN DEFAULT false,
  recovered_order_id UUID,
  
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One record per browser session
  CONSTRAINT abandoned_checkouts_session_unique UNIQUE (session_id)
);

-- Disable RLS for easy read/write
ALTER TABLE abandoned_checkouts DISABLE ROW LEVEL SECURITY;

-- Confirm
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'abandoned_checkouts';
