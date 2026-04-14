'use client'
import Link from 'next/link'
import Image from 'next/image'
import useAuthStore from '@/lib/authStore'
import useCartStore from '@/lib/cartStore'
import { useState, useRef, useEffect } from 'react'
import { Search, ShoppingBag, Menu, X, User, ChevronDown, Package, LogOut, Archive } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from 'next-themes'
import { Product } from '@/types'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const [navLinks, setNavLinks] = useState<{name: string, slug: string}[]>([{ name: 'Home', slug: '' }])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories?nested=true`)
        const data = await res.json()
        if (data.data) {
          setNavLinks([{ name: 'Home', slug: '', children: [] }, ...data.data])
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
    <nav className="sticky top-0 z-50 w-full bg-bg-white border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex flex-row items-center gap-2 font-body font-bold text-[22px] text-primary tracking-[-0.3px]">
              <Image 
                src={mounted && resolvedTheme === 'dark' ? '/logo-symbol-light.svg' : '/logo-symbol.svg'} 
                alt="Shopkarro Logo" 
                width={28} 
                height={28} 
                priority 
              />
              Shopkarro
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:ml-6 md:flex md:space-x-8 items-center">
            <Link 
              href="/"
              className="inline-flex items-center px-1 pt-1 text-[14px] font-medium font-body text-text-muted hover:text-text transition-colors duration-150"
            >
              Home
            </Link>
            
            <div className="relative group py-4 pointer-events-auto">
              <button className="inline-flex items-center gap-1 px-1 text-[14px] font-medium font-body text-text-muted group-hover:text-text transition-colors duration-150 cursor-pointer">
                Categories <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] translate-y-2 group-hover:translate-y-0">
                <div className="w-[480px] bg-bg-white border border-border rounded-[4px] shadow-2xl overflow-hidden p-6 grid grid-cols-2 gap-8">
                  {navLinks.filter(link => link.name !== 'Home').map((link: any) => (
                    <div key={link.id || link.name} className="flex flex-col gap-3">
                      <Link 
                        href={`/furniture/${link.slug}`}
                        className="text-[13px] font-bold font-body text-text hover:text-primary transition-colors uppercase tracking-widest border-b border-background pb-2"
                      >
                        {link.name}
                      </Link>
                      
                      {link.children && link.children.length > 0 && (
                        <div className="flex flex-col gap-2 pl-1">
                          {link.children.map((child: any) => (
                            <Link 
                              key={child.id} 
                              href={`/furniture/${child.slug}`}
                              className="text-[14px] font-medium font-body text-text-muted hover:text-primary transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

           {/* Icons (Search, Cart, Auth, Mobile Menu) */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Search Icon */}
            <button 
              onClick={() => setSearchOpen(true)}
              aria-label="Search" 
              className="text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <Search size={20} />
            </button>
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative text-text-muted hover:text-primary transition-colors group">
              <ShoppingBag size={20} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-[3px] transition-colors">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {!user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-[13px] font-semibold font-body text-primary border-[1.5px] border-primary px-[18px] py-[7px] rounded-[3px] hover:bg-primary-tint transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-primary text-white px-[18px] py-[7px] rounded-[3px] text-[13px] font-semibold font-body hover:bg-primary-dark transition-all">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-[3px] bg-primary text-white text-xs font-black flex items-center justify-center shadow-lg transition-transform">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-text hidden lg:block max-w-[100px] truncate">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-bg-white rounded-[4px] shadow-md border border-border z-[60] overflow-hidden animate-slideUp">
                    <div className="px-4 py-3 border-b border-border bg-surface">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Signed in as</p>
                      <p className="text-xs font-bold text-text truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link href="/my-orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-text hover:bg-surface transition-colors">
                        <Package size={16} className="text-text-muted" /> My Orders
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-text hover:bg-surface transition-colors">
                        <User size={16} className="text-text-muted" /> My Profile
                      </Link>
                    </div>
                    <div className="border-t border-border pt-1 pb-1">
                      <button 
                        onClick={() => { signOut(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden ml-2 gap-3">
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-muted hover:text-primary p-1 focus:outline-none transition-colors"
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
        <div className="md:hidden bg-bg-white border-b border-border absolute w-full left-0 z-50 max-h-[85vh] overflow-y-auto shadow-xl animate-slideDown">
          <div className="pt-2 pb-6 space-y-1">
            {navLinks.map((link: any) => {
              const hasChildren = link.children && link.children.length > 0;
              const isExpanded = expandedCategory === link.name;
              
              return (
                <div key={link.name} className="flex flex-col border-b border-background last:border-0">
                  <div className="flex items-center justify-between pr-2 hover:bg-background transition-all group">
                    <Link
                      href={`/${link.slug ? 'furniture/' + link.slug : ''}`}
                      className="flex-1 pl-6 py-4 text-[15px] font-bold font-heading text-text group-hover:text-primary transition-all uppercase tracking-wide"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                    
                    {hasChildren && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedCategory(isExpanded ? null : link.name);
                        }}
                        className="p-4 text-text-muted hover:text-primary transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronDown 
                          size={18} 
                          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories (Accordion Content) */}
                  {hasChildren && isExpanded && (
                    <div className="bg-background flex flex-col pt-1 pb-4 animate-slideDown border-t border-border/30">
                      {link.children.map((child: any) => (
                        <Link
                          key={child.slug}
                          href={`/furniture/${child.slug}`}
                          className="block pl-10 pr-4 py-3 text-[14px] font-medium font-body text-text-muted hover:text-primary transition-all border-l-2 border-transparent hover:border-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Auth Actions */}
            <div className="mt-6 pt-8 border-t border-border px-4 space-y-4">
              {!mounted ? null : !user ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[3px] mb-1 opacity-40">Account Access</p>
                  <div className="flex flex-col gap-3">
                    <Link 
                      href="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full h-12 flex items-center justify-center border-[1.5px] border-primary text-primary text-[13px] font-bold uppercase tracking-widest rounded-[3px] hover:bg-primary-tint transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full h-12 flex items-center justify-center bg-primary text-white text-[13px] font-bold uppercase tracking-widest rounded-[3px] hover:bg-primary-dark transition-all"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[3px] mb-3 opacity-40">User Interface</p>
                  <Link 
                    href="/my-orders" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 py-3 text-text font-bold text-[14px] uppercase tracking-wide border-b border-background"
                  >
                    <Package size={18} className="text-text-muted" /> My Orders
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 py-3 text-text font-bold text-[14px] uppercase tracking-wide border-b border-background"
                  >
                    <User size={18} className="text-text-muted" /> My Profile
                  </Link>
                  <button 
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 py-4 text-red-600 font-bold text-[14px] uppercase tracking-widest mt-2"
                  >
                    <LogOut size={18} /> Sign Out Protocol
                  </button>
                </div>
              )}
            </div>
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
            className="bg-bg-white w-full max-w-2xl rounded-[4px] shadow-2xl overflow-hidden animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Field */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
              <Search size={20} className="text-text-muted flex-shrink-0" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search premium furniture..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="flex-1 outline-none bg-transparent text-text font-body text-lg placeholder:text-text-muted/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="p-1 hover:bg-surface rounded-full transition-colors"
                >
                  <X size={16} className="text-text-muted" />
                </button>
              )}
              <button 
                onClick={() => setSearchOpen(false)}
                className="text-text-muted hover:text-text font-bold text-sm uppercase tracking-widest ml-2"
              >
                Cancel
              </button>
            </div>

            {/* Suggestions/Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searching && (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest opacity-40">Despatching Query...</p>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div className="p-16 text-center">
                  <p className="text-text font-heading font-bold text-xl mb-2">No items found</p>
                  <p className="text-text-muted font-body text-sm opacity-60">We couldn't find any results for "{searchQuery}".</p>
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="py-2">
                  <p className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-[3px] opacity-40 border-b border-background">Matching Gallery</p>
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="flex items-center gap-5 px-6 py-4 hover:bg-background transition-colors border-b border-background last:border-0"
                    >
                      <div className="w-16 h-16 bg-surface rounded-0 overflow-hidden flex-shrink-0 border border-border">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-text-muted/50"><Archive size={28} strokeWidth={1.5} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-heading font-bold text-text text-[16px] line-clamp-1 truncate">{product.name}</p>
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-[2px] mt-1 opacity-60">{product.category.replace('-', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-[15px]">
                          Rs. {(product.sale_price || product.price_pkr).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!searchQuery && !searching && (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                    <Search size={32} className="text-text-muted" />
                  </div>
                  <p className="text-text-muted font-body text-sm italic opacity-60">Architect your space. Search for beds, sofas, or dining sets...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
