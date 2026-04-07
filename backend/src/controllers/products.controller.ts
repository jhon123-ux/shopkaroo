import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'

export const getProducts = async (req: Request, res: Response) => {
  try {
    let query = supabase.from('products').select('*', { count: 'exact' })
    if (req.query.category && req.query.category !== 'all') {
      query = query.eq('category', req.query.category)
    }

    if (req.query.search) {
      const search = req.query.search as string
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })
    const { data, count, error } = await query
    
    if (error) throw error
    res.json({ data: data || [], count: count || 0 })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('products').insert(req.body).select().single()
    if (error) throw error
    res.status(201).json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('products').update(req.body).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const toggleProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data: product, error: fetchErr } = await supabaseAdmin.from('products').select('is_active').eq('id', id).single()
    if (fetchErr) throw fetchErr

    const { data, error } = await supabaseAdmin.from('products').update({ is_active: !product.is_active }).eq('id', id).select().single()
    if (error) throw error
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
