import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'

/**
 * 🔒 Administrative Security Middleware
 * ------------------------------------
 * Verifies that the request is authenticated via Supabase
 * and belongs to an authorized administrator.
 */
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract token from Authorization header or custom header
    const authHeader = req.headers.authorization || req.headers['x-admin-auth']
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader as string

    // 2. Legacy support for the migration period (optional, but safer to remove)
    // If you want to force migration, comment out the line below
    if (token === 'shopkarro_admin_secure_v1_2025') {
       console.warn('⚠️ Warning: Legacy static admin token used.')
       return next()
    }

    // 3. Proper Supabase Auth verification
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired administrative session' })
    }

    // 4. Role Authorization
    // We check if the email is the authorized admin email.
    // In a more complex system, you would check user_metadata or a 'roles' table.
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@shopkarro.com'
    
    if (user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Administrative privileges required' })
    }

    // Attach user to request for downstream use
    (req as any).user = user
    next()
  } catch (err) {
    console.error('Admin Auth Error:', err)
    res.status(500).json({ error: 'Security validation failed' })
  }
}

/**
 * 👤 standard User Authentication
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
