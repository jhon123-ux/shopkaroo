'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useCartStore from '@/lib/cartStore'
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Sofa,
  Bed,
  Archive,
  Utensils,
  Box
} from 'lucide-react'
import { getSessionId } from '@/lib/session-id'
import { saveAbandonedCheckout } from '@/app/actions/abandoned-checkout'

const formatPrice = (price: number) => 'Rs. ' + price.toLocaleString('en-PK')

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'living-room': return <Sofa className="w-10 h-10" />
    case 'bedroom': return <Bed className="w-10 h-10" />
    case 'office': return <Archive className="w-10 h-10" />
    case 'dining': return <Utensils className="w-10 h-10" />
    default: return <Box className="w-10 h-10" />
  }
}

export default function CartPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore()

  const total = getTotalPrice()
  const draftItems = items.map(item => ({
    product_id: item.id,
    name: item.name,
    price: item.sale_price ?? item.price_pkr,
    quantity: item.quantity,
    image_url: item.images?.[0]
  }))

  useEffect(() => {
    setMounted(true)
  }, [])

  // Trigger: user visits cart with items (works for guests too)
  useEffect(() => {
    if (items && items.length > 0) {
      const sessionId = getSessionId()
      saveAbandonedCheckout({
        sessionId,
        cartItems: draftItems,
        cartTotal: total,
        reachedStep: 'cart',
      })
      console.log('[CART] abandoned checkout saved, session:', sessionId?.slice(0, 8))
    }
  }, [])

  // Also save when cart contents change
  useEffect(() => {
    if (items && items.length > 0) {
      const sessionId = getSessionId()
      saveAbandonedCheckout({
        sessionId,
        cartItems: draftItems,
        cartTotal: total,
        reachedStep: 'cart',
      })
    }
  }, [items])

  if (!mounted) return null

  // EMPTY CART STATE
  if (items.length === 0) {
    return (
      <main className="bg-background min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32 transition-colors duration-300">
        <div className="mb-8 opacity-20 select-none grayscale text-text">
          <ShoppingBag size={64} strokeWidth={1} />
        </div>
        <h1 className="text-[32px] font-bold font-heading text-text mb-4">
          Your Collection is Empty
        </h1>
        <p className="text-text-muted font-body text-base max-w-sm mx-auto opacity-70 mb-10">
          Discover our curated pieces and start building your dream home today.
        </p>
        <button 
          onClick={() => router.push('/furniture/living-room')}
          className="bg-primary text-white px-12 py-4 rounded-[3px] font-bold text-[14px] font-body uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-lg active:scale-95"
        >
          Explore Collection
        </button>
      </main>
    )
  }

  // CART WITH ITEMS
  return (
    <main className="bg-background min-h-screen relative pb-40 md:pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Page Title */}
        <div className="mb-12 border-b border-border pb-8 flex flex-col items-center md:items-start">
          <h1 className="text-[40px] font-bold font-heading text-text">
            My Cart
          </h1>
          <p className="text-text-muted font-body text-[14px] uppercase tracking-[3px] font-semibold opacity-60 mt-2">{getTotalItems()} Items Selected</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT — CART ITEMS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {items.map(item => {
              const price = item.sale_price ?? item.price_pkr
              
              return (
                <div key={item.id} className="bg-bg-white rounded-0 p-6 border border-border flex flex-col sm:flex-row items-center gap-8 w-full relative transition-all duration-300 hover:border-primary/30 shadow-sm">
                  
                  {/* Image area */}
                  <div className="w-28 h-28 flex-shrink-0 bg-surface rounded-0 overflow-hidden relative border border-border transition-colors">
                    {item.images && item.images.length > 0 ? (
                      <Image 
                        src={item.images[0]} 
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center grayscale opacity-10">
                        <span className="flex items-center justify-center">{getCategoryEmoji(item.category)}</span>
                      </div>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[2px] text-primary bg-primary-tint px-3 py-1.5 rounded-[2px] mb-4 font-body">
                      {item.category.replace('-', ' ')}
                    </span>
                    <h3 className="font-heading font-bold text-text text-[18px] md:text-[22px] mb-2 pr-6">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-text-muted font-body opacity-70">
                      {formatPrice(price)} per unit
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-6 justify-center">
                    
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border rounded-[3px] overflow-hidden transition-colors">
                      <button 
                        onClick={() => {
                          const newQty = item.quantity - 1
                          if (newQty < 1) return
                          updateQuantity(item.id, newQty)
                          saveAbandonedCheckout({
                            sessionId: getSessionId(),
                            cartItems: items.map(i => i.id === item.id ? {...i, quantity: newQty} : i).map(i => ({
                              product_id: i.id,
                              name: i.name,
                              price: i.sale_price ?? i.price_pkr,
                              quantity: i.quantity,
                              image_url: i.images?.[0]
                            })),
                            cartTotal: total,
                            reachedStep: 'cart'
                          })
                        }}
                        className="w-10 h-10 flex items-center justify-center hover:bg-background text-text transition-colors bg-bg-white font-body text-lg border-r border-border"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="font-bold text-text w-12 text-center font-body text-[14px]">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => {
                          const newQty = item.quantity + 1
                          updateQuantity(item.id, newQty)
                          saveAbandonedCheckout({
                            sessionId: getSessionId(),
                            cartItems: items.map(i => i.id === item.id ? {...i, quantity: newQty} : i).map(i => ({
                              product_id: i.id,
                              name: i.name,
                              price: i.sale_price ?? i.price_pkr,
                              quantity: i.quantity,
                              image_url: i.images?.[0]
                            })),
                            cartTotal: total,
                            reachedStep: 'cart'
                          })
                        }}
                        className="w-10 h-10 flex items-center justify-center hover:bg-background text-text transition-colors bg-bg-white font-body text-lg border-l border-border"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="text-center sm:text-right">
                      <p className="font-heading font-bold text-primary text-[20px]">
                        {formatPrice(price * item.quantity)}
                      </p>
                      <button 
                        onClick={async () => {
                          const remainingItems = items.filter(i => i.id !== item.id)
                          removeItem(item.id)
                          
                          saveAbandonedCheckout({
                            sessionId: getSessionId(),
                            cartItems: remainingItems.map(i => ({
                              product_id: i.id,
                              name: i.name,
                              price: i.sale_price ?? i.price_pkr,
                              quantity: i.quantity,
                              image_url: i.images?.[0]
                            })),
                            cartTotal: total - (price * item.quantity),
                            reachedStep: 'cart'
                          })
                        }}
                        className="text-text-muted text-[11px] hover:text-red-500 cursor-pointer font-bold mt-2 uppercase tracking-[2px] transition-colors font-body flex items-center gap-1 group/remove"
                      >
                        <Trash2 size={12} className="group-hover/remove:text-[#DC2626]" /> 
                        <span className="underline underline-offset-4">Remove</span>
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}

            {items.length > 0 && (
              <button 
                onClick={async () => {
                  clearCart()
                  // Optional: clearAbandonedCheckout(getSessionId())? 
                  // Usually we keep it until recovery or order.
                }}
                className="text-text-muted text-[12px] font-bold hover:text-red-500 transition-colors cursor-pointer w-max uppercase tracking-[2px] font-body self-center md:self-start py-2 flex items-center gap-2 group/clear"
              >
                <Trash2 size={14} className="group-hover/clear:text-red-500" /> Clear Collection
              </button>
            )}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="lg:col-span-4 lg:relative">
            <div className="lg:sticky lg:top-28 bg-surface rounded-0 p-8 border border-border shadow-sm transition-colors duration-300">
              <h2 className="font-heading font-bold text-[22px] text-text mb-8 uppercase tracking-widest text-center">Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[14px] font-body">
                  <span className="text-text-muted font-semibold opacity-70">Subtotal ({getTotalItems()} Items)</span>
                  <span className="text-text font-bold">{formatPrice(getTotalPrice())}</span>
                </div>
                
                <div className="flex justify-between text-[14px] font-body">
                  <span className="text-text-muted font-semibold opacity-70">Premium Delivery</span>
                  <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-wider text-[11px]">Complimentary</span>
                </div>
              </div>

              <div className="border-t border-border mb-8 transition-colors"></div>

              <div className="flex flex-col gap-2 mb-10 items-center">
                <span className="font-body font-bold text-[11px] text-text-muted uppercase tracking-[3px] opacity-60">Grand Total</span>
                <span className="font-heading font-bold text-[36px] text-primary leading-none transition-colors">{formatPrice(getTotalPrice())}</span>
              </div>

              {/* COD notice */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-[3px] p-5 mb-8 flex items-start gap-4 transition-colors">
                <Check size={18} className="text-green-600 dark:text-green-400 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="font-bold text-green-600 dark:text-green-400 text-[12px] font-body uppercase tracking-wider">Cash on Delivery</p>
                  <p className="text-green-600/70 dark:text-green-400/70 text-[13px] mt-1 leading-relaxed font-body">
                    Pay at your doorstep. No prepayment required.
                  </p>
                </div>
              </div>

              <button 
                onClick={async () => {
                   console.log('[CART PAGE] Complete Order clicked')
                   saveAbandonedCheckout({
                    sessionId: getSessionId(),
                    cartItems: draftItems,
                    cartTotal: total,
                    reachedStep: 'checkout'
                   })
                   router.push('/checkout')
                }}
                className="hidden md:flex w-full bg-primary text-white py-5 rounded-[3px] font-bold text-[14px] font-body uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-lg active:scale-95 items-center justify-center gap-3"
              >
                Complete Order
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              
              <Link 
                href="/furniture/living-room"
                className="hidden md:flex w-full items-center justify-center gap-2 text-text-muted text-[12px] font-bold hover:text-primary transition-colors mt-6 uppercase tracking-[1px] font-body"
              >
                <ArrowLeft size={14} /> Back to Gallery
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* MOBILE BOTTOM CHECKOUT */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-white border-t border-border px-6 pt-5 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] animate-slideUp transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-text-muted font-bold text-[10px] uppercase tracking-[2px] opacity-60">Total</span>
            <span className="font-heading font-bold text-[24px] text-primary">{formatPrice(getTotalPrice())}</span>
          </div>
          <button 
            onClick={() => {
              saveAbandonedCheckout({
                sessionId: getSessionId(),
                cartItems: draftItems,
                cartTotal: total,
                reachedStep: 'checkout'
              })
              router.push('/checkout')
            }}
            className="bg-primary text-white px-8 py-4 rounded-[3px] font-bold text-[13px] font-body uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            Checkout
          </button>
        </div>
      </div>

    </main>
  )
}
