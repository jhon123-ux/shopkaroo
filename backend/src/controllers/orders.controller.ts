import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { Resend } from 'resend'
import { orderConfirmationTemplate, orderStatusTemplate } from '../lib/emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 🏺 Administrative Messaging Protocol
 */
const SENDER_EMAIL = 'Shopkarro Orders <orders@shopkarro.com>'
const ADMIN_CC = 'shopkarro.ecom@gmail.com'

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { data, count, error } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return res.json({ data: data || [], count: count || 0 })
  } catch (error: any) {
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

    if (error) return res.status(404).json({ error: 'Order not found' })
    return res.json({ data: order })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * 🛒 standard Website Checkout
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer_name, customer_email, user_id, phone, city, address, notes, items,
      subtotal_pkr, delivery_fee, total_pkr
    } = req.body

    if (!/^03[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone', message: 'Use format 03XXXXXXXXX' })
    }

    const year = new Date().getFullYear()
    const { count } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
    const orderNumber = `SKR-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber, customer_name, customer_email: customer_email || null,
        user_id: user_id || null, phone, city, address, notes, items,
        subtotal_pkr, delivery_fee: delivery_fee || 0, total_pkr,
        payment: 'COD', status: 'pending'
      })
      .select().single()

    if (error) throw error

    if (customer_email && customer_email.includes('@')) {
      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: customer_email,
          cc: [ADMIN_CC],
          subject: `Your Order is Confirmed — ${orderNumber} | Shopkarro`,
          html: orderConfirmationTemplate({
            order_number: orderNumber, customer_name, customer_email, city,
            items: items.map((item: any) => ({ ...item, image_url: item.images?.[0] || null })),
            total_pkr, delivery_fee: delivery_fee || 0
          })
        })
      } catch (err) {}
    }

    return res.status(201).json({ data: order })
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create order', message: error.message })
  }
}

/**
 * 🏭 Phase 2A: Create Order via Administrative Panel
 */
export const adminCreateOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer, items, pricing, payment_method = "COD", status = "pending",
      internal_note, send_email = false, order_source = "admin_manual"
    } = req.body

    if (!customer?.name || !customer?.phone || !customer?.city || !customer?.address) {
      return res.status(400).json({ error: 'Customer name, phone, city, and address are required' })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' })
    }

    const enrichedItems = []
    let subtotal = 0

    for (const item of items) {
      const { data: product, error: pErr } = await supabaseAdmin
        .from('products')
        .select('name, price_pkr, images')
        .eq('id', item.product_id)
        .single()

      if (pErr || !product) {
        return res.status(404).json({ error: `Product ${item.product_id} not found` })
      }

      const price = item.override_price ?? product.price_pkr
      const lineTotal = price * item.quantity
      enrichedItems.push({
        product_id: item.product_id, name: product.name, price, quantity: item.quantity,
        subtotal: lineTotal, image_url: product.images?.[0] || null
      })
      subtotal += lineTotal
    }

    const discount = pricing?.discount_amount || 0
    const delivery = pricing?.delivery_charge || 0
    const total = subtotal - discount + delivery

    const year = new Date().getFullYear()
    const { count } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
    const orderNumber = `SKR-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    const { data: order, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber, customer_name: customer.name, phone: customer.phone,
        customer_email: customer.email || null, city: customer.city, address: customer.address,
        user_id: customer.user_id || null, items: enrichedItems,
        subtotal_pkr: subtotal, delivery_fee: delivery, total_pkr: total,
        discount_amount: discount, payment: payment_method, status,
        notes: internal_note, order_source, created_by: 'admin'
      })
      .select().single()

    if (insertError) throw insertError

    // Optional table insertions
    try {
      await supabaseAdmin.from('order_items').insert(enrichedItems.map(item => ({
        order_id: order.id, product_id: item.product_id, product_name: item.name,
        product_image: item.image_url, quantity: item.quantity, price: item.price, subtotal: item.subtotal
      })))
    } catch (e) {}

    try {
      await supabaseAdmin.from('order_status_history').insert({
        order_id: order.id, status: 'pending', note: 'Order created manually by admin', created_at: new Date().toISOString()
      })
    } catch (e) {}

    if (send_email && customer.email) {
      try {
        await resend.emails.send({
          from: SENDER_EMAIL, to: customer.email, cc: [ADMIN_CC],
          subject: `Your Order is Confirmed — ${orderNumber} | Shopkarro`,
          html: orderConfirmationTemplate({
            order_number: orderNumber, customer_name: customer.name, customer_email: customer.email,
            city: customer.city, items: enrichedItems, total_pkr: total, delivery_fee: delivery
          })
        })
      } catch (err) {}
    }

    return res.status(201).json({ success: true, order_id: order.id, order })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * 🧬 Phase 2B: Build Duplicate Order Draft
 */
