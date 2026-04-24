'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Percent,
  Package, 
  ShoppingCart, 
  Star, 
  FolderOpen,
  ArrowLeft, 
  LogOut, 
  ShieldCheck,
  BarChart2
} from 'lucide-react'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
  { href: '/admin/banners', label: 'Hero Banners', icon: <ImageIcon size={16} /> },
  { href: '/admin/categories', label: 'Categories', icon: <FolderOpen size={16} /> },
  { href: '/admin/offer-banner', label: 'Promotions', icon: <Percent size={16} /> },
  { href: '/admin/products', label: 'Products', icon: <Package size={16} /> },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={16} /> },
  { href: '/admin/draft-orders', label: 'Draft Orders', icon: <ShoppingCart size={16} /> },
  { href: '/admin/reviews', label: 'Reviews', icon: <Star size={16} /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [draftCount, setDraftCount] = useState(0)

  useEffect(() => {
    // Initial fetch
    const fetchDraftCount = async () => {
      const { count } = await supabase
        .from('draft_orders')
        .select('*', { count: 'exact', head: true })
        .eq('is_recovered', false)
      
      if (count !== null) setDraftCount(count)
    }

    fetchDraftCount()

    // Realtime subscription
    const channel = supabase
      .channel('draft-orders-count')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'draft_orders' 
      }, () => {
        fetchDraftCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      router.push('/admin/login')
    }
  }

  // Define Title Mapping
  const getTitle = (path: string) => {
    const link = sidebarLinks.find(l => l.href === path)
    if (link) return link.label
    if (path === '/admin') return 'Dashboard'
    return 'Admin'
  }

  // Don't wrap login page with admin layout
  if (pathname === '/admin/login') {
     return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background font-body transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-admin-sidebar-bg min-h-screen 
        flex flex-col fixed left-0 top-0 z-40 border-r border-admin-border-faint">
        
        {/* Logo */}
        <div className="px-8 py-8 border-b 
          border-admin-border-faint">
          <p className="text-admin-sidebar-text font-bold italic
            text-[24px] font-heading" >
            Shopkarro
          </p>
          <p className="text-admin-sidebar-muted text-[9px] mt-2 
            font-bold uppercase tracking-[4px]">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 
                  px-5 py-4 rounded-0 mb-2 text-[13px]
                  transition-all duration-300 uppercase tracking-widest font-bold
                  ${isActive
                    ? 'bg-admin-sidebar-active text-white shadow-lg'
                    : 'text-admin-sidebar-text/60 hover:bg-white/[0.03] hover:text-admin-sidebar-text'
                  }`}
              >
                <span className={isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"}>
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
        <div className="px-8 py-6 border-t 
          border-admin-border-faint bg-black/10">
          <button
            onClick={handleLogout}
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
        
        {/* Top bar */}
        <header className="bg-bg-white border-b 
          border-border px-10 py-6
          flex items-center justify-between
          sticky top-0 z-30 shadow-sm transition-colors">
          
          <h1 className="font-bold text-[24px] 
            text-text font-heading uppercase tracking-widest">
            {getTitle(pathname)}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold text-[#6B6058] border border-[#E8E2D9] px-4 py-2.5 rounded-[2px] hover:border-[#783A3A] hover:text-[#783A3A] transition-all uppercase tracking-widest shadow-sm bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span className="hidden md:inline">View Store</span>
              </Link>

              <span className="text-[10px] text-[#6B6058] font-bold font-mono bg-[#F2EDE6] px-4 py-2.5 rounded-[2px] border border-[#E8E2D9] uppercase tracking-widest">
                Admin
              </span>
            </div>
            
            <div className="h-8 w-px bg-border mx-2" />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="p-12 max-w-7xl mx-auto">
          {children}
        </div>

      </main>
    </div>
  )
}
