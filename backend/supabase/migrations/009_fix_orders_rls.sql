-- 1. DROP OLD POLICIES
DROP POLICY IF EXISTS "Users read own orders by user_id" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders by email" ON public.orders;

-- 2. CREATE CONSOLIDATED ROBUST POLICY
-- Uses auth.uid() for linked orders and auth.jwt() for guest email matching
CREATE POLICY "Users read own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  LOWER(customer_email) = LOWER(auth.jwt() ->> 'email')
);

-- 3. ENSURE SERVICE ROLE STILL HAS FULL ACCESS
-- (Check if exist before re-creating)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Service role full access orders') THEN
    CREATE POLICY "Service role full access orders" ON public.orders FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
