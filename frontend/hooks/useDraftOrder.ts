'use client'

import { useCallback, useRef } from 'react'
import { saveDraftOrder_v2, clearDraftOrder_v2 } from '@/app/actions/draft-orders'
import useAuthStore from '@/lib/authStore'

export type CartItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export function useDraftOrder() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()

  const saveDraft = useCallback((
    items: CartItem[], total: number, step: 'cart' | 'checkout' = 'cart'
  ) => {
    if (!user || !items || items.length === 0) return
    
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      console.log('[DRAFT HOOK] saveDraft firing', items.length, 'items for', user.id)
      saveDraftOrder_v2({
        userId: user.id,
        customerName: user.user_metadata?.full_name || '',
        customerEmail: user.email || '',
        items,
        total,
        step
      })
    }, 2000)
  }, [user])

  const saveDraftNow = useCallback(async (
    items: CartItem[], total: number, step: 'cart' | 'checkout' = 'cart'
  ) => {
    if (!user || !items || items.length === 0) return
    console.log('[DRAFT HOOK] saveDraftNow firing', items.length, 'items')
    await saveDraftOrder_v2({
      userId: user.id,
      customerName: user.user_metadata?.full_name || '',
      customerEmail: user.email || '',
      items,
      total,
      step
    })
  }, [user])

  const removeDraft = useCallback(async () => {
    if (!user) return
    console.log('[DRAFT HOOK] removeDraft firing')
    await clearDraftOrder_v2(user.id)
  }, [user])

  return { saveDraft, saveDraftNow, removeDraft }
}
