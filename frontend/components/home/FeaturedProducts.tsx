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
      <section className="bg-[#FAF7F4] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FeaturedHeader />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-[4px] border border-[#E8E2D9] overflow-hidden h-[400px] animate-pulse">
                <div className="h-64 bg-[#F2EDE6]"></div>
                <div className="p-4 flex flex-col h-full">
                  <div className="h-4 bg-[#F2EDE6] rounded-[2px] w-3/4 mb-4"></div>
                  <div className="h-6 bg-[#F2EDE6] rounded-[2px] w-1/3 mb-4 mt-auto"></div>
                  <div className="h-[40px] bg-[#F2EDE6] rounded-[3px] w-full mt-auto"></div>
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
      <section className="bg-[#FAF7F4] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FeaturedHeader />
          <div className="text-center py-24 bg-white rounded-[4px] border border-[#E8E2D9] shadow-sm">
            <div className="text-4xl mb-4 opacity-40">📦</div>
            <p className="text-[#1C1410] text-xl font-bold font-heading">
              Products coming soon.
            </p>
            <p className="text-[#6B6058] text-base mt-2 font-body px-4">
              Check back shortly as we add our latest collection!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#FAF7F4] py-24 border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-6">
        <FeaturedHeader />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
      <div>
        <div className="text-[10px] font-semibold tracking-[3px] text-[#4A2C6E] mb-3 uppercase font-body">
          FEATURED
        </div>
        <h2 className="text-[36px] font-bold font-heading text-[#1C1410]">
          Featured Furniture
        </h2>
        <p className="text-[#6B6058] text-lg font-body mt-2">
          Handpicked pieces for your home
        </p>
      </div>
      <Link 
        href="/furniture/living-room" 
        className="text-[#4A2C6E] font-semibold hover:underline flex items-center group font-body text-sm"
      >
        View All Collection 
        <span className="ml-1 group-hover:ml-2 transition-all">→</span>
      </Link>
    </div>
  )
}
