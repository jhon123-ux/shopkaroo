-- Create Categories Table
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  image text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Products Table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_urdu text,
  slug text NOT NULL UNIQUE,
  description text,
  price_pkr integer NOT NULL,
  sale_price integer,
  category text REFERENCES categories(slug),
  material text,
  dimensions jsonb,
  images text[] DEFAULT '{}',
  stock_qty integer DEFAULT 0,
  weight_kg numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Orders Table
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL,
  subtotal_pkr integer NOT NULL,
  delivery_fee integer DEFAULT 0,
  total_pkr integer NOT NULL,
  payment text DEFAULT 'COD',
  status text DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Reviews Table
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Setup RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Categories: anyone can read
CREATE POLICY "Categories are readable by everyone." 
  ON categories FOR SELECT USING (true);

-- Products: anyone can read, only service role can insert/update/delete
CREATE POLICY "Products are readable by everyone." 
  ON products FOR SELECT USING (true);
-- (Using Supabase service_role ignores RLS, so no specific policy needed for writes beyond denying anon)
CREATE POLICY "Disable insert for anon" ON products FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Disable update for anon" ON products FOR UPDATE TO anon USING (false);
CREATE POLICY "Disable delete for anon" ON products FOR DELETE TO anon USING (false);

-- Orders: only service role can read/write (customer never reads orders directly)
CREATE POLICY "Disable read for anon" ON orders FOR SELECT TO anon USING (false);
CREATE POLICY "Disable insert for anon" ON orders FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Disable update for anon" ON orders FOR UPDATE TO anon USING (false);
CREATE POLICY "Disable delete for anon" ON orders FOR DELETE TO anon USING (false);

-- Reviews: anyone can read approved ones, anyone can insert
CREATE POLICY "Approved reviews are readable by everyone." 
  ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can insert reviews." 
  ON reviews FOR INSERT WITH CHECK (true);

-- Seed Data (Categories)
INSERT INTO categories (name, slug) VALUES 
  ('Living Room', 'living-room'),
  ('Bedroom', 'bedroom'),
  ('Office', 'office'),
  ('Dining', 'dining')
ON CONFLICT (slug) DO NOTHING;

-- Seed Data (Products)
INSERT INTO products (name, name_urdu, slug, description, price_pkr, sale_price, category, material, stock_qty) VALUES
  ('Sheesham Sofa Set 3 Seater', 'سیشم سوفہ سیٹ', 'sheesham-sofa-set-3-seater', 'Premium 3 seater sofa built with pure sheesham wood.', 45000, 39000, 'living-room', 'sheesham', 10),
  ('Modern Dining Table 6 Seater', 'ماڈرن ڈائننگ ٹیبل', 'modern-dining-table-6-seater', 'Sleek dining table with glass top and wooden legs.', 65000, 60000, 'dining', 'wood and glass', 5)
ON CONFLICT (slug) DO NOTHING;
