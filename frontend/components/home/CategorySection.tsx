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
        const res = await fetch(`${backendUrl}/api/categories`)
        const data = await res.json()
        // We only want the first 3 categories for the desktop layout
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
        
        <div className="px-6 md:px-0 flex justify-between items-end mb-12 sm:mb-16">
          <div>
            <div className="text-primary text-[11px] font-bold uppercase tracking-[4px] mb-4 opacity-70">Collections</div>
            <h2 className="text-[36px] md:text-[56px] font-bold font-heading text-text tracking-tight leading-[1.1]">
              Shop by Room
            </h2>
          </div>
        </div>

        {/* HORIZONTAL SCROLL ROW */}
        <div 
          className="flex overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory gap-5 px-5 md:px-0 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/furniture/${cat.slug}`}
              className="group relative flex-shrink-0 w-[58%] md:flex-1 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer block snap-start transition-all duration-500 bg-surface border border-transparent hover:border-primary/20"
            >
              {/* Image Layer */}
              <div className="absolute inset-0 z-0">
                {cat.image_url ? (
                  <Image 
                    src={cat.image_url} 
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 60vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                   <div className="absolute inset-0 bg-[#F5F2EF]" />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-90"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white text-left z-20">
                <h3 className="font-heading font-bold text-[24px] md:text-[32px] leading-tight mb-2 tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-[2px] flex items-center gap-2 group-hover:text-white transition-colors">
                  EXPLORE <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>
          ))}

          {/* CTA CARD */}
          <div 
            onClick={() => router.push('/categories')}
            className="flex-shrink-0 w-[52%] md:flex-1 aspect-[3/4] snap-start rounded-2xl bg-[#4A2C6E] hover:bg-[#3a2057] transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-6 text-white/50 group-hover:text-white group-hover:border-white/40 transition-all">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="text-white font-heading font-bold text-[22px] md:text-[28px] mb-2">
              All Categories
            </h3>
            <p className="text-white/60 text-[12px] md:text-[14px] font-body mb-8 max-w-[120px] mx-auto leading-relaxed">
              Browse the full collection
            </p>
            <div className="bg-white text-[#4A2C6E] px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[2px] hover:scale-105 transition-transform">
              View All
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
