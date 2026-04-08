-- 008_wishlists.sql
-- Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wishlist"
    ON public.wishlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own wishlist"
    ON public.wishlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
    ON public.wishlists FOR DELETE
    USING (auth.uid() = user_id);
