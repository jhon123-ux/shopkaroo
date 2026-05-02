import { create } from 'zustand'

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
  token: typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : null,
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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    try {
      await fetch(`${backendUrl}/api/admin/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      })
    } catch (e) {
      console.error('Logout API call failed', e)
    }
    set({ admin: null, token: null, loading: false })
    if (typeof window !== 'undefined') localStorage.removeItem('skr_admin_token')
    window.location.href = '/admin/login'
  }
}))

export default useAdminAuthStore
