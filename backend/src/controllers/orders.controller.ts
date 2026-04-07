import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { Resend } from 'resend'
import { orderConfirmationTemplate, orderStatusTemplate } from '../lib/emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 🏺 Administrative Messaging Protocol
 * -----------------------------------------
 * Fallback: 'Shopkarro <onboarding@resend.dev>'
 * Verified: 'Shopkarro Orders <orders@shopkarro.com>'
 * (Update below once Cloudflare/Resend verification is complete)
 */
const SENDER_EMAIL = 'Shopkarro Orders <orders@shopkarro.com>'
const ADMIN_CC = 'shopkarro.ecom@gmail.com'
const FALLBACK_REPLY_TO = 'shopkarro.ecom@gmail.com'

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { all } = req.query
    
    // Explicitly use supabaseAdmin to bypass RLS for administrative tasks
    const { data, count, error } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return res.json({ 
      data: data || [], 
      count: count || 0 
    })
  } catch (error: any) {
    console.error('Administrative Get Orders Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json({ data: order })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_email,
      user_id,
      phone,
      city,
      address,
      notes,
      items,
      subtotal_pkr,
      delivery_fee,
      total_pkr
    } = req.body

    // Validate phone
    if (!/^03[0-9]{9}$/.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone',
        message: 'Use format 03XXXXXXXXX'
      })
    }

    // Generate order number SKR-YYYY-XXXX
    const year = new Date().getFullYear()
    const { count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    const orderNumber = `SKR-${year}-${String(
      (count || 0) + 1
    ).padStart(4, '0')}`

    // Insert order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email: customer_email || null,
        user_id: user_id || null,
        phone,
        city,
        address,
        notes,
        items,
        subtotal_pkr,
        delivery_fee: delivery_fee || 0,
        total_pkr,
        payment: 'COD',
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Send confirmation email if email provided
    if (customer_email && customer_email.includes('@')) {
      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: customer_email,
          cc: [ADMIN_CC],
          replyTo: 'hello@shopkarro.com',
          subject: `✅ Order Confirmed — ${orderNumber} | Shopkarro`,
          html: orderConfirmationTemplate({
            order_number: orderNumber,
            customer_name,
            customer_email,
            city,
            items,
            total_pkr,
            delivery_fee: delivery_fee || 0
          })
        })
      } catch (emailError: any) {
        console.error('❌ EMAIL SYSTEM ERROR [CONFIRMATION]:')
        console.error('Message:', emailError.message)
        console.error('Context:', { orderNumber, customer_email })
        if (emailError.message.includes('onboarding')) {
          console.warn('⚠️  SANDBOX RESTRICTION: This email can only be sent to verified Resend account owners.')
        }
      }
    }

    return res.status(201).json({ data: order })

  } catch (error: any) {
    console.error('Create order error:', error)
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    // Get current order to check for status change
    const { data: current } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update order' })
    }

    // Explicitly send status notifications if the pipeline status has mutated
    if (current?.status !== status && updated.customer_email) {
      await sendStatusNotifications(updated, status)
    }

    return res.json({ data: updated })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const STATUS_NOTIFICATIONS: Record<string, { title: string, message: string, emoji: string }> = {
  confirmed: {
    emoji: '✅',
    title: 'Order Confirmed!',
    message: "Your order has been confirmed. We'll start preparing it right away."
  },
  shipped: {
    emoji: '🚚',
    title: 'Order Shipped!',
    message: 'Your order is on its way! Expected delivery in 2-5 business days.'
  },
  delivered: {
    emoji: '🎉',
    title: 'Order Delivered!',
    message: 'Your order has been delivered! Enjoy your new furniture.'
  },
  cancelled: {
    emoji: '❌',
    title: 'Order Cancelled',
    message: 'Your order has been cancelled. Contact us on WhatsApp if you have questions.'
  }
}

const sendStatusNotifications = async (order: any, newStatus: string) => {
  const notif = STATUS_NOTIFICATIONS[newStatus]
  if (!notif) return

  // Email Notification Protocol
  if (order.customer_email) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: order.customer_email,
        cc: [ADMIN_CC],
        subject: `${notif.emoji} ${notif.title} — ${order.order_number} | Shopkarro`,
        html: orderStatusTemplate({
          order_number: order.order_number,
          customer_name: order.customer_name,
          status: newStatus,
          title: notif.title,
          message: notif.message,
          emoji: notif.emoji,
          city: order.city,
          total_pkr: order.total_pkr,
          items: order.items || []
        })
      })
    } catch (e: any) {
      console.error('❌ EMAIL SYSTEM ERROR [STATUS_UPDATE]:')
      console.error('Message:', e.message)
      if (e.message.includes('onboarding')) {
        console.warn('⚠️  SANDBOX RESTRICTION active for status notifications.')
      }
    }
  }

  // WhatsApp Notification (CallMeBot)
  if (order.phone && process.env.CALLMEBOT_API_KEY) {
    try {
      const msg = encodeURIComponent(
        `${notif.emoji} *Shopkaroo Order Update*\n\n` +
        `Order: *${order.order_number}*\n` +
        `Status: *${newStatus.toUpperCase()}*\n\n` +
        `${notif.message}\n\n` +
        `Track: shopkarro.com/my-orders`
      )
      
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${order.phone}&text=${msg}&apikey=${process.env.CALLMEBOT_API_KEY}`
      )
    } catch (e: any) {
      console.error('WhatsApp notify error:', e.message)
    }
  }
}
