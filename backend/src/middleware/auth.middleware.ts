import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'skr_admin_token'

/**
 * 🔒 Administrative Security Middleware (RBAC)
 * -------------------------------------------
 * Verifies the JWT from httpOnly cookie or Authorization header
 * and checks if the admin user is active in the database.
 */
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract token from cookie or Authorization header
    let token = req.cookies?.[ADMIN_COOKIE_NAME]
    
    if (!token) {
      const authHeader = req.headers.authorization || req.headers['x-admin-auth']
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      } else if (typeof authHeader === 'string') {
        token = authHeader
      }
    }


    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // 2. Verify JWT
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired administrative session' })
    }

    // 3. Query admin_users table for every request to catch deactivations
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', decoded.adminId)
      .single()

    if (error || !adminUser) {
      return res.status(401).json({ error: 'Admin account not found' })
    }

    if (!adminUser.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated' })
    }

    // Attach admin user to request
    (req as any).adminUser = adminUser
    next()
  } catch (err) {
    console.error('Admin Auth Error:', err)
    res.status(500).json({ error: 'Security validation failed' })
  }
}

/**
 * 🛡️ Permission Guard Factory
 * --------------------------
 * Checks if the authenticated admin has the required permission.
 * Superadmins bypass all permission checks.
 */
export const requirePermission = (permissionKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).adminUser
    
    if (!admin) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Superadmin bypass
    if (admin.role === 'superadmin') {
      return next()
    }

    // Check permission
    const permissions = admin.permissions || {}
    if (!permissions[permissionKey]) {
      return res.status(403).json({ 
        error: `Access Denied: You do not have the '${permissionKey}' permission required for this action.` 
      })
    }

    next()
  }
}

/**
 * 👤 Standard User Authentication (Optional fallback)
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     return res.status(401).json({ error: 'Missing authorization header' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    
    (req as any).user = user
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token verification failed' })
  }
}
