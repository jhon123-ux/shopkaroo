'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ShoppingCart, MessageCircle, Plus, Minus, Star, Heart } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { Product } from '@/types'

interface QuickViewModalProps {
  product: Product | any
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore()
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  // Reset state when product changes or opens
  useEffect(() => {
    if (isOpen) {
      setQty(1)
      setActiveImage(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    addItem({
      ...product,
      quantity: qty
    })
    onClose()
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in the ${product.name} (Rs. ${product.sale_price ?? product.price_pkr}). Can I get more details?`
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[4px] shadow-2xl flex flex-col md:flex-row animate-slideUp">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white border border-[#E8E2D9] rounded-full hover:border-[#783A3A] transition-colors"
        >
          <X size={20} className="text-[#6B6058]" />
        </button>

        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 p-6 md:p-10 bg-[#FAF7F4] flex flex-col gap-6">
          <div className="relative aspect-square w-full border border-[#E8E2D9] rounded-[4px] overflow-hidden bg-white">
            {product.images?.[activeImage] ? (
              <Image 
                src={product.images[activeImage]} 
                alt={product.name} 
                fill 
                className="object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🪑</div>
            )}
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {product.images?.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-16 h-16 flex-shrink-0 border rounded-[2px] overflow-hidden transition-all ${activeImage === idx ? 'border-[#783A3A] scale-105 shadow-sm' : 'border-[#E8E2D9] opacity-60 hover:opacity-100'}`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
          <div className="inline-block bg-[#F5E8E8] text-[#783A3A] text-[10px] font-bold px-2 py-1 rounded-[2px] uppercase tracking-wider mb-4 font-body w-max">
            {product.category?.replace('-', ' ')}
          </div>

          <h2 className="font-heading font-bold text-[28px] text-[#1C1410] leading-[1.2] mb-4">
            {product.name}
          </h2>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} fill="#783A3A" className="text-[#783A3A]" />
              ))}
            </div>
            <span className="text-xs text-[#6B6058] opacity-60">(Recent Collection)</span>
          </div>

          <div className="mb-8">
            {product.sale_price ? (
              <div className="flex items-center gap-3">
                <span className="text-[28px] font-bold text-[#783A3A] font-heading">Rs. {product.sale_price.toLocaleString()}</span>
                <span className="text-lg text-[#6B6058] line-through opacity-40 font-body">Rs. {product.price_pkr.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-[28px] font-bold text-[#1C1410] font-heading">Rs. {product.price_pkr?.toLocaleString()}</span>
            )}
          </div>

          <p className="text-[#6B6058] text-[15px] leading-relaxed mb-8 line-clamp-4 font-body">
            {product.description || "Transform your space with our premium craftsmanship. This piece is designed for both elegance and durability."}
          </p>

          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#6B6058] uppercase tracking-widest">Quantity</span>
              <div className="flex items-center border border-[#E8E2D9] rounded-[3px]">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:text-[#783A3A] transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold text-[#1C1410]">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="p-3 hover:text-[#783A3A] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-[#783A3A] text-white py-4 rounded-[3px] font-bold text-[14px] uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-[#5B2C2C] transition-all"
              >
                <ShoppingCart size={18} /> Add to Collection
              </button>
              <a 
                href={`https://wa.me/923706905835?text=${whatsappMessage}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full border border-[#25D366] text-[#25D366] py-3.5 rounded-[3px] font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-[#25D366] hover:text-white transition-all"
              >
                <MessageCircle size={18} /> WhatsApp Enquiry
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
