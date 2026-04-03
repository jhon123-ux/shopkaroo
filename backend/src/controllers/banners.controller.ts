import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { all } = req.query
    
    let query = supabase.from('banners').select('*').order('sort_order', { ascending: true })
    
    // Only fetch active banners unless ?all=true is explicitly requested
    if (all !== 'true') {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' })
  }
}

export const getBannerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase.from('banners').select('*').eq('id', id).single()

    if (error || !data) {
      res.status(404).json({ error: 'Banner not found' })
      return
    }

    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banner' })
  }
}

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .insert([req.body])
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(201).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' })
  }
}

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('banners')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' })
  }
}

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('banners').delete().eq('id', id)

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' })
  }
}

export const toggleBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    // First get current status
    const { data: current, error: fetchErr } = await supabase
      .from('banners')
      .select('is_active')
      .eq('id', id)
      .single()
      
    if (fetchErr || !current) {
      res.status(404).json({ error: 'Banner not found' })
      return
    }

    const { data, error } = await supabase
      .from('banners')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle banner' })
  }
}

export const reorderBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { banners } = req.body // Array of { id, sort_order }
    
    if (!Array.isArray(banners)) {
      res.status(400).json({ error: 'Invalid payload expected array of banners' })
      return
    }

    // Since Supabase RPC requires a custom postgres function for batch updates,
    // we will loop the updates natively in map for this scale. (Typically 3-5 banners).
    const promises = banners.map((b) => 
      supabase.from('banners').update({ sort_order: b.sort_order }).eq('id', b.id)
    )

    await Promise.all(promises)

    res.json({ success: true, message: 'Banners reordered' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder banners' })
  }
}
