import { createAdminClient } from '@/lib/supabase/admin'

export type AnalyticsData = {
  // Revenue
  totalRevenue: number
  revenueThisMonth: number
  revenueLastMonth: number
  revenueGrowthPercent: number

  // Orders
  totalOrders: number
  ordersThisMonth: number
  ordersLastMonth: number
  orderGrowthPercent: number
  ordersByStatus: { status: string; count: number }[]

  // Average Order Value
  avgOrderValue: number
  avgOrderValueThisMonth: number

  // Customers
  totalCustomers: number
  newCustomersThisMonth: number
  recurringCustomers: number

  // Draft / Abandoned
  totalDraftOrders: number
  draftOrdersValue: number
  cartAbandonmentRate: number // drafts / (drafts + completed orders) * 100

  // Top Products
  topProducts: {
    product_id: string
    name: string
    image_url: string
    total_sold: number
    total_revenue: number
  }[]

  // Revenue Over Time (last 30 days)
  revenueByDay: { date: string; revenue: number; orders: number }[]

  // Orders by Month (last 6 months)
  ordersByMonth: { month: string; orders: number; revenue: number }[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const admin = createAdminClient()

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  // ── All orders ──────────────────────────────────────────────────
  const { data: allOrders } = await admin
    .from('orders')
    .select('id, user_id, total_pkr, status, created_at, items')
    .not('status', 'eq', 'cancelled')
    .order('created_at', { ascending: false })

  const orders = (allOrders as any[]) ?? []
  const deliveredOrders = orders.filter(o => o.status === 'delivered')

  // Revenue (using total_pkr)
  const totalRevenue = deliveredOrders.reduce((s, o) => s + (o.total_pkr ?? 0), 0)
  const thisMonthDelivered = deliveredOrders.filter(o => o.created_at >= startOfThisMonth)
  const lastMonthDelivered = deliveredOrders.filter(o =>
    o.created_at >= startOfLastMonth && o.created_at <= endOfLastMonth
  )
  const revenueThisMonth = thisMonthDelivered.reduce((s, o) => s + (o.total_pkr ?? 0), 0)
  const revenueLastMonth = lastMonthDelivered.reduce((s, o) => s + (o.total_pkr ?? 0), 0)
  const revenueGrowthPercent = revenueLastMonth > 0
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : 0

  // Orders count
  const totalOrders = orders.length
  const ordersThisMonth = orders.filter(o => o.created_at >= startOfThisMonth).length
  const ordersLastMonth = orders.filter(o =>
    o.created_at >= startOfLastMonth && o.created_at <= endOfLastMonth
  ).length
  const orderGrowthPercent = ordersLastMonth > 0
    ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100) : 0

  // Orders by status
  const statusMap: Record<string, number> = {}
  for (const o of orders) {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1
  }
  const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

  // AOV
  const avgOrderValue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0
  const avgOrderValueThisMonth = thisMonthDelivered.length > 0
    ? Math.round(revenueThisMonth / thisMonthDelivered.length) : 0

  // Customers (user_id lookup)
  const uniqueUserIds = new Set(orders.map(o => o.user_id).filter(Boolean))
  const totalCustomers = uniqueUserIds.size
  const newThisMonth = new Set(
    orders.filter(o => o.created_at >= startOfThisMonth).map(o => o.user_id).filter(Boolean)
  ).size
  const userOrderCount: Record<string, number> = {}
  for (const o of orders) {
    if (o.user_id) userOrderCount[o.user_id] = (userOrderCount[o.user_id] ?? 0) + 1
  }
  const recurringCustomers = Object.values(userOrderCount).filter(c => c >= 2).length

  // Draft orders (draft_orders table)
  const { data: drafts } = await admin
    .from('draft_orders')
    .select('cart_total')
    .eq('is_recovered', false)
  const totalDraftOrders = drafts?.length ?? 0
  const draftOrdersValue = drafts?.reduce((s, d) => s + (d.cart_total ?? 0), 0) ?? 0
  const cartAbandonmentRate = totalDraftOrders + totalOrders > 0
    ? Math.round((totalDraftOrders / (totalDraftOrders + totalOrders)) * 100) : 0

  // Top products (parsing items JSONB)
  const productMap: Record<string, { name: string; image_url: string; total_sold: number; total_revenue: number }> = {}
  for (const order of orders) {
    const items: any[] = order.items ?? []
    for (const item of items) {
      const price = item.sale_price ?? item.price_pkr ?? 0
      const id = item.id || item.product_id
      if (!id) continue
      
      if (!productMap[id]) {
        productMap[id] = { 
          name: item.name, 
          image_url: item.images?.[0] || item.image || '', 
          total_sold: 0, 
          total_revenue: 0 
        }
      }
      productMap[id].total_sold += (item.quantity || 0)
      productMap[id].total_revenue += (price * (item.quantity || 0))
    }
  }
  const topProducts = Object.entries(productMap)
    .map(([product_id, v]) => ({ product_id, ...v }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5)

  // Revenue by day (last 30 days)
  const dayMap: Record<string, { revenue: number; orders: number }> = {}
  const recentOrders = orders.filter(o => o.created_at >= thirtyDaysAgo)
  for (const o of recentOrders) {
    const day = o.created_at.slice(0, 10)
    if (!dayMap[day]) dayMap[day] = { revenue: 0, orders: 0 }
    dayMap[day].revenue += o.total_pkr ?? 0
    dayMap[day].orders += 1
  }
  const revenueByDay = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, ...(dayMap[key] ?? { revenue: 0, orders: 0 }) }
  })

  // Orders by month (last 6 months)
  const monthMap: Record<string, { orders: number; revenue: number }> = {}
  const recentMonthOrders = orders.filter(o => o.created_at >= sixMonthsAgo)
  for (const o of recentMonthOrders) {
    const key = o.created_at.slice(0, 7) // YYYY-MM
    if (!monthMap[key]) monthMap[key] = { orders: 0, revenue: 0 }
    monthMap[key].orders += 1
    monthMap[key].revenue += o.total_pkr ?? 0
  }
  const ordersByMonth = Object.entries(monthMap)
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    totalRevenue, revenueThisMonth, revenueLastMonth, revenueGrowthPercent,
    totalOrders, ordersThisMonth, ordersLastMonth, orderGrowthPercent,
    ordersByStatus, avgOrderValue, avgOrderValueThisMonth,
    totalCustomers, newCustomersThisMonth: newThisMonth, recurringCustomers,
    totalDraftOrders, draftOrdersValue, cartAbandonmentRate,
    topProducts, revenueByDay, ordersByMonth,
  }
}
