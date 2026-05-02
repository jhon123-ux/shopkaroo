'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { supabase } from '@/lib/supabase'
import useAdminAuthStore from '@/lib/adminAuthStore'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Percent,
  Package, 
  ShoppingCart, 
  Star, 
  FolderOpen,
  LogOut, 
  ShieldCheck,
  BarChart2,
  Users
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, setAdmin, setLoading, logout, hasPermission } = useAdminAuthStore()
  const [draftCount, setDraftCount] = useState(0)

  const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} /> }, // Dashboard usually public to all staff
    { href: '/admin/analytics', label: 'Analytics', icon: <BarChart2 size={16} />, permission: 'analytics_view' },
    { href: '/admin/banners', label: 'Hero Banners', icon: <ImageIcon size={16} />, permission: 'banners_view' },
    { href: '/admin/categories', label: 'Categories', icon: <FolderOpen size={16} />, permission: 'categories_view' },
    { href: '/admin/offer-banner', label: 'Promotions', icon: <Percent size={16} />, permission: 'banners_view' },
    { href: '/admin/products', label: 'Products', icon: <Package size={16} />, permission: 'products_view' },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={16} />, permission: 'orders_view' },
    { href: '/admin/draft-orders', label: 'Draft Orders', icon: <ShoppingCart size={16} />, permission: 'orders_view' },
    { href: '/admin/reviews', label: 'Reviews', icon: <Star size={16} />, permission: 'reviews_view' },
    { href: '/admin/team', label: 'Team', icon: <Users size={16} />, role: 'superadmin' },
  ]

  useEffect(() => {
    // Restore session
    const restoreSession = async () => {
      if (admin) return

      // Failsafe API URL for production
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      if (window.location.hostname !== 'localhost' && apiUrl.includes('localhost')) {
        apiUrl = 'https://shopkaroo-production.up.railway.app'
      }

      // Safely read token from localStorage
      let token: string | null = null
      try {
        token = localStorage.getItem('skr_admin_token')
      } catch (e) {
        console.error('localStorage not accessible', e)
      }

      window.alert(`[LAYOUT] Token found: ${!!token} | URL: ${apiUrl} | Path: ${pathname}`)

      // If no token and not on a public page, redirect to login
      if (!token) {
        if (pathname !== '/admin/login' && pathname !== '/admin/forgot-password' && pathname !== '/admin/reset-password') {
          router.push('/admin/login')
        }
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${apiUrl}/api/admin/auth/me`, { 
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include' 
        })
        window.alert(`[LAYOUT] /me response: ${res.status}`)
        if (res.ok) {
          const data = await res.json()
          setAdmin(data.admin, token)
          window.alert(`[LAYOUT] Admin set: ${data.admin?.email}`)
        } else {
          // Token is invalid — clear it and redirect
          try { localStorage.removeItem('skr_admin_token') } catch (_) {}
          if (pathname !== '/admin/login' && pathname !== '/admin/forgot-password' && pathname !== '/admin/reset-password') {
            router.push('/admin/login')
          }
        }
      } catch (e: any) {
        window.alert(`[LAYOUT] fetch error: ${e.message}`)
        console.error('Session restoration failed', e)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [pathname])


  useEffect(() => {
    if (!admin) return

    const fetchDraftCount = async () => {
      const { count } = await supabase
        .from('draft_orders')
        .select('*', { count: 'exact', head: true })
        .eq('is_recovered', false)
      
      if (count !== null) setDraftCount(count)
    }

    fetchDraftCount()

    const channel = supabase
      .channel('draft-orders-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draft_orders' }, () => {
        fetchDraftCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [admin])

  const getTitle = (path: string) => {
    const link = sidebarLinks.find(l => l.href === path)
    if (link) return link.label
    if (path === '/admin') return 'Dashboard'
    return 'Admin'
  }

  if (pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password') {
    // If already authenticated, redirect to dashboard
    if (admin) {
      if (typeof window !== 'undefined') window.location.href = '/admin'
      return null
    }
    return <>{children}</>
  }

  // Optional: show loading state while checking session
  // if (loading && !admin) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>

  return (
    <div className="flex min-h-screen bg-background font-body transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-admin-sidebar-bg min-h-screen 
        flex flex-col fixed left-0 top-0 z-40 border-r border-admin-border-faint">
        
        {/* Logo */}
        <div className="px-8 py-8 border-b border-admin-border-faint">
          <p className="text-admin-sidebar-text font-bold italic text-[24px] font-heading">
            Shopkarro
          </p>
          <p className="text-admin-sidebar-muted text-[9px] mt-2 font-bold uppercase tracking-[4px]">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8">
          {sidebarLinks.map((link) => {
            // Guard: role check
            if (link.role && admin?.role !== link.role) return null
            // Guard: permission check
            if (link.permission && !hasPermission(link.permission)) return null

            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-0 mb-2 text-[13px]
                  transition-all duration-300 uppercase tracking-widest font-bold
                  ${isActive
                    ? 'bg-admin-sidebar-active text-white shadow-lg'
                    : 'text-admin-sidebar-text/60 hover:bg-white/[0.03] hover:text-admin-sidebar-text'
                  }`}
              >
                <span className={isActive ? "opacity-100" : "opacity-40"}>
                  {link.icon}
                </span>
                <span className="flex-1 text-left">{link.label}</span>
                
                {link.href === '/admin/draft-orders' && draftCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {draftCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-8 py-6 border-t border-admin-border-faint bg-black/10">
          <div className="mb-4 px-4 flex flex-col">
            <span className="text-white font-bold text-[11px] truncate">{admin?.name}</span>
            <span className="text-white/40 text-[9px] uppercase tracking-wider">{admin?.role}</span>
          </div>
          <button
            onClick={logout}
            className="w-full text-[#DC2626] opacity-60 hover:opacity-100 transition-all 
            uppercase tracking-[4px] text-[9px] font-bold py-4
            border border-[#DC2626]/40 hover:border-[#DC2626] 
            flex items-center justify-center gap-2"
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 min-h-screen relative">
        <header className="bg-bg-white border-b border-border px-10 py-6 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors">
          <h1 className="font-bold text-[24px] text-text font-heading uppercase tracking-widest">
            {getTitle(pathname)}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-[#6B6058] border border-[#E8E2D9] px-4 py-2.5 rounded-[2px] hover:border-[#783A3A] hover:text-[#783A3A] transition-all uppercase tracking-widest shadow-sm bg-white">
                <ShieldCheck size={14} />
                <span className="hidden md:inline">View Store</span>
              </Link>
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            <ThemeToggle />
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
