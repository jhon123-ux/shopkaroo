CREATE TABLE banners (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title            text NOT NULL,
  subtitle         text,
  badge_text       text,
  badge_color      text DEFAULT '#6C3FC5',
  cta_primary_text text DEFAULT 'Shop Now',
  cta_primary_link text DEFAULT '/furniture/living-room',
  cta_secondary_text text DEFAULT 'WhatsApp Us',
  cta_secondary_link text DEFAULT 'https://wa.me/923001234567',
  bg_image_url     text,
  bg_overlay       text DEFAULT 'rgba(26,26,46,0.55)',
  sort_order       integer DEFAULT 0,
  is_active        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Anyone can read active banners
CREATE POLICY "Public can read active banners"
ON banners FOR SELECT
USING (is_active = true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role full access"
ON banners FOR ALL
USING (auth.role() = 'service_role');

-- Seed 3 default banners
INSERT INTO banners 
(title, subtitle, badge_text, badge_color, cta_primary_text, 
 cta_primary_link, bg_overlay, sort_order, is_active)
VALUES
(
  'Furnish Your Home With Style',
  'Premium quality furniture delivered to your door. Pay cash on delivery.',
  'New Arrivals 2025',
  '#6C3FC5',
  'Shop Now',
  '/furniture/living-room',
  'rgba(26,26,46,0.50)',
  1,
  true
),
(
  'Up to 30% Off This Week',
  'Biggest sale of the season. Premium furniture at unbeatable prices.',
  'Limited Offer',
  '#DC2626',
  'Shop Sale',
  '/furniture/sale',
  'rgba(220,38,38,0.45)',
  2,
  true
),
(
  'Order Now, Pay When It Arrives',
  'No online payment needed. Shop confidently with Cash on Delivery.',
  'COD Available',
  '#4CAF7D',
  'Start Shopping',
  '/furniture/bedroom',
  'rgba(76,175,125,0.45)',
  3,
  true
);
