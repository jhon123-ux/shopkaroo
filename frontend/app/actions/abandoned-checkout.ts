'use server'

import { createClient } from '@/lib/supabase/server'

export type CartItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export type AbandonedCheckoutPayload = {
  sessionId: string
  cartItems: CartItem[]
  cartTotal: number
  reachedStep: 'cart' | 'checkout' | 'phone' | 'address'
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerCity?: string
  customerAddress?: string
}

export async function saveAbandonedCheckout(payload: AbandonedCheckoutPayload) {
  const {
    sessionId,
    cartItems,
    cartTotal,
    reachedStep,
    customerName = '',
    customerEmail = '',
    customerPhone = '',
    customerCity = '',
    customerAddress = '',
  } = payload

  if (!sessionId || !cartItems || cartItems.length === 0) {
    return
  }

  const supabase = createClient()
  if (!supabase) return
  
  // Try to get logged-in user (optional — works for guests too)
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('abandoned_checkouts')
    .upsert(
      {
        session_id: sessionId,
        user_id: user?.id ?? null,
        customer_name: customerName || (user?.user_metadata?.full_name ?? ''),
        customer_email: customerEmail || (user?.email ?? ''),
        customer_phone: customerPhone || (user?.user_metadata?.phone ?? ''),
        customer_city: customerCity,
        customer_address: customerAddress,
        cart_items: cartItems,
        cart_total: cartTotal,
        reached_step: reachedStep,
        last_activity_at: new Date().toISOString(),
        is_recovered: false,
      },
      { onConflict: 'session_id' }
    )

  if (error) {
    // We log only the error code and message for server tracking, no PII
    console.error('[ABANDONED] Database error:', error.code)
  }
}

export async function clearAbandonedCheckout(sessionId: string) {
  if (!sessionId) return
  const supabase = createClient()
  if (!supabase) return

  const { error } = await supabase
    .from('abandoned_checkouts')
    .delete()
    .eq('session_id', sessionId)
  
  if (error) {
    console.error('[ABANDONED] Clear error:', error.code)
  }
}
