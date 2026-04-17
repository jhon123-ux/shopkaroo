'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/lib/authStore'
import useWishlistStore from '@/lib/wishlistStore'
import ProductCard from '@/components/product/ProductCard'
import { Heart } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([])
  const [loadingWishlist, setLoadingWishlist] = useState(true)
  const { initialize, isInitialized } = useWishlistStore()

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile')
    }
  }, [user, loading, router])

  // Fetch current profile data
  useEffect(() => {
    if (!user) return
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setFormData({
          fullName: data.full_name || '',
          phone: data.phone || '',
          city: data.city || '',
          address: data.address || ''
        })
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, initialization happens on first save
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || ''
        }))
      }
    }
    
    fetchProfile()
  }, [user])

  // Fetch wishlist
  useEffect(() => {
    if (!user) return

    const fetchWishlist = async () => {
      setLoadingWishlist(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const json = await res.json()
        
        if (json.data) {
          const products = json.data.map((item: any) => item.products)
          setWishlistProducts(products)
          
          // Initialize store if needed
          if (!isInitialized) {
            initialize(products.map((p: any) => p.id))
          }
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err)
      } finally {
        setLoadingWishlist(false)
      }
    }

    fetchWishlist()
  }, [user, isInitialized, initialize])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      
      setMessage({ type: 'success', text: 'SUCCESS: Profile updated successfully.' })
      
      // Also update auth metadata if name changed
      await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      })
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
      // Clear message after 5s
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 md:py-24 font-body transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-[40px] font-bold text-text font-heading mb-4">
            My Account
          </h1>
          <p className="text-text-muted text-[14px] uppercase tracking-[3px] font-semibold opacity-60">
            Personal Details & Shipping Defaults
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-bg-white rounded-0 border border-border p-10 md:p-14 shadow-sm relative overflow-hidden transition-colors">
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            
            {/* Success/Error Message */}
            {message && (
              <div className={`${
                message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'
              } border text-[12px] font-bold uppercase tracking-wide rounded-[2px] p-5 animate-slideUp text-center transition-colors`}>
                {message.text}
              </div>
            )}

            {/* Email (Read Only) */}
            <div className="bg-surface rounded-0 p-5 border border-border text-left transition-colors">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[2px] mb-2 opacity-60">
                Registered Email
              </label>
              <p className="text-[15px] font-bold text-text font-heading">
                {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] text-left">Full Name</label>
                <input 
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body text-text"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] text-left">Phone Number</label>
                <input 
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body font-mono tracking-wider text-text"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] text-left">Default Shipping City</label>
              <div className="relative">
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all bg-white appearance-none pr-12 cursor-pointer font-body text-text"
                >
                  <option value="">Select city</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text opacity-40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] text-left">Default Shipping Address</label>
              <textarea 
                rows={4}
                placeholder="Complete address (House, Street, Area...)"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body resize-none leading-relaxed text-text"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-primary text-white py-5 rounded-[3px] font-bold font-body text-[14px] uppercase tracking-[2px] transition-all hover:bg-primary-dark hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Sychronizing...
                  </>
                ) : (
                  <>
                    <span>Update Collection Profile</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Wishlist Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] font-bold text-text font-heading flex items-center gap-3">
              <Heart className="text-primary fill-primary" size={24} />
              My Collection
            </h2>
            <span className="text-[12px] font-bold text-text-muted uppercase tracking-[2px] opacity-40">
              {wishlistProducts.length} Items Liked
            </span>
          </div>

          {loadingWishlist ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-white border border-border h-80 animate-pulse rounded-[4px]" />
              ))}
            </div>
          ) : wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-bg-white border border-border p-16 text-center rounded-[4px] transition-colors">
              <div className="mb-6 opacity-20 text-text">
                <Heart size={48} className="mx-auto" />
              </div>
              <h3 className="text-[20px] font-bold text-text font-heading mb-2">Your collection is empty</h3>
              <p className="text-text-muted mb-8 text-[15px]">Start liking products to build your dream space.</p>
              <button 
                onClick={() => router.push('/')}
                className="bg-primary text-white px-8 py-4 rounded-[3px] font-bold uppercase tracking-[1px] text-[12px] hover:bg-primary-dark transition-all"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
