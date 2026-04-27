import { z } from 'zod'

/**
 * 📦 Product Schema
 */
export const productSchema = z.object({
  name: z.string().min(3, 'Name is too short').max(100),
  slug: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().url('Invalid image URL').optional().nullable(),
  stock: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional()
})

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
