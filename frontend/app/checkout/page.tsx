'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Lock, 
  Banknote, 
  Truck, 
  Check, 
  Mail, 
  ArrowRight, 
  RotateCcw, 
  Package, 
  ChevronDown,
  Sofa,
  Bed,
  Archive,
  Utensils,
  Box
} from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import useAuthStore from '@/lib/authStore'
import { supabase } from '@/lib/supabase'
import { useDraftOrder } from '@/hooks/useDraftOrder'

const getDeliveryEstimate = (city: string) => {
  const fast = ['Karachi', 'Lahore']
  const medium = ['Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']
  
  if (fast.includes(city)) return '2-3 business days'
  if (medium.includes(city)) return '3-5 business days'
  return '5-7 business days'
}

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'living-room': return <Sofa className="w-10 h-10" />
    case 'bedroom': return <Bed className="w-10 h-10" />
    case 'office': return <Archive className="w-10 h-10" />
    case 'dining': return <Utensils className="w-10 h-10" />
    default: return <Box className="w-10 h-10" />
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { saveDraftNow, removeDraft } = useDraftOrder()

  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Trigger F — save on checkout page mount (High Intent)
  useEffect(() => {
    if (mounted && items.length > 0) {
      saveDraftNow(items, getTotalPrice(), 'checkout')
    }
  }, [mounted])

  // Trigger G — save on tab close
  useEffect(() => {
    if (!mounted || items.length === 0) return

    const handleUnload = () => {
      const data = JSON.stringify({
        cartItems: items,
        cartTotal: getTotalPrice(),
        reachedStep: 'checkout',
      })
      navigator.sendBeacon('/api/draft-save', data)
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [mounted, items, getTotalPrice])

  // Auto-fill from Auth and Last Order
  useEffect(() => {
    if (!user) return
    
    // 1. Initial auth values
    setEmail(user.email || '')
    if (user.user_metadata?.full_name) {
      setName(user.user_metadata.full_name)
    }
    
    // 2. Fetch last order for shipping details
    const fetchLastOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('customer_name, phone, city, address')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        if (!name) setName(data.customer_name)
        setPhone(data.phone || '')
        setCity(data.city || '')
        setAddress(data.address || '')
      }
    }
    
    fetchLastOrder()
  }, [user, name])

  useEffect(() => {
    if (mounted && items.length === 0 && !loading) {
      router.push('/cart')
    }
  }, [mounted, items, loading, router])

  if (!mounted || items.length === 0) return null

  const validateForm = () => {
    const errs: Record<string, string> = {}
    
    if (!name.trim() || name.trim().length < 3)
      errs.name = "Please enter your full name"
    
    if (email && !email.includes('@'))
      errs.email = "Please enter a valid email address"
    
    if (!phone || !/^03[0-9]{9}$/.test(phone))
      errs.phone = "Use format: 03XXXXXXXXX"
    
    if (!city)
      errs.city = "Please select your city"
    
    if (!address.trim() || address.trim().length < 10)
      errs.address = "Please enter your complete address"
    
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const totalPrice = getTotalPrice()

      const payload = {
        customer_name: name,
        customer_email: user?.email || email || undefined,
        user_id: user?.id || null,
        phone,
        city,
        address,
        notes,
        items,
        subtotal_pkr: totalPrice,
        delivery_fee: 0,
        total_pkr: totalPrice
      }

      const res = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to place order')
      }

      // Order Success
      const orderNumber = data.data.order_number
      const emailParam = (user?.email || email) ? `?email=${encodeURIComponent(user?.email || email)}` : ''
      
      // Trigger H — Clear Abandoned Draft
      await removeDraft()
      
      router.push(`/order-confirmed/${orderNumber}${emailParam}`)
      
      setTimeout(() => {
        clearCart()
      }, 500)
      
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const totalPrice = getTotalPrice()

  const whatsappOrderUrl = () => {
    const itemsList = items.map(i => `${i.name} x${i.quantity}`).join(', ')
    const msg = `Hi Shopkarro! I'd like to place an order:
Items: ${itemsList}
Total: Rs. ${totalPrice.toLocaleString()}
Name: ${name}
Phone: ${phone}
City: ${city}
Address: ${address}`
    return `https://wa.me/923706905835?text=${encodeURIComponent(msg)}`
  }

  return (
    <main className="bg-background min-h-screen pb-32 md:pb-20 font-body transition-colors duration-300">
      
      {/* HEADER */}
      <header className="py-6 border-b border-border bg-bg-white sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic text-text font-heading">
            Shopkarro
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 opacity-60">
              <span className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center text-[10px]"><Check className="w-3 h-3" /></span> Cart
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
              <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">2</span> Shipping
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted opacity-40">
              <span className="w-5 h-5 border border-border rounded-full flex items-center justify-center text-[10px]">3</span> Confirm
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-text-muted opacity-60">
            <Lock size={14} className="opacity-40" /> Secure Checkout
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">
        
        {/* LEFT FORM */}
        <div className="lg:col-span-3">
          <div className="bg-bg-white rounded-0 p-8 md:p-12 border border-border shadow-sm">
            <h2 className="font-heading font-bold text-[24px] text-text mb-10 uppercase tracking-widest text-center md:text-left">Shipping Details</h2>

            <div className="flex flex-col gap-10">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-text mb-3 tracking-[2px] font-body uppercase">Full Name *</label>
                <input 
                  type="text" 
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full bg-surface border ${errors.name ? 'border-red-500' : 'border-border-input focus:border-primary'} rounded-[3px] px-5 py-4 outline-none transition-all font-body text-[15px] text-text placeholder:opacity-30`}
                />
                {errors.name && <p className="text-red-500 text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-bold text-text tracking-[2px] font-body uppercase">Email Address</label>
                  <span className="text-text-muted text-[9px] uppercase tracking-widest font-bold opacity-40">Optional</span>
                </div>
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full bg-surface border ${errors.email ? 'border-red-500' : 'border-border-input focus:border-primary'} rounded-[3px] px-5 py-4 outline-none transition-all font-body text-[15px] text-text placeholder:opacity-30`}
                />
                {errors.email && <p className="text-red-500 text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.email}</p>}
                
                <div className="bg-surface rounded-[2px] px-5 py-4 mt-4 flex items-start gap-4 border border-border">
                  <Mail size={18} className="opacity-40 mt-0.5 text-text" />
                  <div>
                    <p className="text-text text-[12px] font-bold uppercase tracking-wide font-body">
                      Order Tracking Updates
                    </p>
                    <p className="text-text-muted text-[13px] mt-1 font-body opacity-80">
                      Receive tracking numbers and order status via email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-text mb-3 tracking-[2px] font-body uppercase">Contact Number *</label>
                <input 
                  type="tel" 
                  value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="03XXXXXXXXX"
                  maxLength={11}
                  className={`w-full bg-surface border ${errors.phone ? 'border-red-500' : 'border-border-input focus:border-primary'} rounded-[3px] px-5 py-4 outline-none transition-all font-mono text-[16px] text-text placeholder:opacity-30 tracking-widest`}
                />
                {errors.phone ? (
                  <p className="text-red-500 text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.phone}</p>
                ) : (
                  <p className="text-text-muted text-[11px] mt-2 font-body opacity-50 uppercase tracking-widest">We will call to confirm before shipping</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-[11px] font-bold text-text mb-3 tracking-[2px] font-body uppercase">Select City *</label>
                <div className="relative">
                  <select 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    className={`w-full bg-surface border ${errors.city ? 'border-red-500' : 'border-border-input focus:border-primary'} rounded-[3px] px-5 py-4 outline-none transition-all appearance-none pr-12 cursor-pointer font-body text-[15px] text-text`}
                  >
                    <option value="" disabled className="bg-bg-white">Select a city</option>
                    <option value="Karachi" className="bg-bg-white">Karachi</option>
                    <option value="Lahore" className="bg-bg-white">Lahore</option>
                    <option value="Islamabad" className="bg-bg-white">Islamabad</option>
                    <option value="Rawalpindi" className="bg-bg-white">Rawalpindi</option>
                    <option value="Faisalabad" className="bg-bg-white">Faisalabad</option>
                    <option value="Multan" className="bg-bg-white">Multan</option>
                    <option value="Other" className="bg-bg-white">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <ChevronDown size={18} className="text-text" />
                  </div>
                </div>
                {errors.city && <p className="text-red-500 text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.city}</p>}
                
                {city && (
                  <div className="inline-flex items-center gap-2 mt-4 bg-primary-tint text-primary text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-[2px] border border-primary/10 animate-slideUp">
                    <Truck size={14} className="opacity-60" /> Est. {getDeliveryEstimate(city)}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold text-text mb-3 tracking-[2px] font-body uppercase">Full Shipping Address *</label>
                <textarea 
                  rows={4}
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Apartment, House No., Street, Area"
                  className={`w-full bg-surface border ${errors.address ? 'border-red-500' : 'border-border-input focus:border-primary'} rounded-[3px] px-5 py-4 outline-none transition-all resize-none font-body text-[15px] text-text placeholder:opacity-30 leading-relaxed`}
                />
                {errors.address && <p className="text-red-500 text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.address}</p>}
              </div>

              {/* Notes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-bold text-text tracking-[2px] font-body uppercase">Special Instructions</label>
                  <span className="text-text-muted text-[9px] uppercase tracking-widest font-bold opacity-40">Optional</span>
                </div>
                <textarea 
                  rows={2}
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, handle with care..."
                  className="w-full bg-surface border border-border-input focus:border-primary rounded-[3px] px-5 py-4 outline-none transition-all resize-none font-body text-[15px] text-text placeholder:opacity-30 leading-relaxed"
                />
              </div>

            </div>
          </div>

          <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-[3px] p-6 flex items-center gap-5 shadow-sm transition-colors">
            <div className="w-14 h-14 bg-bg-white/50 rounded-0 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 border border-green-500/10">
              <Banknote size={28} />
            </div>
            <div>
              <h3 className="font-body font-bold text-green-600 dark:text-green-400 text-[12px] uppercase tracking-[2px]">Cash on Delivery Available</h3>
              <p className="text-green-600/80 dark:text-green-400/80 text-[14px] mt-1 font-body leading-relaxed">
                Experience risk-free shopping. Pay only when your premium furniture arrives at your doorstep.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="hidden md:flex mt-12 w-full bg-primary text-white py-6 rounded-[3px] font-bold text-[15px] font-body uppercase tracking-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-primary-dark hover:-translate-y-1 active:scale-95 items-center justify-center gap-4 relative"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Initializing...
              </>
            ) : (
              `Confirm Order — ${totalPrice.toLocaleString('en-PK')} PKR`
            )}
          </button>

          {submitError && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-[2px] p-6 mt-6 animate-slideUp">
               <p className="text-red-500 text-[13px] font-bold uppercase tracking-wide font-body">{submitError}</p>
               <a 
                 href={whatsappOrderUrl()} 
                 target="_blank" rel="noopener noreferrer"
                 className="text-green-600 dark:text-green-400 font-bold text-[12px] mt-4 uppercase tracking-[2px] inline-flex items-center gap-2 hover:underline font-body"
               >
                 Order via WhatsApp <ArrowRight size={14} strokeWidth={3} />
               </a>
             </div>
          )}

        </div>

        {/* RIGHT ORDER SUMMARY */}
        <div className="lg:col-span-2 relative">
          <div className="lg:sticky lg:top-32 bg-bg-white rounded-0 border border-border overflow-hidden shadow-sm transition-colors">
            
            <div className="bg-surface px-8 py-5 border-b border-border flex items-center transition-colors">
              <h2 className="font-heading font-bold text-text text-[18px] uppercase tracking-widest">Your Items</h2>
              <span className="text-[10px] font-bold text-primary bg-primary-tint px-3 py-1 rounded-[2px] ml-auto uppercase tracking-widest">
                {items.length} Units
              </span>
            </div>

            <div className="px-8 py-6 custom-scrollbar max-h-[50vh] overflow-y-auto">
              {items.map(item => {
                const price = item.sale_price ?? item.price_pkr
                return (
                  <div key={item.id} className="flex items-center gap-5 mb-6 last:mb-0 border-b border-border pb-6 last:border-0 last:pb-0 transition-colors">
                    <div className="w-16 h-16 rounded-0 bg-surface flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-border">
                      {item.images && item.images.length > 0 ? (
                        <Image src={item.images[0]} alt={item.name} fill className="object-contain p-1" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-text">
                          {getCategoryEmoji(item.category)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-text line-clamp-1 font-heading">{item.name}</p>
                      <p className="text-[12px] font-body text-text-muted mt-1 opacity-60 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[15px] font-bold text-primary font-body flex-shrink-0">
                      { (price * item.quantity).toLocaleString('en-PK') }
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="px-8 pb-6 pt-6 border-t border-border bg-surface/50 transition-colors">
              <div className="flex justify-between text-[14px] mb-3 font-body">
                <span className="text-text-muted font-semibold opacity-60">Subtotal</span>
                <span className="text-text font-bold">{totalPrice.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-[14px] mb-4 font-body">
                <span className="text-text-muted font-semibold opacity-60">Premium Shipping</span>
                <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-widest text-[11px]">Free</span>
              </div>
              <div className="border-t border-border my-4"></div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-body font-bold text-text-muted uppercase tracking-[3px] text-[11px] opacity-60">Total</span>
                <span className="font-heading font-bold text-[28px] text-primary transition-colors">
                  {totalPrice.toLocaleString('en-PK')}
                </span>
              </div>

              {/* Trust badges — inside the card so they stay below items on mobile */}
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-6 transition-colors">
                <div className="bg-surface rounded-[2px] p-3 text-center border border-border flex flex-col items-center gap-2">
                  <Lock size={18} className="opacity-40 text-text" />
                  <span className="text-[9px] uppercase tracking-[2px] font-bold text-text-muted">Secure</span>
                </div>
                <div className="bg-surface rounded-[2px] p-3 text-center border border-border flex flex-col items-center gap-2">
                  <Package size={18} className="opacity-40 text-text" />
                  <span className="text-[9px] uppercase tracking-[2px] font-bold text-text-muted">Insured</span>
                </div>
                <div className="bg-surface rounded-[2px] p-3 text-center border border-border flex flex-col items-center gap-2">
                  <RotateCcw size={18} className="opacity-40 text-text" />
                  <span className="text-[9px] uppercase tracking-[2px] font-bold text-text-muted">7-Day</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-white border-t border-border p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-text-muted font-bold text-[10px] uppercase tracking-[2px] opacity-60">Total</span>
            <span className="font-heading font-bold text-[22px] text-primary">{totalPrice.toLocaleString('en-PK')} PKR</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-white px-8 py-4 rounded-[3px] font-bold text-[13px] font-body uppercase tracking-[2px] transition-all disabled:opacity-50 active:scale-95 flex justify-center items-center gap-3 shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>

    </main>
  )
}
