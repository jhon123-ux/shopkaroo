import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

export const getOfferBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('offer_banner')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }

    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer banner' })
  }
}

export const updateOfferBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('offer_banner')
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
    res.status(500).json({ error: 'Failed to update offer banner' })
  }
}
