'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useCartStore from '@/lib/cartStore'
import useAuthStore from '@/lib/authStore'
import useWishlistStore from '@/lib/wishlistStore'
import { Heart, ShoppingCart, Check } from 'lucide-react'

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
}

export default function ProductCard({ product }: { product: ProductCardProps }) {
  const { addItem } = useCartStore()
  const { user } = useAuthStore()
  const { toggleItem, hasItem } = useWishlistStore()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  
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
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    // Optimistic UI toggle
    toggleItem(product.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id })
      })
    } catch (err) {
      console.error('Failed to toggle like', err)
      // Revert optimism if it failed
      toggleItem(product.id)
    }
  }

  const isSale = product.sale_price !== null && product.sale_price !== undefined

  const createdDate = new Date(product.created_at)
  const isNew = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`

  const getEmoji = (category: string) => {
    switch (category) {
      case 'living-room': return '🛋️'
      case 'bedroom': return '🛏️'
      case 'office': return '🪑'
      case 'dining': return '🍽️'
      default: return '🪴'
    }
  }

  return (
    <Link href={`/product/${product.slug}`} className="block h-full cursor-pointer group bg-white rounded-[4px] border border-[#E8E2D9] overflow-hidden hover:border-[#783A3A] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      
      {/* TOP — Square Image Area */}
      <div 
        className="w-full h-65 relative overflow-hidden flex items-center justify-center bg-[#F2EDE6]"
      >
        {product.images && product.images.length > 0 ? (
          <Image 
            src={product.images[0]} 
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="text-7xl opacity-60 group-hover:scale-[1.04] transition-transform duration-500 select-none pointer-events-none">
            {getEmoji(product.category)}
          </div>
        )}

        {/* Top left badge stack */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          {isSale ? (
            <span className="bg-[#1C1410] text-white text-[10px] px-[10px] py-[4px] rounded-0 font-body font-bold tracking-[2px] uppercase shadow-sm">
              SALE
            </span>
          ) : isNew ? (
            <span className="bg-[#783A3A] text-white text-[10px] px-[10px] py-[4px] rounded-0 font-body font-bold tracking-[2px] uppercase shadow-sm">
              NEW
            </span>
          ) : null}

          {/* COD Badge relocated from bottom */}
          <div className="inline-flex items-center gap-1 bg-[#EBF7F0]/90 backdrop-blur-sm text-[#2D6A4F] text-[10px] px-2 py-[2px] rounded-[2px] border border-[rgba(45,106,79,0.20)] font-body font-bold shadow-sm">
            <Check size={10} strokeWidth={3} /> COD
          </div>
        </div>

        {/* Top right Wishlist button */}
        <button 
          onClick={handleLike}
          className={`absolute top-3 right-3 z-10 bg-white/92 border w-[34px] h-[34px] rounded-[3px] flex items-center justify-center transition-all shadow-sm ${
            isLiked 
              ? 'text-[#783A3A] border-[#783A3A] opacity-100' 
              : 'border-[#E8E2D9] text-[#6B6058] hover:text-[#783A3A] hover:border-[#783A3A] opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isLiked ? '#783A3A' : 'none'} />
        </button>
      </div>

      {/* BOTTOM — Product Info */}
      <div className="p-[14px_16px_16px] flex flex-col items-start">
        
        {/* Category tag */}
        <span className="text-[10px] font-semibold font-body tracking-[2px] uppercase text-[#6B6058] mb-[6px] block">
          {product.category.replace('-', ' ')}
        </span>

        {/* Product name */}
        <h3 className="font-heading font-semibold text-[16px] text-[#1C1410] line-clamp-2 leading-[1.35] mb-[10px]">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-1">
          {isSale ? (
             <>
               <span className="text-[#783A3A] font-bold text-[18px] font-heading">
                 {formatPrice(product.sale_price!)}
               </span>
               <span className="text-[#A89890] text-[13px] font-body line-through">
                 {formatPrice(product.price_pkr)}
               </span>
             </>
          ) : (
             <span className="text-[#1C1410] font-bold text-[18px] font-heading">
               {formatPrice(product.price_pkr)}
             </span>
          )}
        </div>


        {/* Add to Cart button — Always visible now */}
        <button 
          onClick={handleAddToCart}
          className="w-full mt-3 py-2.5 border border-[#E8E2D9] text-[#6B6058] group-hover:bg-[#783A3A] group-hover:text-white group-hover:border-[#783A3A] transition-all duration-200 rounded-sm text-sm font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingCart size={15} /> Add to Cart
        </button>
      </div>

      {showToast && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1C1410] text-white px-4 py-3 rounded-[3px] shadow-xl flex items-center gap-2 animate-slideUp">
          <Check size={16} className="text-[#2D6A4F]" strokeWidth={3} /> Added to cart
        </div>
      )}

    </Link>
  )
}
