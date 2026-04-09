'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useCartStore from '@/lib/cartStore'
import Link from 'next/link'
import Image from 'next/image'

const getDeliveryEstimate = (city: string) => {
  const fast = ['Karachi', 'Lahore']
  const medium = ['Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']
  
  if (fast.includes(city)) return '2-3 business days'
  if (medium.includes(city)) return '3-5 business days'
  return '5-7 business days'
}

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'living-room': return '🛋️'
    case 'bedroom': return '🛏️'
    case 'office': return '🪑'
    case 'dining': return '🍽️'
    default: return '🪴'
  }
}

import useAuthStore from '@/lib/authStore'
import { supabase } from '@/lib/supabase'
import { 
  Lock, 
  Banknote, 
  Truck, 
  Check, 
  Mail, 
  ArrowRight, 
  RotateCcw, 
  Package, 
  ChevronDown 
} from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()

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
    <main className="bg-[#FAF7F4] min-h-screen pb-32 md:pb-20 font-body">
      
      {/* HEADER */}
      <header className="py-6 border-b border-[#E8E2D9] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic text-[#1C1410] font-heading">
            Shopkarro
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F]">
              <span className="w-5 h-5 bg-[#EBF7F0] rounded-full flex items-center justify-center text-[10px]">✓</span> Cart
            </div>
            <div className="w-8 h-px bg-[#D4CCC2]"></div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#783A3A]">
              <span className="w-5 h-5 bg-[#783A3A] text-white rounded-full flex items-center justify-center text-[10px]">2</span> Shipping
            </div>
            <div className="w-8 h-px bg-[#D4CCC2]"></div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6B6058] opacity-40">
              <span className="w-5 h-5 border border-[#6B6058] rounded-full flex items-center justify-center text-[10px]">3</span> Confirm
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-[#6B6058] opacity-60">
            <Lock size={14} className="opacity-40" /> Secure Checkout
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">
        
        {/* LEFT FORM */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-0 p-8 md:p-12 border border-[#E8E2D9] shadow-sm">
            <h2 className="font-heading font-bold text-[24px] text-[#1C1410] mb-10 uppercase tracking-widest text-center md:text-left">Shipping Details</h2>

            <div className="flex flex-col gap-10">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Full Name *</label>
                <input 
                  type="text" 
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full border ${errors.name ? 'border-[#DC2626]' : 'border-[#D4CCC2] focus:border-[#783A3A]'} rounded-[3px] px-5 py-4 outline-none transition-all font-body text-[15px] placeholder:opacity-30`}
                />
                {errors.name && <p className="text-[#DC2626] text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-bold text-[#1C1410] uppercase tracking-[2px] font-body">Email Address</label>
                  <span className="text-[#6B6058] text-[9px] uppercase tracking-widest font-bold opacity-40">Optional</span>
                </div>
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full border ${errors.email ? 'border-[#DC2626]' : 'border-[#D4CCC2] focus:border-[#783A3A]'} rounded-[3px] px-5 py-4 outline-none transition-all font-body text-[15px] placeholder:opacity-30`}
                />
                {errors.email && <p className="text-[#DC2626] text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.email}</p>}
                
                <div className="bg-[#FAF7F4] rounded-[2px] px-5 py-4 mt-4 flex items-start gap-4 border border-[#E8E2D9]">
                  <Mail size={18} className="opacity-40 mt-0.5" />
                  <div>
                    <p className="text-[#1C1410] text-[12px] font-bold uppercase tracking-wide font-body">
                      Order Tracking Updates
                    </p>
                    <p className="text-[#6B6058] text-[13px] mt-1 font-body opacity-80">
                      Receive tracking numbers and order status via email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Contact Number *</label>
                <input 
                  type="tel" 
                  value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="03XXXXXXXXX"
                  maxLength={11}
                  className={`w-full border ${errors.phone ? 'border-[#DC2626]' : 'border-[#D4CCC2] focus:border-[#783A3A]'} rounded-[3px] px-5 py-4 outline-none transition-all font-mono text-[16px] placeholder:opacity-30 tracking-widest`}
                />
                {errors.phone ? (
                  <p className="text-[#DC2626] text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.phone}</p>
                ) : (
                  <p className="text-[#6B6058] text-[11px] mt-2 font-body opacity-50 uppercase tracking-widest">We will call to confirm before shipping</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Select City *</label>
                <div className="relative">
                  <select 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    className={`w-full border ${errors.city ? 'border-[#DC2626]' : 'border-[#D4CCC2] focus:border-[#783A3A]'} rounded-[3px] px-5 py-4 outline-none transition-all bg-white appearance-none pr-12 cursor-pointer font-body text-[15px]`}
                  >
                    <option value="" disabled>Select a city</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <ChevronDown size={18} className="text-[#1C1410]" />
                  </div>
                </div>
                {errors.city && <p className="text-[#DC2626] text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.city}</p>}
                
                {city && (
                  <div className="inline-flex items-center gap-2 mt-4 bg-[#F5E8E8] text-[#783A3A] text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-[2px] border border-[rgba(120,58,58,0.1)] animate-slideUp">
                    <Truck size={14} className="opacity-60" /> Est. {getDeliveryEstimate(city)}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Full Shipping Address *</label>
                <textarea 
                  rows={4}
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Apartment, House No., Street, Area"
                  className={`w-full border ${errors.address ? 'border-[#DC2626]' : 'border-[#D4CCC2] focus:border-[#783A3A]'} rounded-[3px] px-5 py-4 outline-none transition-all resize-none font-body text-[15px] placeholder:opacity-30 leading-relaxed`}
                />
                {errors.address && <p className="text-[#DC2626] text-[12px] mt-2 font-bold uppercase tracking-wide font-body">{errors.address}</p>}
              </div>

              {/* Notes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-bold text-[#1C1410] uppercase tracking-[2px] font-body">Special Instructions</label>
                  <span className="text-[#6B6058] text-[9px] uppercase tracking-widest font-bold opacity-40">Optional</span>
                </div>
                <textarea 
                  rows={2}
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, handle with care..."
                  className="w-full border border-[#D4CCC2] focus:border-[#783A3A] rounded-[3px] px-5 py-4 outline-none transition-all resize-none font-body text-[15px] placeholder:opacity-30 leading-relaxed"
                />
              </div>

            </div>
          </div>

          <div className="mt-8 bg-[#EBF7F0] border border-[rgba(45,106,79,0.1)] rounded-[3px] p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 bg-white/50 rounded-0 flex items-center justify-center text-[#2D6A4F] flex-shrink-0 border border-[#2D6A4F]/10">
              <Banknote size={28} />
            </div>
            <div>
              <h3 className="font-body font-bold text-[#2D6A4F] text-[12px] uppercase tracking-[2px]">Cash on Delivery Available</h3>
              <p className="text-[#2D6A4F]/80 text-[14px] mt-1 font-body leading-relaxed">
                Experience risk-free shopping. Pay only when your premium furniture arrives at your doorstep.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="hidden md:flex mt-12 w-full bg-[#783A3A] text-white py-6 rounded-[3px] font-bold text-[15px] font-body uppercase tracking-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-[#5B2C2C] hover:-translate-y-1 active:scale-95 items-center justify-center gap-4 relative"
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
             <div className="bg-[#FEF2F2] border border-red-100 rounded-[2px] p-6 mt-6 animate-slideUp">
               <p className="text-[#DC2626] text-[13px] font-bold uppercase tracking-wide font-body">{submitError}</p>
               <a 
                 href={whatsappOrderUrl()} 
                 target="_blank" rel="noopener noreferrer"
                 className="text-[#2D6A4F] font-bold text-[12px] mt-4 uppercase tracking-[2px] inline-flex items-center gap-2 hover:underline font-body"
               >
                 Order via WhatsApp <ArrowRight size={14} strokeWidth={3} />
               </a>
             </div>
          )}

        </div>

        {/* RIGHT ORDER SUMMARY */}
        <div className="lg:col-span-2 relative">
          <div className="lg:sticky lg:top-32 bg-white rounded-0 border border-[#E8E2D9] overflow-hidden shadow-sm">
            
            <div className="bg-[#FAF7F4] px-8 py-5 border-b border-[#E8E2D9] flex items-center">
              <h2 className="font-heading font-bold text-[#1C1410] text-[18px] uppercase tracking-widest">Your Items</h2>
              <span className="text-[10px] font-bold text-[#783A3A] bg-[#F5E8E8] px-3 py-1 rounded-[2px] ml-auto uppercase tracking-widest">
                {items.length} Units
              </span>
            </div>

            <div className="px-8 py-6 custom-scrollbar max-h-[50vh] overflow-y-auto">
              {items.map(item => {
                const price = item.sale_price ?? item.price_pkr
                return (
                  <div key={item.id} className="flex items-center gap-5 mb-6 last:mb-0 border-b border-[#FAF7F4] pb-6 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-0 bg-[#F2EDE6] flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-[#E8E2D9]">
                      {item.images && item.images.length > 0 ? (
                        <Image src={item.images[0]} alt={item.name} fill className="object-contain p-1" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1C1410] line-clamp-1 font-heading">{item.name}</p>
                      <p className="text-[12px] font-body text-[#6B6058] mt-1 opacity-60 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[15px] font-bold text-[#783A3A] font-body flex-shrink-0">
                      { (price * item.quantity).toLocaleString('en-PK') }
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="px-8 pb-6 pt-6 border-t border-[#E8E2D9] bg-[#FAF7F4]/50">
              <div className="flex justify-between text-[14px] mb-3 font-body">
                <span className="text-[#6B6058] font-semibold opacity-60">Subtotal</span>
                <span className="text-[#1C1410] font-bold">{totalPrice.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-[14px] mb-4 font-body">
                <span className="text-[#6B6058] font-semibold opacity-60">Premium Shipping</span>
                <span className="text-[#2D6A4F] font-bold uppercase tracking-widest text-[11px]">Free</span>
              </div>
              <div className="border-t border-[#E8E2D9] my-4"></div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-body font-bold text-[#6B6058] uppercase tracking-[3px] text-[11px] opacity-60">Total</span>
                <span className="font-heading font-bold text-[28px] text-[#783A3A]">
                  {totalPrice.toLocaleString('en-PK')}
                </span>
              </div>

              {/* Trust badges — inside the card so they stay below items on mobile */}
              <div className="grid grid-cols-3 gap-3 border-t border-[#E8E2D9] pt-6">
                <div className="bg-[#FAF7F4] rounded-[2px] p-3 text-center border border-[#E8E2D9] flex flex-col items-center gap-2">
                  <Lock size={18} className="opacity-40" />
                  <span className="text-[9px] uppercase tracking-[2px] font-bold text-[#6B6058]">Secure</span>
                </div>
                <div className="bg-[#FAF7F4] rounded-[2px] p-3 text-center border border-[#E8E2D9] flex flex-col items-center gap-2">
                  <Package size={18} className="opacity-40" />
                  <span className="text-[9px] uppercase tracking-[2px] font-bold text-[#6B6058]">Insured</span>
                </div>
                <div className="bg-[#FAF7F4] rounded-[2px] p-3 text-center border border-[#E8E2D9] flex flex-col items-center gap-2">
                  <RotateCcw size={18} className="opacity-40" />
                  <span className="text-[9px] uppercase tracking-[2px] font-bold text-[#6B6058]">7-Day</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-12 left-0 right-0 z-50 bg-white border-t border-[#E8E2D9] p-6 shadow-[0_-10px_30px_rgba(28,20,16,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[#6B6058] font-bold text-[10px] uppercase tracking-[2px] opacity-60">Total</span>
            <span className="font-heading font-bold text-[22px] text-[#783A3A]">{totalPrice.toLocaleString('en-PK')} PKR</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#783A3A] text-white px-8 py-4 rounded-[3px] font-bold text-[13px] font-body uppercase tracking-[2px] transition-all disabled:opacity-50 active:scale-95 flex justify-center items-center gap-3"
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
