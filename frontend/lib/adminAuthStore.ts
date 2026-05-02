import { create } from 'zustand'
import api from '@/lib/api'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'manager' | 'staff' | 'custom'
  permissions: Record<string, boolean>
}

interface AdminAuthStore {
  admin: AdminUser | null
  token: string | null
  loading: boolean
  setAdmin: (admin: AdminUser | null, token?: string | null) => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  logout: () => Promise<void>
}

const useAdminAuthStore = create<AdminAuthStore>((set, get) => ({
  admin: null,
  token: (() => { try { return typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : null } catch { return null } })(),
  loading: true,
  setAdmin: (admin, token) => {
    try {
      if (token) localStorage.setItem('skr_admin_token', token)
      if (token === null) localStorage.removeItem('skr_admin_token')
    } catch (e) {
      console.error('Storage access denied', e)
    }
    set({ admin, token: token !== undefined ? token : get().token, loading: false })
  },
  setLoading: (loading) => set({ loading }),
  hasPermission: (permission) => {
    const admin = get().admin
    if (!admin) return false
    // Superadmin bypasses all checks
    if (admin.role === 'superadmin') return true
    return !!admin.permissions[permission]
  },
  logout: async () => {
    try {
      await api.post('/api/admin/auth/logout')
    } catch (e) {
      console.error('Logout API call failed', e)
    }
    set({ admin: null, token: null, loading: false })
    if (typeof window !== 'undefined') localStorage.removeItem('skr_admin_token')
    window.location.href = '/admin/login'
  }
}))

export default useAdminAuthStore
