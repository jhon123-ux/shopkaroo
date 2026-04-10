import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { product_id, limit = 20 } = req.query
    
    // FETCH APPROVED REVIEWS ONLY
    let query = supabase.from('reviews').select('*')
      .eq('is_approved', true) 
      .order('created_at', { ascending: false })
      .limit(Number(limit))

    if (product_id) {
       query = query.eq('product_id', product_id)
    }

    const { data, error } = await query
    
    if (error) throw error
    res.json({ data: data || [] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createReview = async (req: Request, res: Response) => {
  try {
    const { product_id, name, rating, comment } = req.body
    
    // Server-side validation
    if (!product_id || !name || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const { data, error } = await supabase.from('reviews').insert({
      product_id,
      name,
      rating,
      comment,
      is_approved: null // Pending by default
    }).select().single()
    
    if (error) throw error
    res.status(201).json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Add Admin review management
export const getAllReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews').select(`
      *,
      products (name)
    `).order('created_at', { ascending: false })
    
    if (error) throw error
    res.json({ data: data || [] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { is_approved } = req.body
    
    const { data, error } = await supabaseAdmin.from('reviews')
      .update({ is_approved })
      .eq('id', id)
      .select().single()
      
    if (error) throw error
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const approveReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin.from('reviews')
      .update({ is_approved: true })
      .eq('id', id)
      .select().single()
      
    if (error) throw error
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const rejectReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin.from('reviews')
      .update({ is_approved: false }) // FALSE = Rejected
      .eq('id', id)
      .select().single()
      
    if (error) throw error
    res.json({ message: 'Review rejected', data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id)
    if (error) throw error
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
