import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { Resend } from 'resend'
import { orderConfirmationTemplate } from '../lib/emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

export const getOrders = async (req: Request, res: Response) => {
  try {
    let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false })
    const { data, count, error } = await query
    if (error) throw error
    res.json({ data: data || [], count: count || 0 })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data: order, error } = await supabase
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
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    const orderNumber = `SKR-${year}-${String(
      (count || 0) + 1
    ).padStart(4, '0')}`

    // Insert order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email: customer_email || null,
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
          from: 'Shopkaroo <onboarding@resend.dev>',
          to: 'jhoncarter.cedarfinancial@gmail.com',
          replyTo: 'hello@shopkaroo.com',
          subject: `✅ Order Confirmed — ${orderNumber} | Shopkaroo`,
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
        console.log(`Confirmation email sent to ${customer_email}`)
      } catch (emailError) {
        // Don't fail order if email fails
        console.error('Email send failed:', emailError)
      }
    }

    // WhatsApp notification to admin via console
    console.log(`
      🛒 NEW ORDER: ${orderNumber}
      Customer: ${customer_name} (${phone})
      City: ${city}
      Total: Rs. ${total_pkr}
      Items: ${items.length} items
      Email: ${customer_email || 'Not provided'}
    `)

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

    // 1. Only allow status field to be updated
    // 2. Valid status values
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update order' })
    }

    // 3. Return updated order
    return res.json({ data: order })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
