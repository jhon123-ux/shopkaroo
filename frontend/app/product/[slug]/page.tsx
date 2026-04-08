'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'
import useCartStore from '@/lib/cartStore'
import useAuthStore from '@/lib/authStore'
import { 
  Heart, 
  MessageCircle, 
  ShoppingCart, 
  Truck, 
  Lock, 
  Package, 
  RotateCcw, 
  Search, 
  Star, 
  Check, 
  Plus, 
  Minus,
  ChevronDown
} from 'lucide-react'

const CATEGORY_NAMES: Record<string, string> = {
  'living-room': 'Living Room',
  'bedroom': 'Bedroom', 
  'office': 'Office',
  'dining': 'Dining Room'
}

const CATEGORY_ICONS: Record<string, string> = {
  'living-room': '🛋️',
  'bedroom': '🛏️',
  'office': '🪑',
  'dining': '🍽️'
}

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Other']

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug ? (params.slug as string) : ''
  
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  const { addItem } = useCartStore()
  const [showToast, setShowToast] = useState(false)
  
  const [qty, setQty] = useState(1)
  const [city, setCity] = useState("Karachi")
  const [activeTab, setActiveTab] = useState<'desc'|'specs'|'reviews'>('desc')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const [revName, setRevName] = useState('')
  const [revRating, setRevRating] = useState(5)
  const [revComment, setRevComment] = useState('')
  const [revSubmitted, setRevSubmitted] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { user } = useAuthStore()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch Product by slug
        const prodRes = await fetch(`${backendUrl}/api/products?slug=${slug}`)
        const prodData = await prodRes.json()
        
        if (prodData.data && prodData.data.length > 0) {
          const found = prodData.data[0]
          setProduct(found)
          
          // 2. Fetch Reviews once product ID is known
          const revRes = await fetch(`${backendUrl}/api/reviews?product_id=${found.id}&approved=true`)
          const revData = await revRes.json()
          setReviews(revData.data || [])

          // 3. Fetch Related Products
          const relRes = await fetch(`${backendUrl}/api/products?category=${found.category}&limit=4`)
          const relData = await relRes.json()
          // Filter out the current product from related
          setRelated((relData.data || []).filter((p: Product) => p.id !== found.id))
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, backendUrl])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product?.id || !user) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          name: user.user_metadata?.full_name || user.email || 'Anonymous Collector',
          rating: revRating,
          comment: revComment
        })
      })

      if (res.ok) {
        setRevSubmitted(true)
        setRevComment('')
        setRevRating(5)
      }
    } catch (err) {
      console.error('Review submission failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
          <div className="aspect-square bg-[#F2EDE6] rounded-0 w-full"></div>
          <div className="flex flex-col gap-6 py-8">
            <div className="h-4 bg-[#F2EDE6] rounded-[2px] w-1/4"></div>
            <div className="h-12 bg-[#F2EDE6] rounded-[2px] w-full"></div>
            <div className="h-8 bg-[#F2EDE6] rounded-[2px] w-1/3 mt-6"></div>
            <div className="h-40 bg-[#F2EDE6] rounded-[4px] w-full mt-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center py-20 px-6 bg-white">
        <div className="text-6xl mb-8 opacity-20">
          <Package size={80} strokeWidth={1} />
        </div>
        <h2 className="font-heading font-bold text-3xl text-[#1C1410] mb-4">Product Not Found</h2>
        <p className="text-[#6B6058] mb-10 max-w-md font-body">Sorry, we couldn't find the piece you're looking for. It might have been moved or is no longer available.</p>
        <Link href="/furniture" className="bg-[#783A3A] text-white px-12 py-4 rounded-[3px] font-bold font-body hover:bg-[#5B2C2C] transition-all shadow-lg active:scale-95">
          Back to Collection
        </Link>
      </div>
    )
  }

  const isSale = product.sale_price !== null && product.sale_price !== undefined
  const formatPrice = (price: number) => 'Rs. ' + price.toLocaleString('en-PK')
  const createdDate = new Date(product.created_at || Date.now())
  const isNew = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000

  const getDeliveryEstimate = () => {
    if (city === 'Karachi' || city === 'Lahore') return "Delivers in 2-3 business days"
    if (city === 'Other') return "Delivers in 5-7 business days"
    return "Delivers in 3-5 business days"
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I want to order: ${product.name}\nPrice: Rs. ${product.sale_price ?? product.price_pkr}\nLink: shopkarro.com/product/${product.slug}`
  )

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_pkr: product.price_pkr,
      sale_price: product.sale_price ?? null,
      category: product.category,
      images: product.images || [],
      quantity: qty
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const categoryNameDisplay = product.category ? (CATEGORY_NAMES[product.category] || product.category.replace('-', ' ')) : 'Category'
  const categoryIconDisplay = product.category ? (CATEGORY_ICONS[product.category] || '🏠') : '🏠'

  return (
    <main className="bg-white min-h-screen pb-40 md:pb-24 overflow-x-hidden relative">
      
      {/* PART 1 — BREADCRUMB */}
      <div className="bg-white border-b border-[#E8E2D9] py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 text-[12px] font-body tracking-wider uppercase flex-wrap">
          <Link href="/" className="text-[#6B6058] hover:text-[#783A3A] transition-colors">Home</Link>
          <span className="text-[#D4CCC2]">/</span>
          <Link href={`/furniture/${product.category}`} className="text-[#6B6058] hover:text-[#783A3A] transition-colors">
            {categoryNameDisplay}
          </Link>
          <span className="text-[#D4CCC2]">/</span>
          <span className="text-[#783A3A] font-bold">{product.name}</span>
        </div>
      </div>

      {/* PART 2 — MAIN PRODUCT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        
        {/* LEFT — IMAGE GALLERY */}
        <div className="flex flex-col w-full md:sticky md:top-28 h-max">
          <div className="w-full aspect-square bg-[#F2EDE6] rounded-0 overflow-hidden relative border border-[#E8E2D9]">
            {product.images && product.images.length > 0 ? (
              <Image 
                src={product.images[activeImageIndex]} 
                alt={product.name}
                fill
                className="object-contain p-4 md:p-8 transition-opacity duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl opacity-10 select-none">{categoryIconDisplay}</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isSale && (
                <span className="bg-[#1C1410] text-white text-[10px] px-3 py-1.5 rounded-0 font-body font-bold tracking-[2px] uppercase shadow-md">
                  SALE
                </span>
              )}
              {isNew && (
                <span className="bg-[#783A3A] text-white text-[10px] px-3 py-1.5 rounded-0 font-body font-bold tracking-[2px] uppercase shadow-md">
                  NEW
                </span>
              )}
            </div>

            {/* Zoom Hint */}
            <div className="absolute bottom-4 right-4 bg-white/90 border border-[#E8E2D9] rounded-[3px] px-3 py-1.5 z-10 shadow-sm">
              <span className="text-[11px] text-[#6B6058] font-semibold tracking-wide uppercase font-body flex items-center gap-1.5">
                <Search size={14} className="opacity-40" /> Zoom
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-6 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {product.images?.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-[72px] h-[72px] rounded-[4px] overflow-hidden border transition-all ${activeImageIndex === idx ? 'border-[#783A3A] shadow-sm' : 'border-[#E8E2D9] hover:border-[#783A3A]'}`}
              >
                <div className="w-full h-full relative p-1 bg-[#F2EDE6]">
                  <Image src={product.images[idx]} alt="thumb" fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — PRODUCT INFO */}
        <div className="flex flex-col">
          
          <div className="bg-[#F5E8E8] text-[#783A3A] text-[10px] font-bold px-3 py-1.5 rounded-[2px] uppercase tracking-[2px] inline-block w-max mb-5 font-body">
            {categoryNameDisplay}
          </div>

          <h1 className="font-heading font-bold text-[36px] md:text-[48px] text-[#1C1410] leading-[1.1] mb-6">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex gap-0.5">
              {Array.from({length: 5}).map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "#783A3A" : "none"} 
                  className={i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "text-[#783A3A]" : "text-[#D4CCC2]"} 
                />
              ))}
            </div>
            <span className="text-[#6B6058] text-[13px] font-body">({reviews.length} Verified Reviews)</span>
            <span className="text-[#D4CCC2] mx-1">|</span>
            <span className={`text-[12px] font-bold font-body uppercase tracking-wider ${product.stock_qty > 0 ? 'text-[#2D6A4F]' : 'text-[#DC2626]'}`}>
              {product.stock_qty > 0 ? 'In Stock — Ready to Ship' : 'Out of Stock'}
            </span>
          </div>

          <div className="mb-10 flex items-end">
            {isSale ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-[40px] font-bold text-[#783A3A] tracking-tight leading-none">{formatPrice(product.sale_price!)}</span>
                  <span className="text-xl text-[#6B6058] line-through font-body opacity-60">{formatPrice(product.price_pkr)}</span>
                </div>
                <span className="bg-[#F2EDE6] text-[#783A3A] text-[11px] px-3 py-1 rounded-[2px] font-bold font-body uppercase tracking-wider mt-2 w-max">
                  SAVE {formatPrice(product.price_pkr - product.sale_price!)}
                </span>
              </div>
            ) : (
              <span className="font-heading text-[40px] font-bold text-[#783A3A] tracking-tight leading-none">{formatPrice(product.price_pkr)}</span>
            )}
          </div>

          <div className="flex items-center gap-3 bg-[#EBF7F0] border border-[rgba(45,106,79,0.1)] rounded-[3px] px-5 py-4 mb-8">
            <Check size={20} className="text-[#2D6A4F]" strokeWidth={3} />
            <div>
              <p className="font-bold text-[#2D6A4F] text-[14px] font-body uppercase tracking-wide">Cash on Delivery Available</p>
              <p className="text-[#2D6A4F]/80 text-[13px] font-body mt-0.5">Pay only when you receive your furniture at your doorstep.</p>
            </div>
          </div>

          {product.dimensions && (
            <div className="mb-10">
              <h4 className="text-[10px] tracking-[3px] text-[#6B6058] font-bold mb-4 uppercase font-body">Dimensions</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#FAF7F4] rounded-[3px] p-4 text-center border border-[#E8E2D9]">
                  <p className="font-bold text-[#1C1410] text-[18px] font-heading leading-none">{product.dimensions.L} {product.dimensions.unit}</p>
                  <p className="text-[#6B6058] text-[11px] mt-2 font-body uppercase tracking-wider font-semibold opacity-60">Length</p>
                </div>
                <div className="bg-[#FAF7F4] rounded-[3px] p-4 text-center border border-[#E8E2D9]">
                  <p className="font-bold text-[#1C1410] text-[18px] font-heading leading-none">{product.dimensions.W} {product.dimensions.unit}</p>
                  <p className="text-[#6B6058] text-[11px] mt-2 font-body uppercase tracking-wider font-semibold opacity-60">Width</p>
                </div>
                <div className="bg-[#FAF7F4] rounded-[3px] p-4 text-center border border-[#E8E2D9]">
                  <p className="font-bold text-[#1C1410] text-[18px] font-heading leading-none">{product.dimensions.H} {product.dimensions.unit}</p>
                  <p className="text-[#6B6058] text-[11px] mt-2 font-body uppercase tracking-wider font-semibold opacity-60">Height</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 mb-10">
            <h4 className="text-[10px] tracking-[3px] text-[#6B6058] font-bold uppercase font-body">Configure Selection</h4>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-[#E8E2D9] rounded-[3px] bg-white h-14">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-12 h-full flex items-center justify-center hover:text-[#783A3A] transition-colors disabled:opacity-20"
                >
                  <Minus size={16} />
                </button>
                <div className="w-12 text-center font-bold text-[#1C1410] font-body text-base">
                  {qty}
                </div>
                <button 
                  onClick={() => setQty(Math.min(product.stock_qty, qty + 1))}
                  disabled={qty >= product.stock_qty}
                  className="w-12 h-full flex items-center justify-center hover:text-[#783A3A] transition-colors disabled:opacity-20"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 w-full bg-white border border-[#783A3A] text-[#783A3A] h-14 rounded-[3px] font-bold text-[13px] uppercase tracking-[2px] hover:bg-[#F5E8E8] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>

            {/* Buy Now Button (Vibrating) */}
            <button 
              className="w-full bg-[#783A3A] text-white h-16 rounded-[3px] font-bold text-[15px] uppercase tracking-[3px] flex items-center justify-center gap-3 shadow-xl hover:bg-[#5B2C2C] transition-all animate-shake active:scale-95"
            >
              <Package size={20} /> Buy it Now
            </button>
            
            <a 
              href={`https://wa.me/923706905835?text=${whatsappMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-4 rounded-[3px] font-bold text-[13px] uppercase tracking-wider hover:bg-[#1fba59] transition-all flex items-center justify-center gap-3 shadow-md"
            >
              <MessageCircle size={18} /> Order via WhatsApp
            </a>
          </div>

          <div className="bg-[#FAF7F4] rounded-[3px] p-6 border border-[#E8E2D9]">
            <h4 className="text-[10px] tracking-[3px] text-[#6B6058] font-bold mb-4 uppercase font-body">Delivery Information</h4>
            <div className="relative mb-4">
              <select 
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full border border-[#D4CCC2] rounded-[3px] px-4 py-3 text-[14px] font-medium outline-none focus:border-[#783A3A] bg-white appearance-none pr-10 cursor-pointer font-body"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <ChevronDown size={16} className="text-[#1C1410]" />
              </div>
            </div>
            <div className="bg-white rounded-[2px] p-4 border border-[#E8E2D9] text-[#1C1410] text-[14px] font-bold flex items-center gap-3 font-body">
              <Truck size={18} className="opacity-60" /> {getDeliveryEstimate()}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-[#E8E2D9]">
              <div className="text-[10px] font-bold text-[#6B6058] uppercase tracking-wider text-center flex flex-col gap-1 items-center"><Lock size={14} className="opacity-60 mb-1" /> Secure COD</div>
              <div className="text-[10px] font-bold text-[#6B6058] uppercase tracking-wider text-center flex flex-col gap-1 items-center"><Package size={14} className="opacity-60 mb-1" /> Packaging</div>
              <div className="text-[10px] font-bold text-[#6B6058] uppercase tracking-wider text-center flex flex-col gap-1 items-center"><RotateCcw size={14} className="opacity-60 mb-1" /> 7-Day Return</div>
            </div>
          </div>
        </div>
      </div>

      {/* PART 3 — PRODUCT DETAILS TABS */}
      <div className="max-w-7xl mx-auto px-6 mt-20 border-t border-[#E8E2D9] pt-12">
        <div className="flex gap-4 border-b border-[#E8E2D9] mb-12 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('desc')}
            className={`pb-4 px-4 text-[12px] tracking-[2px] uppercase whitespace-nowrap transition-all ${activeTab === 'desc' ? 'border-b-2 border-[#783A3A] text-[#783A3A] font-bold' : 'text-[#6B6058] font-semibold hover:text-[#1C1410]'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`pb-4 px-4 text-[12px] tracking-[2px] uppercase whitespace-nowrap transition-all ${activeTab === 'specs' ? 'border-b-2 border-[#783A3A] text-[#783A3A] font-bold' : 'text-[#6B6058] font-semibold hover:text-[#1C1410]'}`}
          >
            Specifications
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-4 text-[12px] tracking-[2px] uppercase whitespace-nowrap transition-all ${activeTab === 'reviews' ? 'border-b-2 border-[#783A3A] text-[#783A3A] font-bold' : 'text-[#6B6058] font-semibold hover:text-[#1C1410]'}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="min-h-[250px]">
          {activeTab === 'desc' && (
            <div className="animate-slideUp max-w-4xl">
              <p className="text-[#1C1410] text-[16px] leading-[1.8] font-body opacity-90">
                {product.description || "Transform your living space with our beautifully crafted furniture designed specifically for modern Pakistani homes. Built with longevity in mind, our pieces offer a seamless blend of comfort, durability, and contemporary styling."}
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-[#1C1410] font-semibold text-[13px] font-body uppercase tracking-wide"><Check size={18} className="text-[#2D6A4F]" strokeWidth={3} /> Premium Materials</div>
                <div className="flex items-center gap-3 text-[#1C1410] font-semibold text-[13px] font-body uppercase tracking-wide"><Check size={18} className="text-[#2D6A4F]" strokeWidth={3} /> Skilled Artisans</div>
                <div className="flex items-center gap-3 text-[#1C1410] font-semibold text-[13px] font-body uppercase tracking-wide"><Check size={18} className="text-[#2D6A4F]" strokeWidth={3} /> Long-lasting Build</div>
                <div className="flex items-center gap-3 text-[#1C1410] font-semibold text-[13px] font-body uppercase tracking-wide"><Check size={18} className="text-[#2D6A4F]" strokeWidth={3} /> Secure Delivery</div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="animate-slideUp max-w-2xl border border-[#E8E2D9] rounded-0 overflow-hidden">
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Material</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body">{product.material || "—"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#FAF7F4] border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Dimensions</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body">{product.dimensions ? `${product.dimensions.L}×${product.dimensions.W}×${product.dimensions.H} ${product.dimensions.unit}` : "—"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Weight</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body">{product.weight_kg ? `${product.weight_kg} kg` : "—"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#FAF7F4] border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Category</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body capitalize">{product.category}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">SKU</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body font-mono">SKR-{product.id ? product.id.toString().slice(0,8).toUpperCase() : 'UNKNOWN'}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#FAF7F4] border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Delivery</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body">2-7 business days</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E8E2D9]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Warranty</span>
                <span className="text-[#1C1410] text-[14px] font-bold font-body">1 Year Limited</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#FAF7F4]">
                <span className="text-[#6B6058] text-[13px] font-bold uppercase tracking-wider font-body">Payment</span>
                <span className="text-[#2D6A4F] text-[13px] font-bold font-body">CASH ON DELIVERY</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-slideUp max-w-4xl flex flex-col gap-12">
              
              {/* RATING SUMMARY */}
              {reviews.length > 0 && (
                <div className="flex flex-col md:flex-row items-center gap-12 pb-12 border-b border-[#E8E2D9]">
                  <div className="text-center">
                    <p className="text-[48px] font-bold font-heading text-[#783A3A] leading-none mb-4">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </p>
                    <div className="flex justify-center gap-1 mb-2">
                       {Array.from({length: 5}).map((_, i) => (
                         <Star 
                           key={i} 
                           size={16} 
                           fill={i < Math.floor(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "#783A3A" : "none"} 
                           className={i < Math.floor(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "text-[#783A3A]" : "text-[#D4CCC2]"} 
                         />
                       ))}
                    </div>
                    <p className="text-[#6B6058] text-[13px] font-body uppercase tracking-widest opacity-60">
                      Based on {reviews.length} Reviews
                    </p>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length
                      const percentage = (count / reviews.length) * 100
                      return (
                        <div key={star} className="flex items-center gap-4">
                          <span className="text-[11px] font-bold text-[#1C1410] w-4">{star}★</span>
                          <div className="flex-1 h-1.5 bg-[#FAF7F4] rounded-full overflow-hidden border border-[#E8E2D9]/30">
                            <div 
                              className="h-full bg-[#783A3A] transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#6B6058] w-8 text-right opacity-60">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* REVIEWS LIST */}
              {reviews.length === 0 ? (
                <div className="py-20 text-center text-[#6B6058] font-body bg-[#FAF7F4] border border-dashed border-[#E8E2D9] rounded-0">
                  <span className="text-4xl block mb-4 opacity-30">✨</span>
                  No approved reviews yet. Be the first to share your experience.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="bg-[#FAF7F4] rounded-[4px] p-8 border border-[#E8E2D9] relative overflow-hidden">
                       <div className="flex items-center gap-0.5 mb-6">
                        {Array.from({length: 5}).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? "#783A3A" : "none"} 
                            className={i < review.rating ? "text-[#783A3A]" : "text-[#D4CCC2]"} 
                          />
                        ))}
                      </div>
                      <p className="text-[#1C1410] text-[15px] leading-relaxed italic mb-8 font-body opacity-90 relative z-10">"{review.comment}"</p>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-[3px] bg-[#F5E8E8] flex items-center justify-center text-[#783A3A] font-bold text-[14px] font-heading border border-white shadow-sm">
                          {review.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#1C1410] text-[13px] font-body uppercase tracking-wider">{review.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <p className="text-[#6B6058] text-[11px] font-body uppercase tracking-widest opacity-60">Verified Collector</p>
                             <span className="w-1 h-1 bg-[#D4CCC2] rounded-full" />
                             <p className="text-[#A89890] text-[11px] font-body">{new Date(review.created_at).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>

                      {/* Accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#783A3A]/[0.02] rounded-full -mr-12 -mt-12" />
                    </div>
                  ))}
                </div>
              )}

              {/* SUBMISSION FORM */}
              <div className="mt-8 pt-12 border-t border-[#E8E2D9]">
                <h3 className="font-heading font-bold text-[#1C1410] text-[24px] mb-8">Share Your Experience</h3>
                
                {!user ? (
                  <div className="bg-white border border-[#E8E2D9] p-10 text-center rounded-[3px] shadow-sm">
                    <p className="text-[#6B6058] mb-8 font-body leading-relaxed">
                      Only verified members can leave reviews. Please sign in to join the conversation and share your feedback.
                    </p>
                    <Link 
                      href="/login" 
                      className="bg-[#783A3A] text-white px-12 py-4 rounded-[3px] font-bold font-body uppercase tracking-widest text-[13px] hover:bg-[#5B2C2C] transition-all shadow-lg active:scale-95 inline-block"
                    >
                      Sign In to Review
                    </Link>
                  </div>
                ) : revSubmitted ? (
                  <div className="bg-[#EBF7F0] text-[#2D6A4F] p-8 rounded-[3px] font-bold font-body text-[14px] border border-[rgba(45,106,79,0.1)] uppercase tracking-[2px] flex items-center gap-4 animate-slideUp">
                    <Check size={20} strokeWidth={3} /> Success: Review submitted for verification.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-8">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1C1410] mb-4 uppercase tracking-[2px] font-body opacity-60">Visual Score</label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} type="button" 
                            onClick={() => setRevRating(star)}
                            className="group transition-all active:scale-90"
                          >
                            <Star 
                              size={28} 
                              fill={revRating >= star ? "#783A3A" : "none"} 
                              className={revRating >= star ? "text-[#783A3A]" : "text-[#D4CCC2] group-hover:text-[#783A3A]/40"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body opacity-60">Written Statement</label>
                      <textarea 
                        required rows={5} value={revComment} onChange={e => setRevComment(e.target.value)}
                        className="w-full border border-[#D4CCC2] rounded-[3px] px-6 py-5 outline-none focus:border-[#783A3A] bg-white text-[15px] font-body resize-none leading-relaxed transition-colors placeholder:opacity-40" 
                        placeholder="Share your detailed experience with this piece..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-[#783A3A] text-white px-12 py-5 rounded-[3px] font-bold w-full sm:w-auto self-start hover:bg-[#5B2C2C] transition-all uppercase tracking-widest text-[14px] font-body shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Indexing...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PART 4 — RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-16 border-t border-[#E8E2D9]">
          <h2 className="text-[32px] font-bold font-heading text-[#1C1410] mb-10 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* PART 6 — STICKY MOBILE BUY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E2D9] px-6 py-4 flex items-center gap-4 md:hidden shadow-lg animate-slideUp">
        <div className="flex-shrink-0">
          <p className="text-[10px] text-[#6B6058] uppercase tracking-wider font-bold mb-1 opacity-60">Price</p>
          <p className="text-lg font-bold text-[#783A3A] font-heading leading-none">
            {formatPrice(product.sale_price ?? product.price_pkr)}
          </p>
        </div>
        <div className="flex gap-3 flex-1">
          <a 
            href={`https://wa.me/923706905835?text=${whatsappMessage}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366] text-white h-12 rounded-[3px] font-bold text-[13px] tracking-wide uppercase flex items-center justify-center flex-1 active:scale-95 transition-transform gap-2"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          <button 
            onClick={handleAddToCart}
            className="bg-[#783A3A] text-white h-12 rounded-[3px] font-bold text-[13px] tracking-wide uppercase flex items-center justify-center flex-1 active:scale-95 transition-transform gap-2"
          >
            <ShoppingCart size={18} /> Cart
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1C1410] text-white px-6 py-4 rounded-0 shadow-2xl flex items-center gap-3 animate-slideUp border-l-4 border-[#783A3A]">
          <Check size={16} className="text-[#2D6A4F]" strokeWidth={3} /> 
          <span className="text-[13px] font-body font-semibold">Added to your collection</span>
        </div>
      )}

    </main>
  )
}
