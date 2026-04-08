-- Shopkarro CMS: Categories Migration
-- 🏺 Database Schema Expansion

ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 🏛️ Public Read Policy: Restrict to Active Categories
CREATE POLICY "Public read active categories"
ON categories FOR SELECT
USING (is_active = true);

-- 🛡️ Administrative Policy: Service Role Full Access
CREATE POLICY "Service role full access categories"
ON categories FOR ALL
USING (auth.role() = 'service_role');

-- 🏺 Seed Registry Initialization
-- (Use UPSERT to preserve foreign key references from the 'products' table)

INSERT INTO categories 
  (name, slug, icon, image_url, sort_order, is_active)
VALUES
  ('Living Room', 'living-room', '🛋️', null, 1, true),
  ('Bedroom', 'bedroom', '🛏️', null, 2, true),
  ('Office', 'office', '🪑', null, 3, true),
  ('Dining', 'dining', '🍽️', null, 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;
