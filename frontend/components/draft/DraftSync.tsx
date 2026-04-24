'use client'

import { useEffect, useRef } from 'react'
import useAuthStore from '@/lib/authStore'
import useCartStore from '@/lib/cartStore'
import { useDraftOrder } from '@/hooks/useDraftOrder'

import { usePathname } from 'next/navigation'

/**
 * Global Draft Sync Component
 * -----------------------------------------
 * Listens for state changes (Auth/Cart) and ensures the database
 * stays in sync without requiring triggers on every single page.
 */
export default function DraftSync() {
  const { user } = useAuthStore()
  const { items, getTotalPrice } = useCartStore()
  const { saveDraft } = useDraftOrder()
  const pathname = usePathname()
  
  const lastStateString = useRef('')

  useEffect(() => {
    // Only sync if user is logged in and has items
    if (!user || items.length === 0) return

    const step = pathname?.includes('/checkout') ? 'checkout' : 'cart'
    const stateString = JSON.stringify({ items, step })
    
    if (stateString === lastStateString.current) return
    lastStateString.current = stateString

    // Debounced save
    const mappedItems = items.map(item => ({
      product_id: item.id,
      name: item.name,
      price: item.sale_price ?? item.price_pkr,
      quantity: item.quantity,
      image_url: item.images?.[0]
    }))

    saveDraft(mappedItems, getTotalPrice(), step)
  }, [user, items, getTotalPrice, saveDraft, pathname])

  return null
}
