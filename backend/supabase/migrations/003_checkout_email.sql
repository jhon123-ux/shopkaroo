-- Migration: Add customer email to orders

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text;

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
