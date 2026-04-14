'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'
import { ArrowRight } from 'lucide-react'

export default function NewArrivalsStrip() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    fetch(`${backendUrl}/api/products?limit=6&sort=newest`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="bg-bg-white py-20 overflow-hidden cursor-default transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-block bg-primary text-white text-[10px] px-3 py-1 rounded-full font-mono tracking-widest mb-3 uppercase font-bold shadow-sm">
              NEW
            </div>
            <h2 className="text-3xl font-extrabold font-heading text-text">
              Just Landed
            </h2>
          </div>
          <Link href="/furniture" className="text-primary font-semibold flex items-center group font-body">
            See All <span className="ml-1 group-hover:ml-2 transition-all inline-flex items-center">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        {/* Scroll Container */}
        <div className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide scroll-smooth snap-x snap-mandatory pr-4">
          
          {products.map((product) => (
            <div key={product.id} className="min-w-[240px] max-w-[240px] snap-start mb-2">
              <ProductCard product={product} />
            </div>
          ))}

        </div>

      </div>
    </section>
  )
}
