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
  ShieldCheck 
} from 'lucide-react'

const sidebarLinks = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/banners', label: 'Hero Banners', icon: <ImageIcon size={16} /> },
  { href: '/admin/categories', label: 'Categories', icon: <FolderOpen size={16} /> },
  { href: '/admin/offer-banner', label: 'Promotionals', icon: <Percent size={16} /> },
  { href: '/admin/products', label: 'Inventory', icon: <Package size={16} /> },
  { href: '/admin/orders', label: 'Transactions', icon: <ShoppingCart size={16} /> },
  { href: '/admin/reviews', label: 'Feedback', icon: <Star size={16} /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

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
    if (path === '/admin') return 'Overview'
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
            Enterprise Panel
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
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-8 py-6 border-t 
          border-admin-border-faint bg-black/10">
          <Link href="/" 
            className="text-admin-sidebar-muted text-[10px] 
            hover:text-admin-sidebar-text transition uppercase tracking-[2px]
            flex items-center gap-3 font-bold">
            <ArrowLeft size={12} /> Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full mt-6 text-[#DC2626] opacity-60 hover:opacity-100 transition-all 
            uppercase tracking-[4px] text-[9px] font-bold py-3 
            border border-[#DC2626]/40 hover:border-[#DC2626] 
            flex items-center justify-center gap-2"
          >
            <LogOut size={12} /> Terminate Session
          </button>

          <p className="text-admin-sidebar-muted/30 text-[9px] mt-6 
            uppercase tracking-widest">
            Protocol v2.4.0
          </p>
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

          {/* Right side */}
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex flex-col items-end mr-2">
                <span className="text-text text-[12px] font-bold uppercase tracking-wider">System Administrator</span>
                <span className="text-green-600 dark:text-green-500 text-[10px] font-bold uppercase tracking-widest">Online</span>
            </div>
            <div className="w-10 h-10 bg-surface border border-border rounded-0 flex items-center justify-center text-primary shadow-inner">
              <ShieldCheck size={20} />
            </div>
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
