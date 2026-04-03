-- 1. Performance: Indexing for fast email lookups on orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_email 
  ON public.orders(customer_email);

-- 2. Robust Trigger Function: explicitly qualified, case-insensitive, and error-tolerant
CREATE OR REPLACE FUNCTION public.link_guest_orders()
RETURNS trigger AS $$
BEGIN
  -- Link all orders with matching email to new user (Case-Insensitive)
  -- If this fails for any reason, notice it but don't stop the signup
  BEGIN
    UPDATE public.orders
    SET user_id = new.id
    WHERE LOWER(customer_email) = LOWER(new.email)
      AND user_id IS NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to link guest orders for user %: %', new.id, SQLERRM;
  END;

  -- Create profile (Ensure it doesn't fail the signup)
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

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_guest_orders();

-- Ensure Banner exists for resilience
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
