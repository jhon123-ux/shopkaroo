'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    fetch(`${backendUrl}/api/products?limit=8&is_active=true`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="bg-[#F7F5FF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedHeader />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-2xl overflow-hidden shadow-sm h-[320px] animate-pulse">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-4 flex flex-col h-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 mt-auto"></div>
                  <div className="h-[44px] bg-gray-200 rounded-xl w-full mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="bg-[#F7F5FF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedHeader />
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E0F5] shadow-sm">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-[#1A1A2E] text-xl font-bold font-heading">
              Products coming soon.
            </p>
            <p className="text-[#6B7280] text-base mt-2">
              Check back shortly as we add our latest collection!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#F7F5FF] py-20 cursor-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedHeader />
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <div key={product.id} className="h-full">
               <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedHeader() {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
      <div>
        <div className="text-xs font-mono tracking-widest text-[#6C3FC5] mb-2 font-bold">
          FEATURED
        </div>
        <h2 className="text-4xl font-extrabold font-heading text-[#1A1A2E]">
          Featured Furniture
        </h2>
        <p className="text-[#6B7280] text-lg font-body mt-2">
          Handpicked pieces for your home
        </p>
      </div>
      <Link 
        href="/furniture/living-room" 
        className="text-[#6C3FC5] font-semibold hover:underline flex items-center group font-body"
      >
        View All Collection 
        <span className="ml-1 group-hover:ml-2 transition-all">→</span>
      </Link>
    </div>
  )
}
