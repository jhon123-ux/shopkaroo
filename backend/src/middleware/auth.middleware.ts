import { Request, Response, NextFunction } from 'express'

/**
 * Very simple backend middleware to check for a mock API key
 * for administrative write/read operations.
 * In production, you would use JWT or Supabase Auth headers.
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for a custom header sent by the frontend
  const authHeader = req.headers['x-admin-auth']
  
  if (authHeader === 'shopkarro_admin_secure_v1_2025') {
    return next()
  }

  res.status(401).json({ error: 'Unauthorized access' })
}
