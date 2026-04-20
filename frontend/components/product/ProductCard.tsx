'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useCartStore from '@/lib/cartStore'
import useAuthStore from '@/lib/authStore'
import useWishlistStore from '@/lib/wishlistStore'
import { Heart, ShoppingCart, Check, Eye, Share2, Archive } from 'lucide-react'
import QuickViewModal from './QuickViewModal'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price_pkr: number
  sale_price?: number | null
  category: string
  images: string[]
  created_at: string
  stock_qty: number
  description?: string
  material?: string
}

export default function ProductCard({ product }: { product: ProductCardProps }) {
  const { addItem } = useCartStore()
  const { user } = useAuthStore()
  const { toggleItem, hasItem } = useWishlistStore()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('Added to cart')
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
  const isLiked = hasItem(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_pkr: product.price_pkr,
      sale_price: product.sale_price ?? null,
      category: product.category,
      images: product.images || [],
      quantity: 1
    })
    setToastMsg('Added to cart')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    toggleItem(product.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id })
      })
    } catch (err) {
      console.error('Failed to toggle like', err)
      toggleItem(product.id)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${window.location.origin}/product/${product.slug}`
    navigator.clipboard.writeText(url)
    setToastMsg('Link copied to clipboard')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsQuickViewOpen(true)
  }

  const isSale = product.sale_price !== null && product.sale_price !== undefined
  const createdDate = new Date(product.created_at)
  const isNew = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`

  return (
    <>
      <Link href={`/product/${product.slug}`} className="block h-full cursor-pointer group bg-brand-offwhite rounded-[4px] border border-border overflow-hidden hover:border-primary hover:shadow-md transition-all duration-300">
        
        {/* TOP — Square Image Area */}
        <div 
          className="w-full aspect-square relative overflow-hidden flex items-center justify-center bg-surface"
        >
          {product.images && product.images.length > 0 ? (
            <Image 
              src={product.images[0]} 
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
              loading="lazy"
              className="group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-text-muted opacity-40 group-hover:scale-[1.04] transition-transform duration-500 select-none">
              <Archive size={64} strokeWidth={1} />
            </div>
          )}

        {/* Action Buttons Stack (Top Right) */}
        <div className="absolute top-3 right-3 z-40 flex flex-col gap-2">
          {/* Like Button */}
          <button 
            onClick={handleLike}
            className={`bg-white border w-[32px] h-[32px] rounded-0 flex items-center justify-center transition-all shadow-sm ${
              isLiked 
                ? 'text-primary border-primary opacity-100' 
                : 'border-border text-text-muted hover:text-primary hover:border-primary opacity-0 group-hover:opacity-100'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          {/* Quick View Button */}
          <button 
            onClick={handleQuickView}
            className="w-[32px] h-[32px] bg-white border border-border rounded-0 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 delay-[0ms]"
            title="Quick View"
          >
            <Eye size={14} />
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="w-[32px] h-[32px] bg-white border border-border rounded-0 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 delay-[50ms]"
            title="Share Product"
          >
            <Share2 size={14} />
          </button>
        </div>

        {/* Top left badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          {isSale ? (
            <span className="bg-white text-primary text-[10px] px-2 py-1 rounded-0 font-body font-bold tracking-[2px] uppercase shadow-sm">
              SALE
            </span>
          ) : isNew ? (
            <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-0 font-body font-bold tracking-[2px] uppercase shadow-sm">
              NEW
            </span>
          ) : null}
          <div className="inline-flex items-center gap-1.5 bg-[#2D6A4F] text-white text-[9px] px-2 py-1 rounded-[1px] font-body font-bold mt-1 shadow-sm">
            <Check size={9} strokeWidth={4} className="text-white" /> COD Available
          </div>
        </div>
      </div>

        {/* BOTTOM — Product Info */}
        <div className="p-4 flex flex-col items-start bg-brand-offwhite">


          <h3 className="font-heading font-semibold text-[15px] text-brand-black line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex flex-col mb-3">
            {isSale ? (
               <div className="flex flex-col">
                 <span className="text-primary font-bold text-[16px] md:text-[17px] font-heading leading-tight">
                   {formatPrice(product.sale_price!)}
                 </span>
                 <span className="text-text-muted text-[11px] md:text-[12px] font-body line-through opacity-50">
                   {formatPrice(product.price_pkr)}
                 </span>
               </div>
            ) : (
               <span className="text-brand-black font-bold text-[16px] md:text-[17px] font-heading leading-tight">
                 {formatPrice(product.price_pkr)}
               </span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full py-2.5 border border-border text-text-muted bg-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-[2px] text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2.5"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>

        {showToast && (
          <div className="fixed top-24 right-6 z-[500] bg-brand-black text-white px-5 py-3.5 rounded-0 shadow-2xl flex items-center gap-3 animate-slideUp border-l-4 border-primary">
            <Check size={16} className="text-green-500" strokeWidth={3} /> 
            <span className="text-[13px] font-body font-semibold text-white">{toastMsg}</span>
          </div>
        )}
      </Link>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={product} 
      />
    </>
  )
}
