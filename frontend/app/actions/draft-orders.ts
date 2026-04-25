'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveDraftOrder_v2(cartData: {
  userId: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  items: any[]
  total: number
  step: string
}) {
  console.log('🚀 [DRAFT_ACTION] Attempting save for user:', cartData.userId)
  console.log('📦 [DRAFT_ACTION] Items count:', cartData.items?.length)

  const supabase = createClient()
  if (!supabase) {
    console.error('❌ [DRAFT_ACTION] Supabase client initialization failed')
    return { error: 'No client' }
  }

  const { data, error } = await supabase
    .from('draft_orders')
    .upsert({
      user_id: cartData.userId,
      customer_name: cartData.customerName || '',
      customer_email: cartData.customerEmail || '',
      customer_phone: cartData.customerPhone || '',
      cart_items: cartData.items.map((item: any) => ({
        id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url || item.image
      })),
      cart_total: cartData.total,
      reached_step: cartData.step,
      last_activity_at: new Date().toISOString(),
      is_recovered: false
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('❌ [DRAFT_SAVE_ERROR]', error)
    return { error: error.message }
  }

  console.log('✅ [DRAFT_ACTION] Save successful for:', cartData.userId)
  return { success: true }
}

export async function clearDraftOrder_v2(userId: string) {
  const supabase = createClient()
  if (!supabase) return { error: 'No client' }

  const { error } = await supabase
    .from('draft_orders')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('[DRAFT_CLEAR_ERROR]', error)
    return { error: error.message }
  }

  return { success: true }
}
