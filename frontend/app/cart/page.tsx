'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useCartStore from '@/lib/cartStore'

const formatPrice = (price: number) => 'Rs. ' + price.toLocaleString('en-PK')

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'living-room': return '🛋️'
    case 'bedroom': return '🛏️'
    case 'office': return '🪑'
    case 'dining': return '🍽️'
    default: return '🪴'
  }
}

export default function CartPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // EMPTY CART STATE
  if (items.length === 0) {
    return (
      <main className="bg-white min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="text-8xl mb-6 select-none">🛒</div>
        <h1 className="text-3xl font-extrabold font-heading text-[#1A1A2E]">
          Your cart is empty
        </h1>
        <p className="text-[#6B7280] mt-3 mb-8">
          Looks like you haven't added anything yet
        </p>
        <button 
          onClick={() => router.push('/furniture/living-room')}
          className="bg-[#6C3FC5] text-white px-10 py-4 rounded-2xl font-bold text-lg font-heading hover:bg-[#5530A8] transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          Start Shopping
        </button>
      </main>
    )
  }

  // CART WITH ITEMS
  return (
    <main className="bg-white min-h-screen relative pb-32 md:pb-10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Page Title */}
        <h1 className="text-3xl font-extrabold font-heading text-[#1A1A2E] mb-2 shadow-sm drop-shadow-sm">
          My Cart
        </h1>
        <p className="text-[#6B7280] text-base mb-8">{getTotalItems()} items</p>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT — CART ITEMS */}
          <div className="md:col-span-2 flex flex-col">
            {items.map(item => {
              const price = item.sale_price ?? item.price_pkr
              
              return (
                <div key={item.id} className="bg-white rounded-2xl p-5 border border-[#E5E0F5] flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4 w-full relative hover:shadow-sm transition-shadow">
                  
                  {/* Image area */}
                  <div className="w-24 h-24 flex-shrink-0 bg-[#F7F5FF] rounded-xl overflow-hidden relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EDE6FA, #F7F5FF)' }}>
                    {item.images && item.images.length > 0 ? (
                      <Image 
                        src={item.images[0]} 
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-3xl select-none opacity-80">{getCategoryEmoji(item.category)}</span>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="flex-1 w-full">
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest font-bold text-[#6C3FC5] bg-[#EDE6FA] px-2.5 py-1 rounded-full mb-2 border border-[#d5c6f6]">
                      {item.category.replace('-', ' ')}
                    </span>
                    <h3 className="font-heading font-semibold text-[#1A1A2E] text-base line-clamp-1 pr-6 pb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#6B7280] font-medium">
                      {formatPrice(price)} per item
                    </p>
                  </div>

                  {/* Desktop Right Controls (Responsive stacked on mobile) */}
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-5 mt-2 sm:mt-0">
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-[#E5E0F5] flex items-center justify-center hover:border-[#6C3FC5] text-lg font-bold transition-colors bg-white text-[#1A1A2E]"
                      >
                        -
                      </button>
                      <div className="font-bold text-[#1A1A2E] w-8 text-center bg-transparent font-heading">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-[#E5E0F5] flex items-center justify-center hover:border-[#6C3FC5] text-lg font-bold transition-colors bg-white text-[#1A1A2E]"
                      >
                        +
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="text-right sm:min-w-[100px] flex flex-col sm:items-end">
                      <p className="font-bold text-[#6C3FC5] text-lg font-heading">
                        {formatPrice(price * item.quantity)}
                      </p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-[#DC2626] text-xs hover:underline cursor-pointer font-medium mt-1 uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}

            {items.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-[#DC2626] text-sm font-semibold hover:underline cursor-pointer mt-2 w-max px-2 py-1"
              >
                Clear all items
              </button>
            )}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="md:col-span-1 relative mt-4 md:mt-0">
            <div className="md:sticky md:top-24 bg-white rounded-2xl p-6 border border-[#E5E0F5] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-6 border-b border-[#E5E0F5] pb-4">Order Summary</h2>
              
              <div className="flex justify-between text-sm mb-4">
                <span className="text-[#6B7280] font-medium">Subtotal ({getTotalItems()} items)</span>
                <span className="text-[#1A1A2E] font-bold">{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span className="text-[#6B7280] font-medium">Delivery</span>
                <span className="text-[#4CAF7D] font-bold">Free</span>
              </div>

              <div className="border-t border-[#E5E0F5] my-5"></div>

              <div className="flex justify-between mb-8 items-center bg-[#F7F5FF] p-3 rounded-lg border border-[#E5E0F5]">
                <span className="font-heading font-bold text-lg text-[#1A1A2E]">Total</span>
                <span className="font-heading font-extrabold text-2xl text-[#6C3FC5]">{formatPrice(getTotalPrice())}</span>
              </div>

              {/* COD notice */}
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                <span className="text-[#4CAF7D] text-lg mt-0.5 font-bold">✓</span>
                <div>
                  <p className="font-bold text-[#166534] text-sm">Cash on Delivery</p>
                  <p className="text-[#166534]/80 text-[13px] mt-1 leading-snug">
                    Pay when your furniture arrives. No online payment required.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="hidden md:flex w-full bg-[#6C3FC5] text-white py-4 rounded-2xl font-bold text-lg font-heading hover:bg-[#5530A8] transition-all shadow-md hover:-translate-y-0.5 active:scale-95 items-center justify-center gap-2"
              >
                Proceed to Checkout
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
              
              <button 
                onClick={() => router.push('/furniture/living-room')}
                className="hidden md:block w-full text-center text-[#6C3FC5] text-sm font-semibold hover:underline mt-4"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MOBILE DEFAULT FIX FOR STICKY BOTTOM CHECKOUT */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E0F5] px-4 pt-3 pb-5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] animate-slideUp">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[#6B7280] font-semibold text-sm">Total</span>
          <span className="font-heading font-extrabold text-xl text-[#6C3FC5]">{formatPrice(getTotalPrice())}</span>
        </div>
        <button 
          onClick={() => router.push('/checkout')}
          className="w-full bg-[#6C3FC5] text-white py-3.5 rounded-xl font-bold text-base font-heading hover:bg-[#5530A8] transition-all focus:ring active:scale-95 flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>

    </main>
  )
}
