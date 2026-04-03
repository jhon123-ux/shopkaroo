'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'
import useCartStore from '@/lib/cartStore'

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

const MOCK_PRODUCT: Product = {
  id: "mock-1",
  name: "Sheesham Wood Sofa Set 3 Seater",
  slug: "sheesham-sofa-set-3-seater",
  description: "Premium sheesham wood sofa set crafted by skilled Pakistani artisans.",
  price_pkr: 85000,
  sale_price: 72000,
  category: "living-room",
  material: "Sheesham Wood",
  dimensions: { L: 210, W: 85, H: 90, unit: "cm" },
  images: [],
  stock_qty: 5,
  weight_kg: 85,
  is_active: true,
  created_at: new Date().toISOString()
}

const MOCK_RELATED: Product[] = [
  { id: "r1", name: "L-Shape Corner Sofa", price_pkr: 110000, sale_price: 95000, category: "living-room", images: [], slug: "l-shape-corner-sofa", stock_qty: 3, created_at: new Date().toISOString(), description: '', material: '', is_active: true },
  { id: "r2", name: "Coffee Table Sheesham", price_pkr: 18000, sale_price: null, category: "living-room", images: [], slug: "coffee-table-sheesham", stock_qty: 8, created_at: new Date().toISOString(), description: '', material: '', is_active: true },
  { id: "r3", name: "TV Console Unit", price_pkr: 25000, sale_price: 22000, category: "living-room", images: [], slug: "tv-console-unit", stock_qty: 4, created_at: new Date().toISOString(), description: '', material: '', is_active: true },
  { id: "r4", name: "Accent Armchair", price_pkr: 32000, sale_price: null, category: "living-room", images: [], slug: "accent-armchair", stock_qty: 6, created_at: new Date().toISOString(), description: '', material: '', is_active: true }
]

