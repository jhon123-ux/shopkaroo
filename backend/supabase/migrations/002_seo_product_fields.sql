-- Migration: Add SEO & rich-content columns to products table

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS opening_paragraph text,
  ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_paragraph text,
  ADD COLUMN IF NOT EXISTS closing_cta text,
  ADD COLUMN IF NOT EXISTS image_alts text[] DEFAULT '{}';
