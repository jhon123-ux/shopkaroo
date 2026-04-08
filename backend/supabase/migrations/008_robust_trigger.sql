-- ===================================================
-- PRODUCTION SYNC: Shopkaroo Multi-Fix Migration
-- 1. Creates Offer Banner Table (if missing)
-- 2. Performance Indexing for Guest User Tracking
-- 3. Robust Auth Trigger for Signup/Linking
-- ===================================================

-- PART A: Banner System Creation
CREATE TABLE IF NOT EXISTS public.offer_banner (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL DEFAULT 'Up to 30% Off',
  subtitle    text DEFAULT 'On selected bedroom & living room furniture. This week only.',
  badge_text  text DEFAULT 'LIMITED TIME OFFER',
  cta_text    text DEFAULT 'Shop Now',
  cta_link    text DEFAULT '/furniture/living-room',
  end_date    timestamptz NOT NULL,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.offer_banner ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offer_banner' AND policyname = 'Public read active offer') THEN
    CREATE POLICY "Public read active offer" ON public.offer_banner FOR SELECT USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offer_banner' AND policyname = 'Service role full access offer') THEN
    CREATE POLICY "Service role full access offer" ON public.offer_banner FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- PART B: User Auth Reliability & Performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Robust Trigger Function: qualifies public schema, case-insensitive, error isolation
CREATE OR REPLACE FUNCTION public.link_guest_orders()
RETURNS trigger AS $$
BEGIN
  -- 1. LINK GUEST ORDERS (Case-Insensitive)
  BEGIN
    UPDATE public.orders
    SET user_id = new.id
    WHERE LOWER(customer_email) = LOWER(new.email)
      AND user_id IS NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to link guest orders for user %: %', new.id, SQLERRM;
  END;

  -- 2. CREATE PROFILE
  BEGIN
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to create profile for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART C: Trigger Attachment
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_guest_orders();

-- PART D: Seed fallback if table was empty
INSERT INTO public.offer_banner 
(title, subtitle, badge_text, cta_text, cta_link, end_date, is_active)
SELECT 
  'Up to 30% Off',
  'On selected bedroom & living room furniture. This week only.',
  'LIMITED TIME OFFER',
  'Shop Now',
  '/furniture/sale',
  NOW() + INTERVAL '7 days',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.offer_banner WHERE is_active = true);
