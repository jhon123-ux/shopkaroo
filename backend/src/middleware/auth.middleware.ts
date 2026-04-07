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

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     res.status(401).json({ error: 'Missing or malformed authorization header' });
     return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const { supabase } = require('../lib/supabase');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token verification failed' });
  }
}
