import { z } from 'zod'

/**
 * 📦 Product Schema
 */
export const productSchema = z.object({
  name: z.string().min(3, 'Name is too short').max(200),
  slug: z.string().min(3),
  description: z.string().optional().nullable(),
  price_pkr: z.number().int().nonnegative('Price must be positive'),
  sale_price: z.number().int().nonnegative().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  material: z.string().optional().nullable(),
  stock_qty: z.number().int().nonnegative().optional().default(0),
  weight_kg: z.number().nonnegative().optional().nullable(),
  dimensions: z.object({
    L: z.number().optional().default(0),
    W: z.number().optional().default(0),
    H: z.number().optional().default(0),
    unit: z.string().optional().default('in')
  }).optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  image_alts: z.array(z.string()).optional().nullable(),
  name_urdu: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  opening_paragraph: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  seo_paragraph: z.string().optional().nullable(),
  closing_cta: z.string().optional().nullable(),
}).passthrough()

/**
 * 📂 Category Schema
 */
export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  image_url: z.string().url().optional().nullable(),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional()
})
