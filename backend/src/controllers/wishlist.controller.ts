import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_id } = req.body;
    const user_id = (req as any).user?.id; // set by requireAuth middleware

    if (!user_id || !product_id) {
      res.status(400).json({ error: 'Missing requirements' });
      return;
    }

    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // Dislike (delete)
      const { error: deleteError } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', existing.id);
        
      if (deleteError) throw deleteError;
      
      res.status(200).json({ data: { status: 'removed', product_id } });
      return;
    } else {
      // Like (insert)
      const { error: insertError } = await supabase
        .from('wishlists')
        .insert({ user_id, product_id });

      if (insertError) throw insertError;

      res.status(201).json({ data: { status: 'added', product_id } });
      return;
    }
  } catch (error: any) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle like' });
  }
};

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = (req as any).user?.id;

    if (!user_id) {
       res.status(401).json({ error: 'Unauthorized' });
       return;
    }

    // Get liked products along with full product details
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        product_id,
        products (
          id,
          name,
          slug,
          description,
          price_pkr,
          sale_price,
          stock_qty,
          category,
          images,
          created_at
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ data });
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: error.message || 'Failed to get wishlist' });
  }
};
