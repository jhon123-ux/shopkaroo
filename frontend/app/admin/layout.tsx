'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Tag, 
  Package, 
  ShoppingCart, 
  Star, 
  ArrowLeft, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react'

const sidebarLinks = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/banners', label: 'Hero Banners', icon: <ImageIcon size={18} /> },
  { href: '/admin/offer-banner', label: 'Promotionals', icon: <Tag size={18} /> },
  { href: '/admin/products', label: 'Inventory', icon: <Package size={18} /> },
  { href: '/admin/orders', label: 'Transactions', icon: <ShoppingCart size={18} /> },
  { href: '/admin/reviews', label: 'Feedback', icon: <Star size={18} /> },
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

  // Don't wrap login page with admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F4] font-body">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1C1410] min-h-screen 
        flex flex-col fixed left-0 top-0 z-40 border-r border-white/5">
        
        {/* Logo */}
        <div className="px-8 py-8 border-b 
          border-white/5">
          <p className="text-white font-bold italic
            text-[24px] font-heading" >
            Shopkaroo
          </p>
          <p className="text-white/30 text-[9px] mt-2 
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
                    ? 'bg-[#4A2C6E] text-white'
                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                  }`}
              >
                <span className="opacity-60">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-8 py-6 border-t 
          border-white/5 bg-black/10">
          <Link href="/" 
            className="text-white/30 text-[10px] 
            hover:text-white/70 transition uppercase tracking-[2px]
            flex items-center gap-3 font-bold">
            <ArrowLeft size={12} /> Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full mt-6 text-[#DC2626] opacity-40 hover:opacity-100 transition-all 
            uppercase tracking-[4px] text-[9px] font-bold py-3 
            border border-[#DC2626]/20 hover:border-[#DC2626] 
            flex items-center justify-center gap-2"
          >
            <LogOut size={12} /> Terminate Session
          </button>

          <p className="text-white/10 text-[9px] mt-6 
            uppercase tracking-widest">
            Protocol v2.4.0
          </p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 min-h-screen relative">
        
        {/* Top bar */}
        <header className="bg-white border-b 
          border-[#E8E2D9] px-10 py-6
          flex items-center justify-between
          sticky top-0 z-30 shadow-sm">
          
          <h1 className="font-bold text-[24px] 
            text-[#1C1410] font-heading uppercase tracking-widest">
            {sidebarLinks.find(l => 
              l.href === pathname)?.label 
              ?? 'Admin'}
          </h1>

          {/* Right side */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-2">
                <span className="text-[#1C1410] text-[12px] font-bold uppercase tracking-wider">System Administrator</span>
                <span className="text-[#2D6A4F] text-[10px] font-bold uppercase tracking-widest">Online</span>
            </div>
            <div className="w-10 h-10 bg-[#FAF7F4] border border-[#E8E2D9] rounded-0 flex items-center justify-center text-[#4A2C6E] shadow-inner">
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
