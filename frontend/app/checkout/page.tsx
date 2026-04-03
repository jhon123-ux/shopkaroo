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

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()

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
        customer_email: email || undefined,
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
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : ''
      
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
    const msg = `Hi Shopkaroo! I'd like to place an order:
Items: ${itemsList}
Total: Rs. ${totalPrice.toLocaleString()}
Name: ${name}
Phone: ${phone}
City: ${city}
Address: ${address}`
    return `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`
  }

  return (
    <main className="bg-[#F7F5FF] min-h-screen pb-32 md:pb-10 font-body">
      
      {/* HEADER */}
      <header className="py-4 border-b border-[#E5E0F5] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-[#6C3FC5] font-heading">
            Shopkaroo
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#6C3FC5]">
              <span className="font-bold">✓</span> Cart
            </div>
            <div className="w-12 h-px bg-[#E5E0F5]"></div>
            <div className="flex items-center gap-2 text-sm text-[#6C3FC5] font-semibold">
              <span className="w-4 h-4 rounded-full bg-[#6C3FC5] inline-block"></span> Delivery
            </div>
            <div className="w-12 h-px bg-[#E5E0F5]"></div>
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
              <span className="w-4 h-4 rounded-full border-2 border-[#9CA3AF] inline-block"></span> Confirmed
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
            <span className="text-base">🔒</span> Secure Checkout
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* LEFT FORM */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0F5] shadow-sm">
            <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6">Delivery Information</h2>

            <div className="flex flex-col gap-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ahmed Khan"
                  className={`w-full border ${errors.name ? 'border-[#DC2626] ring-1 ring-[#DC2626]' : 'border-[#E5E0F5] focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5]'} rounded-xl px-4 py-3 outline-none transition-shadow`}
                />
                {errors.name && <p className="text-[#DC2626] text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[#1A1A2E]">Email Address</label>
                  <span className="bg-[#EDE6FA] text-[#6C3FC5] text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ahmed@gmail.com"
                  className={`w-full border ${errors.email ? 'border-[#DC2626] ring-1 ring-[#DC2626]' : 'border-[#E5E0F5] focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5]'} rounded-xl px-4 py-3 outline-none transition-shadow`}
                />
                {errors.email && <p className="text-[#DC2626] text-xs mt-1.5 font-medium">{errors.email}</p>}
                
                <div className="bg-[#F7F5FF] rounded-xl px-4 py-3 mt-3 flex items-start gap-3 border border-[#E5E0F5]">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="text-[#1A1A2E] text-xs font-semibold leading-relaxed">
                      Get your order confirmation & tracking updates via email
                    </p>
                    <p className="text-[#6B7280] text-[11px] mt-0.5">
                      Create an account later to track orders anytime
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="03001234567"
                  maxLength={11}
                  className={`w-full border ${errors.phone ? 'border-[#DC2626] ring-1 ring-[#DC2626]' : 'border-[#E5E0F5] focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5]'} rounded-xl px-4 py-3 outline-none transition-shadow font-mono`}
                />
                {errors.phone ? (
                  <p className="text-[#DC2626] text-xs mt-1.5 font-medium">{errors.phone}</p>
                ) : (
                  <p className="text-[#6B7280] text-xs mt-1.5 font-medium">We'll call to confirm your order</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">City *</label>
                <div className="relative">
                  <select 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    className={`w-full border ${errors.city ? 'border-[#DC2626] ring-1 ring-[#DC2626]' : 'border-[#E5E0F5] focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5]'} rounded-xl px-4 py-3 outline-none transition-shadow bg-white appearance-none pr-10 cursor-pointer`}
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {errors.city && <p className="text-[#DC2626] text-xs mt-1.5 font-medium">{errors.city}</p>}
                
                {city && (
                  <div className="inline-flex items-center gap-1.5 mt-2 bg-[#EDE6FA] text-[#6C3FC5] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#d5c6f6] animate-slideUp">
                    <span className="text-sm">🚚</span> {getDeliveryEstimate(city)}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Full Address *</label>
                <textarea 
                  rows={3}
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="House No., Street, Area, City"
                  className={`w-full border ${errors.address ? 'border-[#DC2626] ring-1 ring-[#DC2626]' : 'border-[#E5E0F5] focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5]'} rounded-xl px-4 py-3 outline-none transition-shadow resize-none`}
                />
                {errors.address && <p className="text-[#DC2626] text-xs mt-1.5 font-medium">{errors.address}</p>}
              </div>

              {/* Notes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[#1A1A2E]">Order Notes</label>
                  <span className="bg-[#EDE6FA] text-[#6C3FC5] text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <textarea 
                  rows={2}
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Special delivery instructions..."
                  className="w-full border border-[#E5E0F5] focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5] rounded-xl px-4 py-3 outline-none transition-shadow resize-none"
                />
              </div>

            </div>
          </div>

          <div className="mt-6 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-[#4CAF7D]/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              💰
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#166534] text-base">Cash on Delivery</h3>
              <p className="text-[#166534]/80 text-sm mt-0.5 leading-snug">
                Pay when your furniture arrives. No card or online payment needed.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="hidden md:flex mt-8 w-full bg-[#6C3FC5] text-white py-4 rounded-2xl font-bold text-lg font-heading hover:bg-[#5530A8] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:-translate-y-0.5 active:scale-95 items-center justify-center gap-3 relative"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Placing your order...
              </>
            ) : (
              `Place Order — Rs. ${totalPrice.toLocaleString('en-PK')}`
            )}
          </button>

          {submitError && (
             <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 mt-4 animate-slideUp">
               <p className="text-[#DC2626] text-sm font-medium">{submitError}</p>
               <a 
                 href={whatsappOrderUrl()} 
                 target="_blank" rel="noopener noreferrer"
                 className="text-[#4CAF7D] font-bold text-sm mt-3 inline-flex items-center gap-1 hover:underline"
               >
                 Or order via WhatsApp <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
               </a>
             </div>
          )}

        </div>

        {/* RIGHT ORDER SUMMARY */}
        <div className="md:col-span-2 relative">
          <div className="sticky top-6 bg-white rounded-2xl border border-[#E5E0F5] overflow-hidden shadow-sm">
            
            <div className="bg-[#F7F5FF] px-6 py-4 border-b border-[#E5E0F5] flex items-center">
              <h2 className="font-heading font-bold text-[#1A1A2E] text-lg">Order Summary</h2>
              <span className="text-xs font-semibold text-[#6C3FC5] bg-[#EDE6FA] px-2 py-0.5 rounded-full ml-auto">
                {items.length} items
              </span>
            </div>

            <div className="px-6 py-4 custom-scrollbar max-h-[40vh] overflow-y-auto">
              {items.map(item => {
                const price = item.sale_price ?? item.price_pkr
                return (
                  <div key={item.id} className="flex items-center gap-4 mb-4 last:mb-0">
                    <div className="w-14 h-14 rounded-xl bg-[#F7F5FF] flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-[#E5E0F5]">
                      {item.images && item.images.length > 0 ? (
                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                      ) : (
                        <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A2E] line-clamp-1">{item.name}</p>
                      <p className="text-xs font-medium text-[#6B7280] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#6C3FC5] font-heading flex-shrink-0">
                      Rs. {(price * item.quantity).toLocaleString('en-PK')}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="px-6 pb-5 pt-4 border-t border-[#E5E0F5] bg-gray-50/50">
              <div className="flex justify-between text-sm mb-2.5">
                <span className="text-[#6B7280] font-medium">Subtotal</span>
                <span className="text-[#1A1A2E] font-semibold">Rs. {totalPrice.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-[#6B7280] font-medium">Delivery</span>
                <span className="text-[#4CAF7D] font-bold">Free</span>
              </div>
              <div className="border-t border-[#E5E0F5] my-4"></div>
              <div className="flex justify-between items-center">
                <span className="font-heading font-black text-[#1A1A2E] text-lg">Total</span>
                <span className="font-heading font-black text-2xl text-[#6C3FC5]">
                  Rs. {totalPrice.toLocaleString('en-PK')}
                </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white rounded-xl p-3 text-center border border-[#E5E0F5] shadow-sm flex flex-col items-center gap-1.5">
              <span className="text-xl">🔒</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B7280]">Secure Order</span>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E5E0F5] shadow-sm flex flex-col items-center gap-1.5">
              <span className="text-xl">📦</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B7280]">Free Packaging</span>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E5E0F5] shadow-sm flex flex-col items-center gap-1.5">
              <span className="text-xl">↩️</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B7280]">7-Day Return</span>
            </div>
          </div>
        </div>
      </form>

      {/* MOBILE BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E0F5] p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#6B7280] font-semibold text-sm">Total</span>
          <span className="font-heading font-extrabold text-lg text-[#6C3FC5]">Rs. {totalPrice.toLocaleString('en-PK')}</span>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#6C3FC5] text-white py-3.5 rounded-xl font-bold text-base font-heading hover:bg-[#5530A8] transition-all disabled:opacity-70 active:scale-95 flex justify-center items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Place Order'
          )}
        </button>
      </div>

    </main>
  )
}