const STATIC_REVIEWS = [
  { id: 1, name: "Ahmed Khan", city: "Lahore", rating: 5, review: "Excellent quality sofa set. Delivered in 3 days to Lahore. COD made it very easy. Highly recommend Shopkaroo!" },
  { id: 2, name: "Sara Malik", city: "Karachi", rating: 5, review: "Ordered a king size bed. Assembly team was very professional. Will definitely order again from Shopkaroo." },
  { id: 3, name: "Usman Ali", city: "Islamabad", rating: 5, review: "Best online furniture shop in Pakistan. Prices are fair and quality is top notch. Very happy customer." },
  { id: 4, name: "Fatima Zahra", city: "Faisalabad", rating: 4, review: "Good experience overall. Dining table looks exactly like the photos. Fast delivery too. Recommended!" },
  { id: 5, name: "Hassan Raza", city: "Rawalpindi", rating: 5, review: "COD option made me trust the website. Furniture quality exceeded my expectations completely." }
]

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Other']

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug ? (params.slug as string) : ''
  
  const [product, setProduct] = useState<Product>(MOCK_PRODUCT)
  const [related, setRelated] = useState<Product[]>(MOCK_RELATED)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  
  const { addItem } = useCartStore()
  const [showToast, setShowToast] = useState(false)
  
  const [qty, setQty] = useState(1)
  const [city, setCity] = useState("Karachi")
  const [activeTab, setActiveTab] = useState<'desc'|'specs'|'reviews'>('desc')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Review Form
  const [revName, setRevName] = useState('')
  const [revRating, setRevRating] = useState(5)
  const [revComment, setRevComment] = useState('')
  const [revSubmitted, setRevSubmitted] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch Product
        const prodRes = await fetch(`${backendUrl}/api/products?search=${slug}`)
        const prodData = await prodRes.json()
        
        const found = (prodData.data || []).find((p: Product) => p.slug === slug)
        if (found) {
          setProduct(found)
          
          // 2. Fetch Reviews once product ID is known
          const revRes = await fetch(`${backendUrl}/api/reviews?product_id=${found.id}`)
          const revData = await revRes.json()
          setReviews(revData.data || [])
        } else {
          // If not found in DB, we keep MOCK_PRODUCT as fallback
          // which is already the initial state of 'product'
          console.warn('Real product not found, sticking to Mock.')
          setReviews(STATIC_REVIEWS)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, backendUrl])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product.id) return

    try {
      const res = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          name: revName,
          rating: revRating,
          comment: revComment
        })
      })

      if (res.ok) {
        setRevSubmitted(true)
        // Reset form
        setRevName('')
        setRevComment('')
      }
    } catch (err) {
      console.error('Review submission failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
          <div className="aspect-square bg-[#F7F5FF] rounded-2xl w-full"></div>
          <div className="flex flex-col gap-4 py-8">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mt-6"></div>
            <div className="h-32 bg-[#F7F5FF] rounded-2xl w-full mt-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!product && !loading)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="text-6xl mb-4">🪑</div>
        <h2 className="font-heading font-bold text-2xl text-[#1A1A2E] mb-6">Product not found</h2>
        <Link href="/furniture" className="bg-[#6C3FC5] text-white px-8 py-3 rounded-xl font-semibold">
          Back to Shop
        </Link>
      </div>
    )
  }

  const isSale = product.sale_price !== null && product.sale_price !== undefined
  const formatPrice = (price: number) => 'Rs. ' + price.toLocaleString('en-PK')
  const createdDate = new Date(product.created_at || Date.now())
  const isNew = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000

  const getDeliveryEstimate = () => {
    if (city === 'Karachi' || city === 'Lahore') return "🚚 Delivers in 2-3 business days"
    if (city === 'Other') return "🚚 Delivers in 5-7 business days"
    return "🚚 Delivers in 3-5 business days"
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I want to order: ${product.name}\nPrice: Rs. ${product.sale_price ?? product.price_pkr}\nLink: shopkaroo.com/product/${product.slug}`
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
    <main className="bg-white min-h-screen pb-24 md:pb-0 overflow-x-hidden relative">
      
      {/* PART 1 — BREADCRUMB */}
      <div className="bg-white border-b border-[#E5E0F5] py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-sm flex-wrap">
          <Link href="/" className="hover:text-[#6C3FC5] transition-colors">Home</Link>
          <span className="text-[#6B7280]">/</span>
          <Link href={`/furniture/${product.category}`} className="hover:text-[#6C3FC5] transition-colors capitalize">
            {categoryNameDisplay}
          </Link>
          <span className="text-[#6B7280]">/</span>
          <span className="text-[#6C3FC5] font-medium">{product.name}</span>
        </div>
      </div>

      {/* PART 2 — MAIN PRODUCT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        
        {/* LEFT — IMAGE GALLERY */}
        <div className="flex flex-col w-full sticky top-24 h-max">
          <div className="w-full aspect-square bg-[#F7F5FF] rounded-2xl overflow-hidden relative" style={!product.images || product.images.length === 0 ? { background: 'linear-gradient(135deg,#EDE6FA,#F7F5FF)' } : {}}>
            {product.images && product.images.length > 0 ? (
              <Image 
                src={product.images[activeImageIndex]} 
                alt={product.name}
                fill
                className="object-contain p-8 transition-opacity duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl opacity-80 select-none">{categoryIconDisplay}</span>
                <span className="absolute bottom-6 text-[#6C3FC5]/20 text-2xl font-bold font-heading uppercase tracking-wider px-6 text-center select-none w-full truncate">
                  {product.name}
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isSale && <span className="bg-[#DC2626] text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold shadow-sm inline-block">SALE</span>}
              {isNew && <span className="bg-[#6C3FC5] text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold shadow-sm inline-block">NEW</span>}
            </div>

            {/* Zoom Hint */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur rounded-xl px-3 py-1.5 z-10 shadow-sm border border-white/40">
              <span className="text-xs text-[#6B7280] font-medium">🔍 Click to zoom</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {(product.images?.length > 0 ? product.images : [1,2,3,4]).map((img, idx) => (
              <div 
                key={idx}
                onClick={() => product.images?.length > 0 && setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeImageIndex === idx ? 'border-[#6C3FC5]' : 'border-transparent hover:border-[#E5E0F5]'}`}
                style={product.images?.length === 0 ? { background: 'linear-gradient(135deg, #f0ebfa, #fdfcff)' } : {}}
              >
                {product.images?.length > 0 && (
                  <div className="w-full h-full relative p-2 bg-[#F7F5FF]">
                    <Image src={product.images[idx]} alt="thumb" fill className="object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — PRODUCT INFO */}
        <div className="flex flex-col">
          
          <div className="bg-[#EDE6FA] text-[#6C3FC5] text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block w-max mb-3 shadow-sm border border-[#d2c2f4]">
            {categoryNameDisplay}
          </div>

          <h1 className="font-heading font-extrabold text-4xl text-[#1A1A2E] leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-yellow-400 text-lg tracking-widest drop-shadow-sm">★★★★★</span>
            <span className="text-[#6B7280] text-sm">(24 reviews)</span>
            <span className="text-[#E5E0F5]">|</span>
            <span className={`text-sm font-medium ${product.stock_qty > 0 ? 'text-[#4CAF7D]' : 'text-[#DC2626]'}`}>
              {product.stock_qty > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="mb-6 flex items-end">
            {isSale ? (
              <>
                <span className="font-heading text-4xl font-extrabold text-[#6C3FC5] tracking-tight">{formatPrice(product.sale_price!)}</span>
                <span className="text-xl text-[#6B7280] line-through ml-3 mb-1">{formatPrice(product.price_pkr)}</span>
                <span className="bg-[#FEF2F2] text-[#DC2626] text-sm px-3 py-1 rounded-full ml-3 mb-1 font-bold shadow-sm border border-red-100">
                  Save {formatPrice(product.price_pkr - product.sale_price!)}
                </span>
              </>
            ) : (
              <span className="font-heading text-4xl font-extrabold text-[#6C3FC5] tracking-tight">{formatPrice(product.price_pkr)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 mb-6 shadow-sm">
            <span className="text-[#4CAF7D] text-lg font-bold">✓</span>
            <div>
              <p className="font-bold text-[#166534]">Cash on Delivery Available</p>
              <p className="text-[#166534]/70 text-sm font-medium">Pay when your furniture arrives at your doorstep</p>
            </div>
          </div>

          {product.dimensions && (
            <div className="mb-6">
              <h4 className="font-mono text-xs tracking-widest text-[#6C3FC5] font-bold mb-3 uppercase">Dimensions</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F7F5FF] rounded-xl p-3 text-center border border-[#E5E0F5]">
                  <p className="font-bold text-[#1A1A2E] text-lg font-heading">{product.dimensions.L} {product.dimensions.unit}</p>
                  <p className="text-[#6B7280] text-xs mt-1 font-medium">Length</p>
                </div>
                <div className="bg-[#F7F5FF] rounded-xl p-3 text-center border border-[#E5E0F5]">
                  <p className="font-bold text-[#1A1A2E] text-lg font-heading">{product.dimensions.W} {product.dimensions.unit}</p>
                  <p className="text-[#6B7280] text-xs mt-1 font-medium">Width</p>
                </div>
                <div className="bg-[#F7F5FF] rounded-xl p-3 text-center border border-[#E5E0F5]">
                  <p className="font-bold text-[#1A1A2E] text-lg font-heading">{product.dimensions.H} {product.dimensions.unit}</p>
                  <p className="text-[#6B7280] text-xs mt-1 font-medium">Height</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-mono text-xs tracking-widest text-[#6C3FC5] font-bold mb-3 uppercase">Quantity</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 rounded-xl border border-[#E5E0F5] flex items-center justify-center hover:border-[#6C3FC5] text-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  -
                </button>
                <div className="text-xl font-extrabold text-[#1A1A2E] w-12 text-center font-heading">
                  {qty}
                </div>
                <button 
                  onClick={() => setQty(Math.min(product.stock_qty, qty + 1))}
                  disabled={qty >= product.stock_qty}
                  className="w-10 h-10 rounded-xl border border-[#E5E0F5] flex items-center justify-center hover:border-[#6C3FC5] text-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  +
                </button>
              </div>
              {product.stock_qty > 0 && product.stock_qty <= 5 && (
                <span className="text-[#DC2626] text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                  Only {product.stock_qty} left in stock!
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3 mb-8">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#6C3FC5] text-white py-4 rounded-2xl font-bold text-lg font-heading hover:bg-[#5530A8] transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
            <a 
              href={`https://wa.me/923001234567?text=${whatsappMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-[#4CAF7D] text-white py-4 rounded-2xl font-bold text-lg font-heading hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Order via WhatsApp
            </a>
            <button className="w-full border-2 border-[#E5E0F5] text-[#6B7280] py-3.5 rounded-2xl font-semibold text-base hover:border-[#6C3FC5] hover:text-[#6C3FC5] transition-colors flex items-center justify-center gap-2 bg-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              Save to Wishlist
            </button>
          </div>

          <div className="bg-[#F7F5FF] rounded-2xl p-6 border border-[#E5E0F5] shadow-sm">
            <h4 className="font-mono text-xs tracking-widest text-[#6C3FC5] font-bold mb-4 uppercase">Delivery Information</h4>
            <label className="text-sm font-medium text-[#6B7280] mb-2 block">Select your city:</label>
            <div className="relative">
              <select 
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent bg-white appearance-none pr-10 cursor-pointer"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3.5 mt-3 border border-[#E5E0F5] shadow-sm text-[#1A1A2E] text-sm font-bold flex items-center gap-2">
              {getDeliveryEstimate()}
            </div>
            
            <div className="flex gap-6 mt-5 pt-5 border-t border-[#E5E0F5]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]"><span className="text-base">🔒</span> Secure COD</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]"><span className="text-base">📦</span> Free Packaging</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]"><span className="text-base">↩️</span> 7-Day Return</div>
            </div>
          </div>
        </div>
      </div>

      {/* PART 3 — PRODUCT DETAILS TABS */}
      <div className="max-w-7xl mx-auto px-6 mt-16 border-t border-[#E5E0F5] pt-10">
        <div className="flex gap-0 border-b border-[#E5E0F5] mb-8 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('desc')}
            className={`pb-4 px-6 text-base whitespace-nowrap transition-colors ${activeTab === 'desc' ? 'border-b-2 border-[#6C3FC5] text-[#6C3FC5] font-bold' : 'text-[#6B7280] font-medium hover:text-[#1A1A2E]'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`pb-4 px-6 text-base whitespace-nowrap transition-colors ${activeTab === 'specs' ? 'border-b-2 border-[#6C3FC5] text-[#6C3FC5] font-bold' : 'text-[#6B7280] font-medium hover:text-[#1A1A2E]'}`}
          >
            Specifications
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-6 text-base whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-[#6C3FC5] text-[#6C3FC5] font-bold' : 'text-[#6B7280] font-medium hover:text-[#1A1A2E]'}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="min-h-[250px]">
          {activeTab === 'desc' && (
            <div className="animate-slideUp max-w-4xl">
              <p className="text-[#1A1A2E] text-base leading-relaxed font-body">
                {product.description || "Transform your living space with our beautifully crafted furniture designed specifically for modern Pakistani homes. Built with longevity in mind, our pieces offer a seamless blend of comfort, durability, and contemporary styling."}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#1A1A2E] font-medium text-sm"><span className="text-[#4CAF7D] text-lg">✓</span> Premium quality materials</div>
                <div className="flex items-center gap-2 text-[#1A1A2E] font-medium text-sm"><span className="text-[#4CAF7D] text-lg">✓</span> Handcrafted by skilled artisans</div>
                <div className="flex items-center gap-2 text-[#1A1A2E] font-medium text-sm"><span className="text-[#4CAF7D] text-lg">✓</span> Durable and long-lasting</div>
                <div className="flex items-center gap-2 text-[#1A1A2E] font-medium text-sm"><span className="text-[#4CAF7D] text-lg">✓</span> Easy assembly included</div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="animate-slideUp max-w-2xl border border-[#E5E0F5] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">Material</span>
                <span className="text-[#1A1A2E] text-sm font-bold">{product.material || "—"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#F7F5FF] border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">Dimensions</span>
                <span className="text-[#1A1A2E] text-sm font-bold">{product.dimensions ? `${product.dimensions.L}×${product.dimensions.W}×${product.dimensions.H} ${product.dimensions.unit}` : "—"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">Weight</span>
                <span className="text-[#1A1A2E] text-sm font-bold">{product.weight_kg ? `${product.weight_kg} kg` : "—"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#F7F5FF] border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">Category</span>
                <span className="text-[#1A1A2E] text-sm font-bold capitalize">{product.category}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">SKU</span>
                <span className="text-[#1A1A2E] text-sm font-bold font-mono">SKR-{product.id ? product.id.toString().slice(0,8).toUpperCase() : 'UNKNOWN'}</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#F7F5FF] border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">Delivery</span>
                <span className="text-[#1A1A2E] text-sm font-bold">2-7 business days</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-white border-b border-[#E5E0F5]">
                <span className="text-[#6B7280] text-sm font-medium">Warranty</span>
                <span className="text-[#1A1A2E] text-sm font-bold">1 Year Manufacturer Warranty</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-[#F7F5FF]">
                <span className="text-[#6B7280] text-sm font-medium">Payment</span>
                <span className="text-[#1A1A2E] text-sm font-bold text-[#4CAF7D]">Cash on Delivery Only</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-slideUp max-w-4xl flex flex-col gap-6">
              {reviews.length === 0 ? (
                <div className="py-10 text-center text-[#6B7280]">
                  No approved reviews yet. Be the first to review this product!
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <div key={idx} className="bg-[#F7F5FF] rounded-2xl p-6 border border-[#E5E0F5]">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({length: review.rating}).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                      {Array.from({length: 5 - review.rating}).map((_, i) => (
                        <span key={i} className="text-gray-300 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-[#1A1A2E] text-base leading-relaxed italic mb-4 font-body">"{review.comment || review.review}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EDE6FA] flex items-center justify-center text-[#6C3FC5] font-bold text-sm font-heading shadow-sm border border-white">
                        {review.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1A2E] text-sm font-heading">{review.name}</p>
                        <p className="text-[#6B7280] text-xs font-medium">{review.city || 'Pakistan'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="mt-8 bg-white border border-[#E5E0F5] rounded-2xl p-8 shadow-sm">
                <h3 className="font-heading font-extrabold text-[#1A1A2E] text-xl mb-6">Write a Review</h3>
                {revSubmitted ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl font-medium border border-green-200">
                    Thank you for your review! It has been submitted and is pending approval.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} type="button" 
                            onClick={() => setRevRating(star)}
                            className={`text-3xl transition-transform hover:scale-110 ${revRating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Name</label>
                      <input 
                        required type="text" value={revName} onChange={e => setRevName(e.target.value)}
                        className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6C3FC5]" 
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Comment</label>
                      <textarea 
                        required rows={4} value={revComment} onChange={e => setRevComment(e.target.value)}
                        className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6C3FC5] resize-none" 
                        placeholder="What did you like about this product?"
                      />
                    </div>
                    <button type="submit" className="bg-[#6C3FC5] text-white px-8 py-3.5 rounded-xl font-bold w-full sm:w-auto self-start hover:bg-[#5530A8] transition-colors mt-2">
                      Submit Review
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
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-10 border-t border-[#E5E0F5]">
          <h2 className="text-3xl font-extrabold font-heading text-[#1A1A2E] mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* PART 6 — STICKY MOBILE BUY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E0F5] px-4 py-3 flex items-center gap-3 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-slideUp">
        <div>
          <p className="text-xs text-[#6B7280]">Price</p>
          <p className="text-lg font-bold text-[#6C3FC5] font-heading">
            Rs. {product.sale_price ? product.sale_price.toLocaleString('en-PK') : product.price_pkr.toLocaleString('en-PK')}
          </p>
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          <a 
            href={`https://wa.me/923001234567?text=${whatsappMessage}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-[#4CAF7D] text-white px-4 py-3 rounded-xl font-semibold text-sm flex-1 max-w-[140px] text-center truncate active:scale-95 transition-transform"
          >
            WhatsApp
          </a>
          <button 
            onClick={handleAddToCart}
            className="bg-[#6C3FC5] text-white px-4 py-3 rounded-xl font-semibold text-sm flex-1 max-w-[140px] text-center truncate active:scale-95 transition-transform"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1A1A2E] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slideUp">
          <span className="text-[#4CAF7D] font-bold">✓</span> Added to cart!
        </div>
      )}

    </main>
  )
}
