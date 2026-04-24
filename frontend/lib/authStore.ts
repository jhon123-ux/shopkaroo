'use client'
import { create } from 'zustand'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    try {
      const { clearDraftOrder } = await import('@/app/actions/draft-orders')
      await clearDraftOrder()
    } catch (e) {
      console.error('Draft clear failed on logout', e)
    }
    await supabase.auth.signOut()
    set({ user: null })
  }
}))

export default useAuthStore
