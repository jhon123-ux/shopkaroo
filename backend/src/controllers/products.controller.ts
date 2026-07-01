import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import jwt from 'jsonwebtoken'

export const getProducts = async (req: Request, res: Response) => {
  try {
    let isAdmin = false
    try {
      const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'skr_admin_token'
      const JWT_SECRET = process.env.JWT_SECRET || 'secret'
      
      let token = req.cookies?.[ADMIN_COOKIE_NAME]
      if (!token) {
        const authHeader = req.headers.authorization || req.headers['x-admin-auth']
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1]
        } else if (typeof authHeader === 'string') {
          token = authHeader
        }
      }

      if (token) {
        const decoded: any = jwt.verify(token, JWT_SECRET)
        if (decoded && decoded.adminId) {
          isAdmin = true
        }
      }
    } catch (err) {
      isAdmin = false
    }

    const limit = parseInt(req.query.limit as string) || 12
    const offset = parseInt(req.query.offset as string) || 0
    const isAll = req.query.all === 'true'

    let query
    if (isAll) {
      query = supabaseAdmin.from('products').select('*', { count: 'exact' })
    } else {
      query = supabaseAdmin.from('products').select(
        'id, name, slug, price_pkr, images, is_active, sale_price, category, material, stock_qty, created_at',
        { count: 'exact' }
      )
    }

    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    // Material filter (partial match, case-insensitive)
    const material = req.query.material as string
    if (material) {
      const materials = material.split(',')
      // Use ilike for partial match on each material
      const materialFilter = materials.map(m => `material.ilike.%${m}%`).join(',')
      query = query.or(materialFilter)
    }

    // Price filter
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price as string) : null
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price as string) : null
    if (minPrice !== null) query = query.gte('price_pkr', minPrice)
    if (maxPrice !== null) query = query.lte('price_pkr', maxPrice)
    
    // Filter by slug (used by product detail page)
    if (req.query.slug) {
      query = query.eq('slug', req.query.slug as string)
    }

    if (req.query.category && req.query.category !== 'all') {
      const categorySlug = req.query.category as string
      
      // Fetch the category and its children slugs
      const { data: catData } = await supabaseAdmin
        .from('categories')
        .select('id, slug')
        .eq('slug', categorySlug)
        .single()
        
      if (catData) {
        const { data: children } = await supabaseAdmin
          .from('categories')
          .select('slug')
          .eq('parent_id', catData.id)
          
        const allSlugs = [catData.slug, ...(children?.map(c => c.slug) || [])]
        query = query.in('category', allSlugs)
      } else {
        query = query.eq('category', categorySlug)
      }
    }

    if (req.query.search) {
      const search = req.query.search as string
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sort handling
    const sort = req.query.sort as string
    if (sort === 'price_asc') query = query.order('price_pkr', { ascending: true })
    else if (sort === 'price_desc') query = query.order('price_pkr', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    if (!isAll || req.query.limit) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, count, error } = await query
    
    if (error) throw error

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
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
    
    if (!data) {
      return res.status(400).json({ error: 'Update failed — no rows affected' })
    }
    
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
