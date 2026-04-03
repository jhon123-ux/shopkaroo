'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import useCartStore from '@/lib/cartStore'

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
  const [showToast, setShowToast] = useState(false)

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
    <Link href={`/product/${product.slug}`} className="block h-full cursor-pointer group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      
      {/* TOP — Square Image Area */}
      <div 
        className="w-full h-64 relative overflow-hidden flex items-center justify-center bg-gray-50"
        style={{ background: 'linear-gradient(135deg, #EDE6FA, #F7F5FF)' }}
      >
        {product.images && product.images.length > 0 ? (
          <Image 
            src={product.images[0]} 
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-7xl opacity-60 group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none">
            {getEmoji(product.category)}
          </div>
        )}

        {/* Top left badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isSale ? (
            <span className="bg-[#DC2626] text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold shadow-sm">
              SALE
            </span>
          ) : isNew ? (
            <span className="bg-[#6C3FC5] text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold shadow-sm">
              NEW
            </span>
          ) : null}
        </div>

        {/* Top right Wishlist button */}
        <button 
          onClick={(e) => { e.preventDefault(); /* Wishlist logic later */ }}
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-[#6B7280] hover:text-red-500 opacity-0 md:opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          aria-label="Add to wishlist"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* BOTTOM — Product Info */}
      <div className="p-4 flex flex-col items-start min-h-[148px]">
        
        {/* Row 1 — Product name */}
        <h3 className="font-heading font-semibold text-base text-[#1A1A2E] line-clamp-1 mb-2">
          {product.name}
        </h3>

        {/* Row 2 — Price row */}
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-end gap-2">
            {isSale ? (
               <>
                 <span className="text-[#6C3FC5] font-bold text-lg font-heading">
                   {formatPrice(product.sale_price!)}
                 </span>
                 <span className="text-[#6B7280] text-xs line-through mb-0.5">
                   {formatPrice(product.price_pkr)}
                 </span>
               </>
            ) : (
               <span className="text-[#6C3FC5] font-bold text-lg font-heading">
                 {formatPrice(product.price_pkr)}
               </span>
            )}
          </div>
        </div>

        {/* Row 3 — COD Badge */}
        <div className="mt-1 inline-flex items-center gap-1 bg-[#F0FDF4] text-[#16A34A] text-xs px-2.5 py-1 rounded-full border border-[#BBF7D0] shadow-sm font-medium">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Cash on Delivery
        </div>

        {/* Row 4 — Add to Cart button */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#6C3FC5] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#5530A8] transition-all duration-300 opacity-100 md:opacity-0 translate-y-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0 mt-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>

      {showToast && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1A1A2E] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 md:animate-slideUp">
          <span className="text-[#4CAF7D] font-bold">✓</span> Added to cart!
        </div>
      )}

    </Link>
  )
}
