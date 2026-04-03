-- Add user_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS
  user_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders(user_id);

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY,
  full_name     text,
  phone         text,
  city          text,
  address       text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Update orders RLS
DROP POLICY IF EXISTS "Service role full access" 
  ON orders;

CREATE POLICY "Service role full access orders"
ON orders FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users read own orders by user_id"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users read own orders by email"
ON orders FOR SELECT
USING (
  customer_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Function: link guest orders on signup
CREATE OR REPLACE FUNCTION link_guest_orders()
RETURNS trigger AS $$
BEGIN
  -- Link all orders with matching email to new user
  UPDATE orders
  SET user_id = new.id
  WHERE customer_email = new.email
    AND user_id IS NULL;
  
  -- Create profile
  INSERT INTO profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created
  ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_guest_orders();
