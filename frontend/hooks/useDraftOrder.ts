'use client'

import { useRef, useCallback } from 'react'
import { upsertDraftOrder, clearDraftOrder } from '@/app/actions/draft-orders'
import useAuthStore from '@/lib/authStore'

export function useDraftOrder() {
  const { user } = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mapItems = useCallback((items: any[]) => {
    return items.map(item => ({
      id: item.id || item.product_id,
      name: item.name,
      price: item.sale_price ?? item.price_pkr,
      quantity: item.quantity,
      image: item.images?.[0] || item.image,
      slug: item.slug
    }))
  }, [])

  /**
   * saveDraftNow - Immediate save (Use for navigation/mounts)
   */
  const saveDraftNow = useCallback(async (items: any[], total: number, step: 'cart' | 'checkout' | 'payment') => {
    if (!user || items.length === 0) return
    
    await upsertDraftOrder({
      cartItems: mapItems(items),
      cartTotal: total,
      reachedStep: step
    })
  }, [user, mapItems])

  /**
   * saveDraft - Debounced save (Use for item quantity changes)
   */
  const saveDraft = useCallback((items: any[], total: number, step: 'cart' | 'checkout' | 'payment') => {
    if (!user || items.length === 0) return

    if (timerRef.current) clearTimeout(timerRef.current)
    
    timerRef.current = setTimeout(() => {
      upsertDraftOrder({
        cartItems: mapItems(items),
        cartTotal: total,
        reachedStep: step
      })
    }, 2000)
  }, [user, mapItems])

  /**
   * removeDraft - Immediate clear (Use for successful order or empty cart)
   */
  const removeDraft = useCallback(async () => {
    if (!user) return
    await clearDraftOrder()
  }, [user])

  return { saveDraft, saveDraftNow, removeDraft }
}
