import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h'
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'skr_admin_token'

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

    console.log(`[Admin Login] Authenticated with Supabase Auth: ${authData.user.id}`)

    // 2. Find admin user in our table
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .ilike('email', email.trim())
      .single()

    if (adminError) {
      console.error('[Admin Login] Supabase Query Error:', adminError)
    }

    if (!adminUser) {
      console.log(`[Admin Login] Record not found in admin_users for: ${email.trim()}`)
      return res.status(403).json({ error: 'No admin account found for this email' })
    }

    console.log(`[Admin Login] Found admin record for: ${adminUser.email} (ID: ${adminUser.id})`)

    // 3. Link Supabase ID if not already linked
    if (!adminUser.supabase_user_id) {
      console.log(`[Admin Login] Linking Supabase ID ${authData.user.id} to admin ${adminUser.id}`)
      await supabaseAdmin
        .from('admin_users')
        .update({ supabase_user_id: authData.user.id })
        .eq('id', adminUser.id)
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
      secure: true, // Always true for cross-site cookies
      sameSite: 'none', // Required for cross-site cookies (Vercel to Railway)
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    })

    return res.json({
      message: 'Login successful',
      token, // Send token to frontend
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
    // Check if admin exists (case-insensitive)
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, name')
      .ilike('email', email.trim())
      .single()

    if (adminError || !admin) {
      console.log(`[Forgot Password] Admin not found for email: ${email.trim()}`)
      // We still return success to prevent email enumeration
      return res.json({ message: 'If an account exists for this email, you will receive a reset link shortly.' })
    }

    console.log(`[Forgot Password] Generating recovery link for: ${admin.email}`)
    
    // Get live FRONTEND_URL from environment with failsafe
    let frontendUrl = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'
    
    // Failsafe for production
    if (process.env.NODE_ENV === 'production' && frontendUrl.includes('localhost')) {
      frontendUrl = 'https://shopkarro.com'
    }

    console.log(`[Forgot Password] Using Frontend URL for Reset: ${frontendUrl}`)

    // 1. Generate a recovery link via Supabase Admin (bypasses Supabase SMTP)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: admin.email,
      options: { redirectTo: `${frontendUrl}/admin/reset-password` }
    })

    if (linkError) {
      console.error('[Forgot Password] Link Generation Error:', linkError)
      throw linkError
    }

    console.log(`[Forgot Password] Sending email via Resend to: ${admin.email}`)

    // 2. Send the link via Resend API
    const { error: resendError } = await resend.emails.send({
      from: 'Shopkarro Security <onboarding@resend.dev>',
      to: admin.email,
      subject: 'Shopkarro Admin: Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
          <h2 style="color: #1a1a1a;">Password Reset Requested</h2>
          <p>Hello ${admin.name || 'Admin'},</p>
          <p>A password reset was requested for your administrative account at Shopkarro.</p>
          <p>If you did not make this request, you can safely ignore this email. Otherwise, click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${linkData.properties.action_link}" style="background-color: #783A3A; color: white; padding: 14px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 13px;">This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Shopkarro Administrative Protocol</p>
        </div>
      `
    })

    if (resendError) {
      console.error('[Forgot Password] Resend API Error:', resendError)
      throw resendError
    }

    console.log(`[Forgot Password] Success: Reset email sent to ${admin.email}`)

    return res.json({ message: 'If an account exists for this email, you will receive a reset link shortly.' })
  } catch (err) {
    console.error('Forgot Password Error:', err)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}
