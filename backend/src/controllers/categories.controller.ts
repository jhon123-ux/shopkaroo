import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'

/**
 * 🏛️ Administrative Category Registry Controller
 * --------------------------------------------
 * Handles Public and Administrative access to the 'categories' manifest.
 * Utilizes supabaseAdmin to ensure complete visibility for CMS operations.
 */

export const getCategories = async (req: Request, res: Response) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    const { all, nested } = req.query
    
    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    // Public View: Only active categories
    if (all !== 'true') {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    // If nesting is requested, transform flat list to hierarchy
    if (nested === 'true' && data) {
      const parentCategories = data.filter(cat => !cat.parent_id)
      const subCategories = data.filter(cat => cat.parent_id)
      
      const hierarchy = parentCategories.map(parent => ({
        ...parent,
        children: subCategories.filter(child => child.parent_id === parent.id)
      }))
      
      return res.json({ data: hierarchy })
    }
    
    return res.json({ data: data || [] })
  } catch (error: any) {
    console.error('Get Categories Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image_url, sort_order, is_active, parent_id } = req.body
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        image_url,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        parent_id
      })
      .select()
      .single()
    
    if (error) throw error
    return res.status(201).json({ data })
  } catch (error: any) {
    console.error('Create Category Error:', JSON.stringify(error), error.message)
    return res.status(500).json({ error: error.message })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return res.json({ data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 1. Fetch category slug first
    const { data: categoryData, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!categoryData) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const { slug } = categoryData

    // 2. Set referencing products category field to null using supabaseAdmin
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ category: null })
      .eq('category', slug)

    if (updateError) throw updateError

    // 3. Run the category delete
    const { data: deletedRows, error } = await supabaseAdmin.from('categories').delete().eq('id', id).select()
    
    if (error) throw error

    if (deletedRows && deletedRows.length > 0) {
      const deletedCat = deletedRows[0]
      const frontendUrl = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'
      const secret = process.env.REVALIDATE_SECRET || 'fallback-revalidate-secret'
      
      const pathsToRevalidate = [
        '/',
        '/categories',
        `/categories/${deletedCat.slug}`
      ]

      pathsToRevalidate.forEach(path => {
        const url = `${frontendUrl.replace(/\/$/, '')}/api/revalidate?secret=${secret}&path=${encodeURIComponent(path)}`
        fetch(url).then(res => {
          if (!res.ok) {
            console.error(`Category revalidation failed for path ${path}: ${res.statusText}`)
          } else {
            console.log(`Category revalidation triggered successfully for path: ${path}`)
          }
        }).catch((err: any) => {
          console.error(`Category revalidation fetch error for path ${path}:`, err.message)
        })
      })
    }

    return res.json({ message: 'Category expunged from registry.' })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export const toggleCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Get current state
    const { data: current } = await supabaseAdmin
      .from('categories')
      .select('is_active')
      .eq('id', id)
      .single()
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ is_active: !current?.is_active })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return res.json({ data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
