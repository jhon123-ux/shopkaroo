-- Admin Users and RBAC System
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id UUID UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('superadmin', 'manager', 'staff', 'custom')),
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES admin_users(id),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
DROP POLICY IF EXISTS "Service role access" ON admin_users;
CREATE POLICY "Service role access" ON admin_users
    FOR ALL
    TO service_role
    USING (true);

-- Seed initial superadmin
-- Email and Name matched from environment setup
INSERT INTO admin_users (email, name, role, permissions, is_active)
VALUES (
    'shopkarro.ecom@gmail.com', 
    'Tabassum Abbas', 
    'superadmin', 
    '{
        "dashboard_view": true, 
        "analytics_view": true, 
        "orders_view": true, 
        "orders_create": true, 
        "orders_duplicate": true, 
        "orders_status_update": true, 
        "orders_export": true, 
        "products_view": true, 
        "products_create": true, 
        "products_edit": true, 
        "products_delete": true, 
        "categories_manage": true, 
        "banners_manage": true, 
        "promotions_manage": true, 
        "reviews_manage": true, 
        "team_view": true, 
        "team_manage": true
    }'::jsonb, 
    true
)
ON CONFLICT (email) DO UPDATE SET 
    role = 'superadmin',
    permissions = EXCLUDED.permissions;
