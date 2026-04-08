-- PHASE: 🏛️ Subcategory Hierarchy Update
-- -----------------------------------------------------------------------------
-- Adds support for nested categories (e.g., Living Room > Sofas)
-- Allows indefinite nesting, although UI will be restricted for performance.

-- 1. Add Parent ID to Categories
ALTER TABLE categories 
ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- 2. Add Index for performance
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- 3. Comment on column for clarity
COMMENT ON COLUMN categories.parent_id IS 'Self-referencing field to enable subcategories within the manifest.';
