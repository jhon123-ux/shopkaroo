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
      },

      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity === 0
          ? state.items.filter(item => item.id !== id)
          : state.items.map(item =>
              item.id === id ? {...item, quantity} : item
            )
      })),

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
