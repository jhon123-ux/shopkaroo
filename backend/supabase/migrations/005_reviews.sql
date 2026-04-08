-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read of approved reviews
CREATE POLICY "Allow public read for approved reviews" 
    ON public.reviews FOR SELECT 
    USING (is_approved = true);

-- Allow public to INSERT new reviews
CREATE POLICY "Allow public to insert reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (true);

-- Allow admins (authenticated / service role) to manage reviews
CREATE POLICY "Allow admins to manage reviews" 
    ON public.reviews FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
