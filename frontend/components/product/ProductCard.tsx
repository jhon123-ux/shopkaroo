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
    <Link href={`/product/${product.slug}`} className="block h-full cursor-pointer group bg-white rounded-[4px] border border-[#E8E2D9] overflow-hidden hover:border-[#4A2C6E] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      
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

        {/* Top left badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isSale ? (
            <span className="bg-[#1C1410] text-white text-[10px] px-[10px] py-[4px] rounded-0 font-body font-bold tracking-[2px] uppercase shadow-sm">
              SALE
            </span>
          ) : isNew ? (
            <span className="bg-[#4A2C6E] text-white text-[10px] px-[10px] py-[4px] rounded-0 font-body font-bold tracking-[2px] uppercase shadow-sm">
              NEW
            </span>
          ) : null}
        </div>

        {/* Top right Wishlist button */}
        <button 
          onClick={(e) => { e.preventDefault(); /* Wishlist logic later */ }}
          className="absolute top-3 right-3 z-10 bg-white/92 border border-[#E8E2D9] w-[34px] h-[34px] rounded-[3px] flex items-center justify-center text-[#6B6058] hover:text-[#4A2C6E] hover:border-[#4A2C6E] opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          aria-label="Add to wishlist"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
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
        <div className="flex items-center gap-2 mb-2">
          {isSale ? (
             <>
               <span className="text-[#4A2C6E] font-bold text-[18px] font-heading">
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

        {/* Trust row */}
        <div className="mt-2 inline-flex items-center gap-1 bg-[#EBF7F0] text-[#2D6A4F] text-[11px] px-2 py-[3px] rounded-[2px] border border-[rgba(45,106,79,0.20)] font-body font-medium">
          ✓ COD
        </div>

        {/* Add to Cart button */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#4A2C6E] text-white py-[10px] rounded-[3px] border border-[#4A2C6E] font-semibold font-body text-[13px] tracking-[0.3px] flex items-center justify-center gap-2 hover:bg-[#3A1F57] transition-all duration-150 mt-3 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
        >
          Add to Cart
        </button>
      </div>

      {showToast && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1C1410] text-white px-4 py-3 rounded-[3px] shadow-xl flex items-center gap-2 animate-slideUp">
          <span className="text-[#2D6A4F] font-bold">✓</span> Added to cart
        </div>
      )}

    </Link>
  )
}