export const adminDuplicateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data: sourceOrder, error: oErr } = await supabaseAdmin.from('orders').select('*').eq('id', id).single()
    if (oErr || !sourceOrder) return res.status(404).json({ error: 'Source order not found' })

    const sourceItems = Array.isArray(sourceOrder.items) ? sourceOrder.items : []
    const draftItems = []
    const warnings = []

    for (const item of sourceItems) {
      const { data: currentProduct } = await supabaseAdmin.from('products').select('name, price_pkr, images, stock_qty').eq('id', item.product_id).single()
      const exists = !!currentProduct
      const currentPrice = currentProduct?.price_pkr || 0
      const priceChanged = exists && item.price !== currentPrice

      if (!exists) {
        warnings.push(`Product no longer available: ${item.name || item.product_id}`)
      } else {
        if (priceChanged) warnings.push(`Price changed for ${item.name}: Original Rs ${item.price} → Current Rs ${currentPrice}`)
        if (currentProduct.stock_qty === 0) warnings.push(`Out of stock: ${item.name}`)
      }

      draftItems.push({
        product_id: item.product_id, product_name: currentProduct?.name || item.name,
        product_image: currentProduct?.images?.[0] || item.product_image || null,
        quantity: item.quantity, original_price: item.price, current_price: currentPrice,
        price_changed: priceChanged, stock_available: currentProduct?.stock_qty || 0, product_exists: exists
      })
    }

    if (['cancelled', 'refunded'].includes(sourceOrder.status)) {
      warnings.push(`Source order was ${sourceOrder.status} — please review before confirming`)
    }

    const draft = {
      customer: { name: sourceOrder.customer_name, phone: sourceOrder.phone, email: sourceOrder.customer_email || '', city: sourceOrder.city, address: sourceOrder.address, user_id: sourceOrder.user_id },
      items: draftItems, pricing: { discount_amount: sourceOrder.discount_amount || 0, delivery_charge: sourceOrder.delivery_fee || 0 },
      payment_method: sourceOrder.payment || 'COD', source_order_id: sourceOrder.id, source_order_status: sourceOrder.status, warnings
    }
    return res.json({ success: true, draft })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * 🔍 Phase 3: Customer Lookup API
 */
export const adminSearchCustomer = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query
    if (!phone) return res.status(400).json({ error: 'Phone number required' })

    const { data: order, error } = await supabaseAdmin
      .from('orders').select('customer_name, customer_email, city, address, user_id')
      .eq('phone', phone).order('created_at', { ascending: false }).limit(1).single()

    if (error || !order) return res.status(404).json({ error: 'Customer not found' })
    return res.json({ success: true, customer: { name: order.customer_name, email: order.customer_email, city: order.city, address: order.address, user_id: order.user_id } })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status value' })

    const { data: current } = await supabaseAdmin.from('orders').select('*').eq('id', id).single()
    const { data: updated, error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id).select().single()

    if (error) return res.status(500).json({ error: 'Failed to update order' })
    if (current?.status !== status && updated.customer_email) await sendStatusNotifications(updated, status)
    return res.json({ data: updated })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const STATUS_NOTIFICATIONS: Record<string, { title: string, message: string, emoji: string }> = {
  confirmed: { emoji: '✅', title: 'Order Confirmed!', message: "Your order has been confirmed. We'll start preparing it right away." },
  shipped: { emoji: '🚚', title: 'Order Shipped!', message: 'Your order is on its way! Expected delivery in 2-5 business days.' },
  delivered: { emoji: '🎉', title: 'Order Delivered!', message: 'Your order has been delivered! Enjoy your new furniture.' },
  cancelled: { emoji: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled. Contact us on WhatsApp if you have questions.' }
}

const sendStatusNotifications = async (order: any, newStatus: string) => {
  const notif = STATUS_NOTIFICATIONS[newStatus]
  if (!notif) return

  if (order.customer_email) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL, to: order.customer_email, cc: [ADMIN_CC],
        subject: `${notif.emoji} ${notif.title} — ${order.order_number} | Shopkarro`,
        html: orderStatusTemplate({
          order_number: order.order_number, customer_name: order.customer_name, status: newStatus,
          title: notif.title, message: notif.message, emoji: notif.emoji, city: order.city, total_pkr: order.total_pkr, items: order.items || []
        })
      })
    } catch (e: any) {}
  }

  if (order.phone && process.env.CALLMEBOT_API_KEY) {
    try {
      const msg = encodeURIComponent(`${notif.emoji} *Shopkaroo Order Update*\n\nOrder: *${order.order_number}*\nStatus: *${newStatus.toUpperCase()}*\n\n${notif.message}\n\nTrack: shopkarro.com/my-orders`)
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${order.phone}&text=${msg}&apikey=${process.env.CALLMEBOT_API_KEY}`)
    } catch (e: any) {}
  }
}
