'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function CategorySection() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        const res = await fetch(`${backendUrl}/api/categories`)
        const data = await res.json()
        setCategories(data.data || [])
      } catch (err) {
        console.error('Category Sync Failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const getGradient = (slug: string) => {
    switch (slug) {
      case 'living-room': return 'linear-gradient(135deg, var(--color-primary), var(--color-brand-black))'
      case 'bedroom': return 'linear-gradient(135deg, var(--color-primary-dark), #3D2B55)'
      case 'office': return 'linear-gradient(135deg, var(--color-brand-black), var(--color-primary))'
      case 'dining': return 'linear-gradient(135deg, #1C1410, var(--color-primary-dark))'
      default: return 'linear-gradient(135deg, var(--color-text-muted), var(--color-border))'
    }
  }

  if (loading && categories.length === 0) return null

  return (
    <section className="bg-bg-white py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-16">
          <h2 className="text-[36px] font-bold font-heading text-text tracking-wide leading-none">
            Shop by Room
          </h2>
        </div>

        <div className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/furniture/${cat.slug}`}
              className="group relative h-[280px] w-[85vw] sm:w-auto flex-shrink-0 snap-start rounded-0 overflow-hidden cursor-pointer block transform transition-transform duration-500 hover:scale-[1.02]"
            >
              {/* Background layer */}
              <div className="absolute inset-0 z-0">
                {cat.image_url ? (
                  <>
                    <Image 
                      src={cat.image_url} 
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-100"></div>
                  </>
                ) : (
                  <div 
                    className="absolute inset-0 z-0"
                    style={{ background: getGradient(cat.slug) }}
                  ></div>
                )}
              </div>

              {/* Decorative Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent z-15 transition-opacity duration-700"></div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white text-left z-20">
                <h3 className="font-heading font-bold text-[24px] drop-shadow-md leading-tight tracking-wide mb-1">
                  {cat.name}
                </h3>
                <div className="flex flex-col">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[2.5px] transition-colors duration-300 group-hover:text-white">
                    Explore Collection
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
