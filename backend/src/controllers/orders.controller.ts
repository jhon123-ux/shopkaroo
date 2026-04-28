import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { Resend } from 'resend'
import { orderConfirmationTemplate, orderStatusTemplate } from '../lib/emailTemplates'
const ExcelJS = require('exceljs')

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

/**
 * 📊 Excel Export — Admin Orders
 * GET /api/admin/orders/export/excel
 */
export const exportOrdersExcel = async (req: Request, res: Response) => {
  try {
    const {
      status,
      city,
      startDate,
      endDate,
      search,
      includeItems = 'true',
      includeSummary = 'true',
      columns // NEW: optional comma-separated list of columns
    } = req.query as Record<string, string>

    // ─── STEP 1: Fetch Orders ───────────────────────────────────────────────
    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5000)

    if (status && status !== 'all') {
      const statusList = status.split(',').filter(Boolean)
      if (statusList.length > 1) {
        query = query.in('status', statusList)
      } else {
        query = query.eq('status', statusList[0])
      }
    }
    if (city && city !== 'all') query = query.eq('city', city)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate + 'T23:59:59Z')
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    const { data: orders, count: totalCount, error: ordersError } = await query
    if (ordersError) throw ordersError

    const ordersData: any[] = orders || []
    const exceeded5000 = (totalCount || 0) > 5000

    // Fetch order_items for all fetched orders
    let orderItemsMap: Record<string, any[]> = {}
    if (ordersData.length > 0) {
      const orderIds = ordersData.map((o: any) => o.id)
      const { data: itemsData } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)

      if (itemsData) {
        for (const item of itemsData) {
          if (!orderItemsMap[item.order_id]) orderItemsMap[item.order_id] = []
          orderItemsMap[item.order_id].push(item)
        }
      }
    }

    // ─── STEP 2: Build Workbook ─────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Shopkarro Admin'
    workbook.created = new Date()

    const PLUM = 'FF6B2737'
    const PLUM_DARK = 'FF4A1B22'
    const WHITE = 'FFFFFFFF'
    const ALT_ROW = 'FFF9F7F5'

    const styleHeader = (sheet: any, colCount: number) => {
      sheet.getRow(1).eachCell((cell: any) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM } }
        cell.font = { bold: true, color: { argb: WHITE }, size: 11 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = { bottom: { style: 'thin', color: { argb: PLUM_DARK } } }
      })
      sheet.getRow(1).height = 22
    }

    const getStatusFill = (s: string): string => {
      switch (s) {
        case 'pending':    return 'FFFEF3CD'
        case 'processing': return 'FFD1ECF1'
        case 'confirmed':  return 'FFD1ECF1'
        case 'shipped':    return 'FFCCE5FF'
        case 'delivered':  return 'FFD4EDDA'
        case 'cancelled':  return 'FFF8D7DA'
        case 'refunded':   return 'FFFDE2E2'
        default:           return 'FFEEEEEE'
      }
    }

    const getStatusFontColor = (s: string): string => {
      switch (s) {
        case 'pending':    return 'FF856404'
        case 'processing': return 'FF0C5460'
        case 'confirmed':  return 'FF0C5460'
        case 'shipped':    return 'FF004085'
        case 'delivered':  return 'FF155724'
        case 'cancelled':  return 'FF721C24'
        case 'refunded':   return 'FF842029'
        default:           return 'FF444444'
      }
    }

    const formatDate = (iso: string): string => {
      if (!iso) return ''
      const d = new Date(iso)
      const day = String(d.getDate()).padStart(2, '0')
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const month = months[d.getMonth()]
      const year = d.getFullYear()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `${day} ${month} ${year} ${hh}:${mm}`
    }

    // ─── SHEET 1: Orders ────────────────────────────────────────────────────
    const ordersSheet = workbook.addWorksheet('Orders', {
      views: [{ state: 'frozen', ySplit: 1 }]
    })

    const allColumns = [
      { header: 'Order #',              key: 'order_number',    width: 16, always: true },
      { header: 'Date',                 key: 'created_at',      width: 22, always: true },
      { header: 'Customer Name',        key: 'customer_name',   width: 22, always: true },
      { header: 'Phone',                key: 'customer_phone',  width: 16, always: true },
      { header: 'Email',                key: 'customer_email',  width: 26 },
      { header: 'City',                 key: 'customer_city',   width: 14, always: true },
      { header: 'Delivery Address',     key: 'delivery_address',width: 36 },
      { header: 'Items Count',          key: 'items_count',     width: 12, always: true },
      { header: 'Subtotal (Rs)',        key: 'subtotal',        width: 14, always: true },
      { header: 'Discount (Rs)',        key: 'discount_amount', width: 14, always: true },
      { header: 'Delivery Charge (Rs)', key: 'delivery_charge', width: 18, always: true },
      { header: 'Total (Rs)',           key: 'total',           width: 14, always: true },
      { header: 'Status',              key: 'status',           width: 14, always: true },
      { header: 'Payment Method',      key: 'payment_method',  width: 16, always: true },
      { header: 'Order Source',        key: 'order_source',    width: 16 },
      { header: 'Internal Note',       key: 'internal_note',   width: 30 },
    ]

    let selectedCols = allColumns
    if (columns) {
      const colKeys = columns.toLowerCase().split(',')
      selectedCols = allColumns.filter(c => 
        c.always || colKeys.includes(c.header.toLowerCase()) || colKeys.includes(c.key.toLowerCase())
      )
    }

    ordersSheet.columns = selectedCols.map(({ header, key, width }) => ({ header, key, width }))

    styleHeader(ordersSheet, selectedCols.length)

    ordersSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: selectedCols.length }
    }

    const currencyFmt = '"Rs "#,##0'

    ordersData.forEach((order: any, idx: number) => {
      const items = orderItemsMap[order.id] || []
      // Fall back to order.items array if order_items table is empty
      const itemCount = items.length > 0 ? items.length : (order.items?.length || 0)

      const row = ordersSheet.addRow({
        order_number:    order.order_number || '',
        created_at:      formatDate(order.created_at),
        customer_name:   order.customer_name || '',
        customer_phone:  order.phone || '',
        customer_email:  order.customer_email || '',
        customer_city:   order.city || '',
        delivery_address: order.address || '',
        items_count:     itemCount,
        subtotal:        order.subtotal_pkr || 0,
        discount_amount: order.discount_amount || 0,
        delivery_charge: order.delivery_fee || 0,
        total:           order.total_pkr || 0,
        status:          order.status || '',
        payment_method:  order.payment || 'COD',
        order_source:    order.order_source || 'website',
        internal_note:   order.notes || '',
      })

      // Currency formatting on number cells
      const currencyCols = [9, 10, 11, 12] // subtotal, discount, delivery, total
      currencyCols.forEach(colIdx => {
        row.getCell(colIdx).numFmt = currencyFmt
      })

      // Status cell colour
      const statusCell = row.getCell(13)
      const fillArgb = getStatusFill(order.status)
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } }
      statusCell.font = { bold: true, color: { argb: getStatusFontColor(order.status) }, size: 10 }

      // Alternating row background (even data rows = row index 0-based)
      if (idx % 2 === 0) {
        row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
          if (colNumber !== 13) { // don't overwrite status cell fill
            if (!cell.fill || cell.fill.fgColor?.argb === WHITE || !cell.fill.fgColor) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT_ROW } }
            }
          }
        })
      }
    })

    // ─── SHEET 2: Order Items ───────────────────────────────────────────────
    if (includeItems !== 'false') {
      const itemsSheet = workbook.addWorksheet('Order Items', {
        views: [{ state: 'frozen', ySplit: 1 }]
      })

      itemsSheet.columns = [
        { header: 'Order #',         key: 'order_number',  width: 16 },
        { header: 'Order Date',      key: 'order_date',    width: 22 },
        { header: 'Customer Name',   key: 'customer_name', width: 22 },
        { header: 'City',            key: 'city',          width: 14 },
        { header: 'Order Status',    key: 'order_status',  width: 14 },
        { header: 'Product Name',    key: 'product_name',  width: 36 },
        { header: 'Product ID',      key: 'product_id',    width: 20 },
        { header: 'Quantity',        key: 'quantity',      width: 10 },
        { header: 'Unit Price (Rs)', key: 'price',         width: 16 },
        { header: 'Line Total (Rs)', key: 'line_total',    width: 16 },
      ]

      styleHeader(itemsSheet, 10)

      let itemRowIdx = 0
      ordersData.forEach((order: any) => {
        const dbItems = orderItemsMap[order.id] || []
        const fallbackItems: any[] = order.items || []

        const allItems = dbItems.length > 0 ? dbItems : fallbackItems.map((i: any) => ({
          product_name: i.name || '',
          product_id:   i.product_id || '',
          quantity:     i.quantity || i.qty || 0,
          price:        i.price || i.price_pkr || 0,
          subtotal:     (i.price || i.price_pkr || 0) * (i.quantity || i.qty || 0)
        }))

        allItems.forEach((item: any) => {
          const qty   = item.quantity || item.qty || 0
          const price = item.price || 0
          const lineTotal = item.subtotal || (price * qty)

          const row = itemsSheet.addRow({
            order_number:  order.order_number || '',
            order_date:    formatDate(order.created_at),
            customer_name: order.customer_name || '',
            city:          order.city || '',
            order_status:  order.status || '',
            product_name:  item.product_name || item.name || '',
            product_id:    item.product_id || '',
            quantity:      qty,
            price:         price,
            line_total:    lineTotal,
          })

          row.getCell(9).numFmt  = currencyFmt
          row.getCell(10).numFmt = currencyFmt

          if (itemRowIdx % 2 === 0) {
            row.eachCell({ includeEmpty: true }, (cell: any) => {
              if (!cell.fill || !cell.fill.fgColor) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT_ROW } }
              }
            })
          }
          itemRowIdx++
        })
      })
    }

    // ─── SHEET 3: Summary ───────────────────────────────────────────────────
    if (includeSummary !== 'false') {
      const summarySheet = workbook.addWorksheet('Summary')
      summarySheet.getColumn('A').width = 30
      summarySheet.getColumn('B').width = 24

      // Title row
      summarySheet.mergeCells('A1:B1')
      const titleCell = summarySheet.getCell('A1')
      titleCell.value = 'Shopkarro — Orders Export Summary'
      titleCell.font  = { bold: true, size: 14, color: { argb: WHITE } }
      titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM } }
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
      summarySheet.getRow(1).height = 28

      // Blank separator
      summarySheet.addRow([])

      // ── Pre-compute summary stats ──
      const totalRevenue = ordersData.reduce((acc: number, o: any) => acc + (o.total_pkr || 0), 0)
      const avgOrderValue = ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0

      // Status breakdown
      const statusCounts: Record<string, number> = {}
      ordersData.forEach((o: any) => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
      })

      // City breakdown (top 10)
      const cityCounts: Record<string, number> = {}
      ordersData.forEach((o: any) => {
        if (o.city) cityCounts[o.city] = (cityCounts[o.city] || 0) + 1
      })
      const top10Cities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

      // Total items sold
      let totalItemsSold = 0
      const productQtyMap: Record<string, { name: string; qty: number }> = {}
      ordersData.forEach((o: any) => {
        const dbItems = orderItemsMap[o.id] || []
        const allItems = dbItems.length > 0 ? dbItems : (o.items || [])
        allItems.forEach((item: any) => {
          const qty  = item.quantity || item.qty || 0
          const name = item.product_name || item.name || 'Unknown'
          const pid  = item.product_id || name
          totalItemsSold += qty
          if (!productQtyMap[pid]) productQtyMap[pid] = { name, qty: 0 }
          productQtyMap[pid].qty += qty
        })
      })
      const top5Products = Object.values(productQtyMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)

      const dateRangeLabel = startDate && endDate
        ? `${startDate} to ${endDate}`
        : startDate ? `From ${startDate}` : endDate ? `Until ${endDate}` : 'All time'

      // Helper to add section header
      const addSectionHeader = (label: string) => {
        const row = summarySheet.addRow([label, ''])
        row.eachCell({ includeEmpty: true }, (cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }
          cell.font = { bold: true, size: 11 }
        })
        summarySheet.addRow([])
      }

      let dataRowToggle = false
      const addDataRow = (label: string, value: any, isAmount = false) => {
        const row = summarySheet.addRow([label, value])
        const bg = dataRowToggle ? 'FFFAF9F8' : WHITE
        row.eachCell({ includeEmpty: true }, (cell: any) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        })
        if (isAmount) {
          row.getCell(2).numFmt = currencyFmt
        }
        dataRowToggle = !dataRowToggle
      }

      // Export Info section
      addSectionHeader('Export Info')
      addDataRow('Generated At',     new Date().toLocaleString('en-PK'))
      addDataRow('Date Range',        dateRangeLabel)
      addDataRow('Status Filter',     status || 'All statuses')
      addDataRow('City Filter',       city || 'All cities')
      addDataRow('Total Orders Exported', ordersData.length)
      if (exceeded5000) {
        const warnRow = summarySheet.addRow(['⚠ Warning', `Result capped at 5000. Total matched: ${totalCount}`])
        warnRow.getCell(1).font = { bold: true, color: { argb: 'FFCC0000' } }
        warnRow.getCell(2).font = { color: { argb: 'FFCC0000' } }
      }
      summarySheet.addRow([])

      // Revenue Summary section
      addSectionHeader('Revenue Summary')
      dataRowToggle = false
      addDataRow('Total Revenue (Rs)',   totalRevenue,   true)
      addDataRow('Average Order Value (Rs)', avgOrderValue, true)
      addDataRow('Total Items Sold',     totalItemsSold)
      summarySheet.addRow([])

      // Orders by Status section
      addSectionHeader('Orders by Status')
      dataRowToggle = false
      Object.entries(statusCounts).forEach(([s, c]) => addDataRow(s, c))
      summarySheet.addRow([])

      // Orders by City section
      addSectionHeader('Orders by City (Top 10)')
      dataRowToggle = false
      top10Cities.forEach(([c, n]) => addDataRow(c, n))
      summarySheet.addRow([])

      // Top Products section
      addSectionHeader('Top 5 Products by Quantity')
      dataRowToggle = false
      top5Products.forEach((p, i) => addDataRow(`${i + 1}. ${p.name}`, p.qty))
    }

    // ─── STEP 3: Build filename ─────────────────────────────────────────────
    const ts = new Date().toISOString().slice(0, 10)
    let filename = 'shopkarro-orders'
    if (status && status !== 'all') filename += `-${status}`
    if (startDate && endDate) filename += `-${startDate}-to-${endDate}`
    else if (!status || status === 'all') filename += `-all-${ts}`
    filename += '.xlsx'

    // ─── STEP 4: Stream to response ─────────────────────────────────────────
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache')

    await workbook.xlsx.write(res)
    res.end()
  } catch (err: any) {
    console.error('[EXCEL EXPORT ERROR]', err)
    return res.status(500).json({ error: 'Export failed', message: err.message })
  }
}
