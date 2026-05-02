import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h'
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'skr_admin_token'
const FRONTEND_URL = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    })

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // 2. Find admin user in our table
    let { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .or(`supabase_user_id.eq.${authData.user.id},email.eq.${email.trim()}`)
      .single()

    if (adminError || !adminUser) {
      return res.status(403).json({ error: 'No admin account found for this email' })
    }

    if (!adminUser.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated' })
    }

    // 3. Update supabase_user_id if missing and last_login_at
    const updates: any = { last_login_at: new Date().toISOString() }
    if (!adminUser.supabase_user_id) {
      updates.supabase_user_id = authData.user.id
    }

    const { data: updatedAdmin } = await supabaseAdmin
      .from('admin_users')
      .update(updates)
      .eq('id', adminUser.id)
      .select()
      .single()
    
    const finalAdmin = updatedAdmin || adminUser

    // 4. Generate JWT
    const token = jwt.sign(
      { 
        adminId: finalAdmin.id, 
        email: finalAdmin.email, 
        role: finalAdmin.role,
        permissions: finalAdmin.permissions 
      },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRY as any }
    )

    // 5. Set cookie
    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    })

    return res.json({
      message: 'Login successful',
      admin: {
        id: finalAdmin.id,
        email: finalAdmin.email,
        name: finalAdmin.name,
        role: finalAdmin.role,
        permissions: finalAdmin.permissions
      }
    })

  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ error: 'Internal server error during authentication' })
  }
}

export const adminLogout = async (req: Request, res: Response) => {
  res.clearCookie(ADMIN_COOKIE_NAME)
  return res.json({ message: 'Logged out successfully' })
}

export const getAdminMe = async (req: Request, res: Response) => {
  const admin = (req as any).adminUser
  return res.json({ admin })
}

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Check if admin exists (security note: we return success regardless)
    const { data: admin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email.trim())
      .single()

    if (admin) {
      await supabaseAdmin.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${FRONTEND_URL}/admin/reset-password`
      })
    }

    return res.json({ message: 'If an account exists for this email, you will receive a reset link shortly.' })
  } catch (err) {
    console.error('Forgot Password Error:', err)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}
