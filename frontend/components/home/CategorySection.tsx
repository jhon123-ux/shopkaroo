'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

export default function CategorySection() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        // Get all categories to compute hierarchy logic or use nested=true
        const res = await fetch(`${backendUrl}/api/categories?nested=true`)
        const data = await res.json()
        
        // Match Part 1 request: 3 category cards + 1 CTA card on desktop
        setCategories(data.data?.slice(0, 3) || [])
      } catch (err) {
        console.error('Category Sync Failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading && categories.length === 0) return null

  return (
    <section className="bg-bg-white py-20 md:py-32 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-0 md:px-6">
        
        <div className="px-6 md:px-0 mb-12 sm:mb-16">
          <div className="text-primary text-[11px] font-bold uppercase tracking-[4px] mb-4 opacity-70">Collections</div>
          <h2 className="text-[36px] md:text-[56px] font-bold font-heading text-text tracking-tight leading-[1.1]">
            Shop by Room
          </h2>
        </div>

        {/* EQUAL WIDTH ROW */}
        <div 
          className="flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory gap-3 px-5 md:px-0 no-scrollbar"
        >
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          
          {categories.map((cat) => {
             const hasSubcategories = cat.children && cat.children.length > 0
             const destination = hasSubcategories 
               ? `/categories/${cat.slug}`
               : `/products?category=${cat.id}`

             return (
              <Link 
                key={cat.id} 
                href={destination}
                className="group relative flex-[0_0_calc(50%-6px)] md:flex-1 min-w-0 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer block snap-start transition-all duration-500 bg-surface border border-transparent hover:border-primary/20"
              >
                {/* Image Layer */}
                <div className="absolute inset-0 z-0">
                  {cat.image_url ? (
                    <Image 
                      src={cat.image_url} 
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#F5F2EF]" />
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end text-white text-left z-20">
                  <h3 className="font-heading font-bold text-[20px] md:text-[32px] leading-tight mb-2 tracking-tight group-hover:translate-y-[-4px] transition-transform duration-300">
                    {cat.name}
                  </h3>
                  <div className="overflow-hidden h-6">
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-[2px] flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                      EXPLORE <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </Link>
             )
          })}

          {/* CTA CARD */}
          <div 
            onClick={() => router.push('/categories')}
            className="group relative flex-[0_0_calc(50%-6px)] md:flex-1 min-w-0 aspect-[3/4] snap-start rounded-2xl bg-primary hover:bg-primary-dark transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:border-white/40 transition-all">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="text-white font-heading font-bold text-[20px] md:text-[32px] mb-2 leading-[1.1]">
              All Categories
            </h3>
            <p className="text-white/60 text-[12px] md:text-[14px] font-body mb-8 max-w-[140px] mx-auto leading-relaxed">
              Browse the full collection
            </p>
            {/* Pill button matching existing primary style */}
            <div className="bg-white text-primary px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[2px] hover:scale-105 transition-all shadow-lg active:scale-95">
              View All
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
