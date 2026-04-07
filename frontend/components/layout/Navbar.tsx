'use client'
import Link from 'next/link'
import Image from 'next/image'
import useAuthStore from '@/lib/authStore'
import useCartStore from '@/lib/cartStore'
import { useState, useRef, useEffect } from 'react'
import { Search, ShoppingBag, Menu, X, User, ChevronDown, Package, LogOut } from 'lucide-react'
import { Product } from '@/types'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const [navLinks, setNavLinks] = useState<{name: string, slug: string}[]>([{ name: 'Home', slug: '' }])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Search State
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout|null>(null)
  
  useEffect(() => {
    setMounted(true)

    const fetchNavCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`)
        const data = await res.json()
        if (data.data) {
          const cmsLinks = data.data.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug
          }))
          setNavLinks([{ name: 'Home', slug: '' }, ...cmsLinks])
        }
      } catch (err) {
        console.error('Navbar category fetch error:', err)
      }
    }

    fetchNavCategories()

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSearch = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    
    if (!query.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?search=${encodeURIComponent(query)}&limit=8`
        )
        const data = await res.json()
        setSearchResults(data.data || [])
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

  const totalItems = useCartStore(state => state.getTotalItems())

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-[#E8E2D9] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex flex-row items-center gap-2 font-heading italic font-bold text-[22px] text-[#4A2C6E] tracking-[-0.3px]">
              <Image src="/logo-symbol.svg" alt="Shopkarro Logo" width={28} height={28} priority />
              Shopkarro
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:ml-6 md:flex md:space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={`/${link.slug ? 'furniture/' + link.slug : ''}`}
                className="inline-flex items-center px-1 pt-1 text-[14px] font-medium font-body text-[#6B6058] hover:text-[#1C1410] transition-colors duration-150"
              >
                {link.name}
              </Link>
            ))}
          </div>

           {/* Icons (Search, Cart, Auth, Mobile Menu) */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button 
              onClick={() => setSearchOpen(true)}
              aria-label="Search" 
              className="text-[#6B6058] hover:text-[#4A2C6E] transition-colors cursor-pointer"
            >
              <Search size={20} />
            </button>
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative text-[#6B6058] hover:text-[#4A2C6E] transition-colors group">
              <ShoppingBag size={20} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#4A2C6E] rounded-[3px] transition-colors">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {!user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-[13px] font-semibold font-body text-[#4A2C6E] border-[1.5px] border-[#4A2C6E] px-[18px] py-[7px] rounded-[3px] hover:bg-[#F0EBF8] transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-[#4A2C6E] text-white px-[18px] py-[7px] rounded-[3px] text-[13px] font-semibold font-body hover:bg-[#3A1F57] transition-all">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-[3px] bg-[#4A2C6E] text-white text-xs font-black flex items-center justify-center shadow-lg transition-transform">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-[#1C1410] hidden lg:block max-w-[100px] truncate">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={14} className={`text-[#6B6058] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-[4px] shadow-md border border-[#E8E2D9] z-[60] overflow-hidden animate-slideUp">
                    <div className="px-4 py-3 border-b border-[#E8E2D9] bg-[#F2EDE6]">
                      <p className="text-[10px] font-black text-[#6B6058] uppercase tracking-widest mb-0.5">Signed in as</p>
                      <p className="text-xs font-bold text-[#1C1410] truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link href="/my-orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1C1410] hover:bg-[#F2EDE6] transition-colors">
                        <Package size={16} className="text-[#6B6058]" /> My Orders
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1C1410] hover:bg-[#F2EDE6] transition-colors">
                        <User size={16} className="text-[#6B6058]" /> My Profile
                      </Link>
                    </div>
                    <div className="border-t border-[#E8E2D9] pt-1 pb-1">
                      <button 
                        onClick={() => { signOut(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
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
                className="text-[#6B6058] hover:text-[#4A2C6E] p-1 focus:outline-none"
                aria-label="Main menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E2D9] absolute w-full left-0">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={`/${link.slug ? 'furniture/' + link.slug : ''}`}
                className="block pl-4 pr-4 py-2 border-l-4 border-transparent text-base font-medium font-body text-[#1C1410] hover:bg-[#F2EDE6] hover:border-[#4A2C6E] hover:text-[#4A2C6E] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fadeIn flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[4px] shadow-2xl overflow-hidden animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Field */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-[#E8E2D9]">
              <Search size={20} className="text-[#6B6058] flex-shrink-0" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search premium furniture..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="flex-1 outline-none text-[#1C1410] font-body text-lg placeholder:text-[#A89890]"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="p-1 hover:bg-[#F2EDE6] rounded-full transition-colors"
                >
                  <X size={16} className="text-[#6B6058]" />
                </button>
              )}
              <button 
                onClick={() => setSearchOpen(false)}
                className="text-[#6B6058] hover:text-[#1C1410] font-bold text-sm uppercase tracking-widest ml-2"
              >
                Cancel
              </button>
            </div>

            {/* Suggestions/Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searching && (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#4A2C6E] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-[#6B6058] text-xs font-bold uppercase tracking-widest opacity-40">Despatching Query...</p>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div className="p-16 text-center">
                  <p className="text-[#1C1410] font-heading font-bold text-xl mb-2">No items found</p>
                  <p className="text-[#6B6058] font-body text-sm opacity-60">We couldn't find any results for "{searchQuery}".</p>
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="py-2">
                  <p className="px-6 py-3 text-[10px] font-black text-[#6B6058] uppercase tracking-[3px] opacity-40 border-b border-[#FAF7F4]">Matching Gallery</p>
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="flex items-center gap-5 px-6 py-4 hover:bg-[#FAF7F4] transition-colors border-b border-[#FAF7F4] last:border-0"
                    >
                      <div className="w-16 h-16 bg-[#F2EDE6] rounded-0 overflow-hidden flex-shrink-0 border border-[#E8E2D9]">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🪑</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-heading font-bold text-[#1C1410] text-[16px] line-clamp-1 truncate">{product.name}</p>
                        <p className="text-[11px] font-bold text-[#6B6058] uppercase tracking-[2px] mt-1 opacity-60">{product.category.replace('-', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#4A2C6E] text-[15px]">
                          Rs. {(product.sale_price || product.price_pkr).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!searchQuery && !searching && (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-[#FAF7F4] rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                    <Search size={32} className="text-[#6B6058]" />
                  </div>
                  <p className="text-[#6B6058] font-body text-sm italic opacity-60">Architect your space. Search for beds, sofas, or dining sets...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
