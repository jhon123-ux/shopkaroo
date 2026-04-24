'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { supabase as clientSupabase } from '@/lib/supabase' // client or shared instance
import { createServerClient } from '@/lib/supabase/server' 

export type CartItem = {
  id?: string
  name: string
  price: number
  quantity: number
  image?: string
  slug?: string
}

export async function upsertDraftOrder({
  cartItems,
  cartTotal,
  reachedStep,
}: {
  cartItems: CartItem[]
  cartTotal: number
  reachedStep: 'cart' | 'checkout' | 'payment'
}) {
  try {
    // We need to get the user from the session on the server
    const supabase = createServerClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // Only track logged-in users

    const admin = createAdminClient()

    // Upsert: 1 draft per user (onConflict handles the logic)
    const { error } = await admin
      .from('draft_orders')
      .upsert(
        {
          user_id: user.id,
          customer_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
          customer_email: user.email ?? '',
          customer_phone: user.user_metadata?.phone ?? '',
          cart_items: cartItems,
          cart_total: cartTotal,
          reached_step: reachedStep,
          last_activity_at: new Date().toISOString(),
          is_recovered: false,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Draft upsert error:', error)
    }
  } catch (err) {
    console.error('Server error in upsertDraftOrder:', err)
  }
}

export async function clearDraftOrder() {
  try {
    const supabase = createServerClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const admin = createAdminClient()
    await admin.from('draft_orders').delete().eq('user_id', user.id)
  } catch (err) {
    console.error('Error clearing draft order:', err)
  }
}

export async function markDraftRecovered(userId: string, orderId: string) {
  try {
    const admin = createAdminClient()
    await admin
      .from('draft_orders')
      .update({ is_recovered: true, recovered_order_id: orderId })
      .eq('user_id', userId)
  } catch (err) {
    console.error('Error marking draft as recovered:', err)
  }
}
