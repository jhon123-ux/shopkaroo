'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'
import { Package, ArrowRight } from 'lucide-react'

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
      <section className="bg-background py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <FeaturedHeader />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-bg-white rounded-[4px] border border-border overflow-hidden h-[400px] animate-pulse">
                <div className="h-64 bg-surface"></div>
                <div className="p-4 flex flex-col h-full">
                  <div className="h-4 bg-surface rounded-[2px] w-3/4 mb-4"></div>
                  <div className="h-6 bg-surface rounded-[2px] w-1/3 mb-4 mt-auto"></div>
                  <div className="h-[40px] bg-surface rounded-[3px] w-full mt-auto"></div>
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
      <section className="bg-background py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <FeaturedHeader />
          <div className="text-center py-24 bg-bg-white rounded-[4px] border border-border shadow-sm">
            <div className="flex justify-center mb-4 opacity-40 text-text">
              <Package size={48} strokeWidth={1} />
            </div>
            <p className="text-text text-xl font-bold font-heading">
              Products coming soon.
            </p>
            <p className="text-text-muted text-base mt-2 font-body px-4">
              Check back shortly as we add our latest collection!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background py-24 border-b border-border transition-colors duration-300">
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
        <div className="text-[10px] font-semibold tracking-[3px] text-primary mb-3 uppercase font-body">
          FEATURED
        </div>
        <h2 className="text-[36px] font-bold font-heading text-text">
          Featured Furniture
        </h2>
        <p className="text-text-muted text-lg font-body mt-2">
          Handpicked pieces for your home
        </p>
      </div>
      <Link 
        href="/furniture" 
        className="text-primary font-semibold hover:underline flex items-center group font-body text-sm"
      >
        View All Collection 
        <span className="ml-1 group-hover:ml-2 transition-all inline-flex items-center">
          <ArrowRight size={14} />
        </span>
      </Link>
    </div>
  )
}
