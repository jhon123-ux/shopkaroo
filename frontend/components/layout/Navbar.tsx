'use client'
import Link from 'next/link'
import useAuthStore from '@/lib/authStore'
import useCartStore from '@/lib/cartStore'
import { useState, useRef, useEffect } from 'react'

const navLinks = [
  { name: 'Home', slug: '' },
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Office', slug: 'office' },
  { name: 'Dining', slug: 'dining' },
]

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)

    // Close dropdown on outside click
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const totalItems = useCartStore(state => state.getTotalItems())

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-heading font-extrabold text-2xl text-primary tracking-tight">
              Shopkaroo
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:ml-6 md:flex md:space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={`/${link.slug ? 'furniture/' + link.slug : ''}`}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-text hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

           {/* Icons (Search, Cart, Auth, Mobile Menu) */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button aria-label="Search" className="text-text-muted hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative text-text-muted hover:text-primary transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#6C3FC5] rounded-full group-hover:bg-[#5530A8] transition-colors">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {!user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-sm font-semibold text-[#6C3FC5] hover:underline">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-[#6C3FC5] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#5530A8] transition-all shadow-md shadow-[#6C3FC5]/20">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6C3FC5] text-white text-xs font-black flex items-center justify-center shadow-lg shadow-[#6C3FC5]/10 group-hover:scale-105 transition-transform">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-[#1A1A2E] hidden lg:block max-w-[100px] truncate">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <svg className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-[#E5E0F5] z-[60] overflow-hidden animate-slideUp">
                    <div className="px-4 py-3 border-b border-[#E5E0F5] bg-[#F7F5FF]">
                      <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-0.5">Signed in as</p>
                      <p className="text-xs font-bold text-[#1A1A2E] truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link href="/my-orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1A1A2E] hover:bg-[#F7F5FF] transition-colors">
                        <span className="text-lg">📦</span> My Orders
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1A1A2E] hover:bg-[#F7F5FF] transition-colors">
                        <span className="text-lg">👤</span> My Profile
                      </Link>
                    </div>
                    <div className="border-t border-[#E5E0F5] pt-1 pb-1">
                      <button 
                        onClick={() => { signOut(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <span className="text-lg">🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden ml-2">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-muted hover:text-primary p-1 focus:outline-none"
                aria-label="Main menu"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border absolute w-full left-0">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={`/${link.slug ? 'furniture/' + link.slug : ''}`}
                className="block pl-4 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-surface hover:border-primary hover:text-primary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
