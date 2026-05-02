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
  loading: boolean
  setAdmin: (admin: AdminUser | null) => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  logout: () => Promise<void>
}

const useAdminAuthStore = create<AdminAuthStore>((set, get) => ({
  admin: null,
  loading: true,
  setAdmin: (admin) => set({ admin, loading: false }),
  setLoading: (loading) => set({ loading }),
  hasPermission: (permission) => {
    const admin = get().admin
    if (!admin) return false
    // Superadmin bypasses all checks
    if (admin.role === 'superadmin') return true
    return !!admin.permissions[permission]
  },
  logout: async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    try {
      await fetch(`${backendUrl}/api/admin/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      })
    } catch (e) {
      console.error('Logout API call failed', e)
    }
    set({ admin: null, loading: false })
    window.location.href = '/admin/login'
  }
}))

export default useAdminAuthStore
