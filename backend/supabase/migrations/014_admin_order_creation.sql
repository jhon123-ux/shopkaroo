-- Phase 1: Admin Order Creation support columns
-- Adding order_source to distinguish between website orders and manual admin entries
-- Adding created_by to track which admin agent or person created the record

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_source TEXT DEFAULT 'website' 
CHECK (order_source IN ('website', 'admin_manual', 'admin_duplicate'));

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Create an index for order_source to help with filtering/reporting
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(order_source);
