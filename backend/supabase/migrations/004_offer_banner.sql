CREATE TABLE offer_banner (
  id          uuid DEFAULT gen_random_uuid() 
              PRIMARY KEY,
  title       text NOT NULL 
              DEFAULT 'Up to 30% Off',
  subtitle    text DEFAULT 'On selected bedroom & living room furniture. This week only.',
  badge_text  text DEFAULT 'LIMITED TIME OFFER',
  cta_text    text DEFAULT 'Shop Now',
  cta_link    text DEFAULT '/furniture/living-room',
  end_date    timestamptz NOT NULL,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE offer_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active offer"
ON offer_banner FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role full access offer"
ON offer_banner FOR ALL
USING (auth.role() = 'service_role');

-- Seed default offer (7 days from now)
INSERT INTO offer_banner 
(title, subtitle, badge_text, cta_text, 
 cta_link, end_date, is_active)
VALUES (
  'Up to 30% Off',
  'On selected bedroom & living room furniture. This week only.',
  'LIMITED TIME OFFER',
  'Shop Now',
  '/furniture/sale',
  NOW() + INTERVAL '7 days',
  true
);
