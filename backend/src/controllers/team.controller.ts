import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ROLE_PERMISSIONS: Record<string, any> = {
  superadmin: {
    dashboard_view: true, analytics_view: true, orders_view: true, orders_create: true, 
    orders_duplicate: true, orders_status_update: true, orders_export: true, 
    products_view: true, products_create: true, products_edit: true, products_delete: true, 
    categories_manage: true, banners_manage: true, promotions_manage: true, 
    reviews_manage: true, team_view: true, team_manage: true
  },
  manager: {
    dashboard_view: true, analytics_view: true, orders_view: true, orders_create: true, 
    orders_duplicate: true, orders_status_update: true, orders_export: true, 
    products_view: true, products_create: true, products_edit: true, products_delete: false, 
    categories_manage: true, banners_manage: true, promotions_manage: true, 
    reviews_manage: true, team_view: true, team_manage: false
  },
  staff: {
    dashboard_view: true, analytics_view: false, orders_view: true, orders_create: true, 
    orders_duplicate: false, orders_status_update: true, orders_export: false, 
    products_view: true, products_create: false, products_edit: false, products_delete: false, 
    categories_manage: false, banners_manage: false, promotions_manage: false, 
    reviews_manage: false, team_view: false, team_manage: false
  }
}

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json({ data })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export const inviteTeamMember = async (req: Request, res: Response) => {
  const { email, name, role, permissions: customPermissions } = req.body

  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Email, name and role are required' })
  }

  try {
    // 1. Check if exists
    const { data: existing } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email.trim())
      .single()

    if (existing) {
      return res.status(400).json({ error: 'A team member with this email already exists' })
    }

    // 2. Create Supabase Auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (authError) throw authError

    // 3. Prepare permissions
    const permissions = role === 'custom' ? customPermissions : ROLE_PERMISSIONS[role]

    // 4. Insert into admin_users
    const { data: newAdmin, error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        supabase_user_id: authUser.user.id,
        email: email.trim(),
        name,
        role,
        permissions,
        created_by: (req as any).adminUser.id
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Auto-send invite email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://shopkarro.com'
      
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: email.trim(),
        options: {
          redirectTo: `${frontendUrl}/admin/reset-password`
        }
      })

      const inviteLink = linkData?.properties?.action_link

      if (inviteLink) {
        await resend.emails.send({
          from: 'Shopkarro Admin <onboarding@resend.dev>',
          to: email.trim(),
          subject: `You've been invited to Shopkarro Admin Panel`,
          html: `
            <div style="max-width:600px;margin:40px auto;font-family:sans-serif;">
              <div style="background:#1C1410;padding:32px 40px;">
                <h1 style="color:#fff;font-size:24px;margin:0;">Shopkarro</h1>
                <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:8px 0 0;letter-spacing:3px;text-transform:uppercase;">Admin Panel Invitation</p>
              </div>
              <div style="padding:40px;background:#fff;border:1px solid #E8E2D9;">
                <h2 style="color:#1C1410;font-size:20px;margin:0 0 16px;">Hi ${name},</h2>
                <p style="color:#6B6058;font-size:15px;line-height:1.6;">
                  You have been invited to join the Shopkarro admin panel as <strong>${role}</strong>.
                </p>
                <p style="color:#6B6058;font-size:15px;line-height:1.6;">
                  Click the button below to set your password and activate your account.
                  This link expires in 24 hours.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${inviteLink}" 
                     style="background:#4A2C6E;color:#fff;padding:14px 36px;
                     text-decoration:none;font-size:14px;font-weight:700;
                     letter-spacing:1px;text-transform:uppercase;">
                    Activate Account
                  </a>
                </div>
                <p style="color:#A89890;font-size:12px;">
                  If you did not expect this invitation, you can safely ignore this email.
                </p>
              </div>
              <div style="padding:20px 40px;text-align:center;">
                <p style="color:#A89890;font-size:11px;">© 2025 Shopkarro Admin System</p>
              </div>
            </div>
          `
        })
        console.log(`Invite email sent to ${email}`)
      }
    } catch (emailErr) {
      console.error('Invite email failed:', emailErr)
      // Don't fail the invite if email fails — user is already created
    }

    return res.status(201).json({ 
      data: newAdmin,
      message: 'Team member invited successfully. An email has been sent.'
    })
  } catch (err: any) {
    console.error('Invite Error:', err)
    return res.status(500).json({ error: err.message })
  }
}

export const updateTeamMember = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, role, permissions: customPermissions, is_active } = req.body

  try {
    const { data: targetAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()

    if (!targetAdmin) return res.status(404).json({ error: 'Member not found' })

    // RBAC Guard: Cannot deactivate only superadmin
    if (is_active === false && targetAdmin.role === 'superadmin') {
      const { count } = await supabaseAdmin
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'superadmin')
        .eq('is_active', true)

      if (count && count <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the only active superadmin' })
      }
    }

    const permissions = role === 'custom' ? customPermissions : (ROLE_PERMISSIONS[role] || targetAdmin.permissions)

    const { data: updated, error } = await supabaseAdmin
      .from('admin_users')
      .update({ name, role, permissions, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.json({ data: updated })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export const resendInvite = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const { data: admin } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()

    if (!admin) return res.status(404).json({ error: 'Member not found' })

    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: admin.email,
      options: { redirectTo: `${frontendUrl}/admin/reset-password` }
    })

    if (error) throw error

    // Send via Resend
    await resend.emails.send({
      from: 'Shopkarro Registry <onboarding@resend.dev>', // In prod use verified domain
      to: admin.email,
      subject: 'Administrative Access: Action Required',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee;">
          <h2 style="color: #1a1a1a;">Internal Registry Invitation</h2>
          <p>Hello ${admin.name},</p>
          <p>You have been granted <strong>${admin.role.toUpperCase()}</strong> access to the Shopkarro Administrative Panel.</p>
          <p>To finalize your setup and unseal your account, please click the button below to set your security code:</p>
          <div style="margin: 30px 0;">
            <a href="${data.properties.action_link}" style="background-color: #783A3A; color: white; padding: 14px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Finalize Registry Access</a>
          </div>
          <p style="color: #666; font-size: 13px;">This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Shopkarro Administrative Protocol</p>
        </div>
      `
    })

    return res.json({ message: 'Invitation resent successfully' })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export const deleteTeamMember = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Get the team member first
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !member) {
      return res.status(404).json({ error: 'Team member not found' })
    }

    // Prevent deleting yourself
    if (member.id === (req as any).adminUser.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }

    // Delete from admin_users table
    const { error: deleteError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Also delete from Supabase Auth
    if (member.supabase_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(member.supabase_user_id)
    }

    return res.status(200).json({ message: 'Team member deleted successfully' })
  } catch (err: any) {
    console.error('Delete team member error:', err)
    return res.status(500).json({ error: err.message })
  }
}
