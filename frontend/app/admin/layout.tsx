'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/banners', label: 'Hero Banners', icon: '🖼️' },
  { href: '/admin/offer-banner', label: 'Offer Banner', icon: '🏷️' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Don't wrap login page with admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1A1A2E] min-h-screen 
        flex flex-col fixed left-0 top-0 z-40">
        
        {/* Logo */}
        <div className="px-6 py-5 border-b 
          border-white/10">
          <p className="text-white font-extrabold 
            text-lg" 
            style={{fontFamily:'Syne,sans-serif'}}>
            Shopkaroo
          </p>
          <p className="text-white/40 text-xs mt-0.5 
            font-mono tracking-wider">
            ADMIN PANEL
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 
                  px-4 py-3 rounded-xl mb-1 text-sm
                  transition-all duration-200
                  ${isActive
                    ? 'bg-[#6C3FC5] text-white font-semibold'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className="text-base">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-6 py-4 border-t 
          border-white/10">
          <Link href="/" 
            className="text-white/40 text-xs 
            hover:text-white/70 transition
            flex items-center gap-2">
            ← Back to Store
          </Link>
          <p className="text-white/20 text-xs mt-3 
            font-mono">
            v1.0.0
          </p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 min-h-screen relative">
        
        {/* Top bar */}
        <header className="bg-white border-b 
          border-[#E5E0F5] px-8 py-4
          flex items-center justify-between
          sticky top-0 z-30">
          
          {/* Page title — dynamic */}
          <h1 className="font-extrabold text-xl 
            text-[#1A1A2E]"
            style={{fontFamily:'Syne,sans-serif'}}>
            {sidebarLinks.find(l => 
              l.href === pathname)?.label 
              ?? 'Admin'}
          </h1>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7280] 
              font-mono bg-[#F7F5FF] px-3 py-1.5 
              rounded-full border border-[#E5E0F5]">
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>

      </main>
    </div>
  )
}
