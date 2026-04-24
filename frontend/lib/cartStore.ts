import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  slug: string
  price_pkr: number
  sale_price: number | null
  category: string
  images: string[]
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

// Helper for debounced draft saving
import { upsertDraftOrder } from '@/app/actions/draft-orders'

let draftSaveTimeout: ReturnType<typeof setTimeout> | null = null

function scheduleDraftSave(get: () => CartStore) {
  if (typeof window === 'undefined') return
  if (draftSaveTimeout) clearTimeout(draftSaveTimeout)
  draftSaveTimeout = setTimeout(() => {
    const items = get().items
    const total = get().getTotalPrice()
    if (items.length > 0) {
      upsertDraftOrder({ 
        cartItems: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.sale_price ?? item.price_pkr,
          quantity: item.quantity,
          image: item.images?.[0],
          slug: item.slug
        })), 
        cartTotal: total, 
        reachedStep: 'cart' 
      })
    }
  }, 2000)
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          const existing = state.items.find(
            item => item.id === product.id
          )
          if (existing) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? {...item, quantity: item.quantity + 1}
                  : item
              )
            }
          }
          return { items: [...state.items, {...product, quantity: 1}] }
        })
        scheduleDraftSave(get)
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }))
        scheduleDraftSave(get)
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: quantity === 0
            ? state.items.filter(item => item.id !== id)
            : state.items.map(item =>
                item.id === id ? {...item, quantity} : item
              )
        }))
        scheduleDraftSave(get)
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => 
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.sale_price ?? item.price_pkr
          return sum + (price * item.quantity)
        }, 0)
    }),
    {
      name: 'shopkaroo-cart',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useCartStore
