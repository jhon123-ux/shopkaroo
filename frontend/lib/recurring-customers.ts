import { createServerClient } from '@/lib/supabase/server'

export type CustomerOrderSummary = {
  user_id: string
  email: string
  full_name: string
  phone: string
  order_count: number
  total_spent: number
  orders: {
    id: string
    created_at: string
    status: string
    total_amount: number
    items_count: number
  }[]
}

// Returns a map of user_id -> CustomerOrderSummary for users with 2+ orders
export async function getRecurringCustomers(): Promise<Map<string, CustomerOrderSummary>> {
  const supabase = createServerClient()
  if (!supabase) return new Map()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      created_at,
      status,
      total_pkr,
      customer_name,
      customer_email,
      phone,
      items
    `)
    .not('user_id', 'is', null)
    .order('created_at', { ascending: false })

  if (error || !orders) {
    console.error('Error fetching recurring customers:', error)
    return new Map()
  }

  // Group by user_id
  const grouped = new Map<string, CustomerOrderSummary>()

  for (const order of (orders as any[])) {
    if (!order.user_id) continue

    if (!grouped.has(order.user_id)) {
      grouped.set(order.user_id, {
        user_id: order.user_id,
        email: order.customer_email ?? 'N/A',
        full_name: order.customer_name ?? 'Anonymous',
        phone: order.phone ?? 'N/A',
        order_count: 0,
        total_spent: 0,
        orders: [],
      })
    }

    const entry = grouped.get(order.user_id)!
    entry.order_count += 1
    entry.total_spent += order.total_pkr ?? 0
    entry.orders.push({
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total_amount: order.total_pkr ?? 0,
      items_count: order.items?.length ?? 0,
    })
  }

  // Filter to only recurring (2+ orders)
  for (const [key, val] of grouped) {
    if (val.order_count < 2) grouped.delete(key)
  }

  return grouped
}
