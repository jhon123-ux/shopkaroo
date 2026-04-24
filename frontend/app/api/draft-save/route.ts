import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * API Route for Draft Saving
 * -----------------------------------------
 * Handles navigation/tab-close triggers via navigator.sendBeacon.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, cartItems, cartTotal, reachedStep } = body

    if (!userId) {
      return NextResponse.json({ message: 'No userId provided' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: 'Admin client init failed' }, { status: 500 })

    // Try to get user metadata for nicer admin display if possible
    const { data: { user } } = await admin.auth.admin.getUserById(userId)

    const mappedItems = cartItems.map((item: any) => ({
      id: item.id || item.product_id,
      name: item.name,
      price: item.price ?? item.sale_price ?? item.price_pkr,
      quantity: item.quantity,
      image: item.image || item.image_url || item.images?.[0]
    }))

    const { error } = await admin
      .from('draft_orders')
      .upsert(
        {
          user_id: userId,
          customer_name: user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '',
          customer_email: user?.email ?? '',
          customer_phone: user?.user_metadata?.phone ?? '',
          cart_items: mappedItems,
          cart_total: cartTotal,
          reached_step: reachedStep,
          last_activity_at: new Date().toISOString(),
          is_recovered: false,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('[BEACON_SAVE_ERROR]', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Beacon API error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
