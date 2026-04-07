import { create } from 'zustand'

interface WishlistState {
  items: Set<string>
  isInitialized: boolean
  initialize: (likedProductIds: string[]) => void
  toggleItem: (productId: string) => void
  hasItem: (productId: string) => boolean
}

const useWishlistStore = create<WishlistState>((set, get) => ({
  items: new Set(),
  isInitialized: false,
  
  initialize: (likedProductIds) => set({ 
    items: new Set(likedProductIds),
    isInitialized: true
  }),
  
  toggleItem: (productId) => set((state) => {
    const newItems = new Set(state.items)
    if (newItems.has(productId)) {
      newItems.delete(productId)
    } else {
      newItems.add(productId)
    }
    return { items: newItems }
  }),
  
  hasItem: (productId) => get().items.has(productId)
}))

export default useWishlistStore
