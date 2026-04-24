import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * API Route for Draft Saving
 * -----------------------------------------
 * Handles navigation/tab-close triggers via navigator.sendBeacon.
 */
export async function POST(req: Request) {
  try {
    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Client init failed' }, { status: 500 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ message: 'Anonymous guest' }, { status: 200 })

    const body = await req.json()
    const { cartItems, cartTotal, reachedStep } = body

    const admin = createAdminClient()

    const mappedItems = cartItems.map((item: any) => ({
      id: item.id || item.product_id,
      name: item.name,
      price: item.sale_price ?? item.price_pkr,
      quantity: item.quantity,
      image: item.images?.[0] || item.image,
      slug: item.slug
    }))

    const { error } = await admin
      .from('draft_orders')
      .upsert(
        {
          user_id: user.id,
          customer_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
          customer_email: user.email ?? '',
          customer_phone: user.user_metadata?.phone ?? '',
          cart_items: mappedItems,
          cart_total: cartTotal,
          reached_step: reachedStep,
          last_activity_at: new Date().toISOString(),
          is_recovered: false,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Beacon API error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
