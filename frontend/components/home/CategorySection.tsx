import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CategorySection() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

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
    <section className="bg-bg-white py-20 md:py-28 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex justify-between items-end mb-12 sm:mb-16">
          <div>
            <div className="text-primary text-[10px] font-bold uppercase tracking-[3px] mb-3">Collections</div>
            <h2 className="text-[36px] md:text-[48px] font-bold font-heading text-text tracking-tight leading-none">
              Shop by Room
            </h2>
          </div>
          
          {/* Desktop/Tablet Nav Arrows */}
          <div className="hidden sm:flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="p-3 border border-border text-text-muted hover:border-primary hover:text-primary transition-all rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 border border-border text-text-muted hover:border-primary hover:text-primary transition-all rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0"
        >
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/furniture/${cat.slug}`}
              className="group relative h-[320px] w-[85vw] sm:w-auto flex-shrink-0 snap-start rounded-[4px] border border-border overflow-hidden cursor-pointer block transform transition-all duration-500 hover:border-primary"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"></div>
                  </>
                ) : (
                  <div 
                    className="absolute inset-0 z-0"
                    style={{ background: getGradient(cat.slug) }}
                  ></div>
                )}
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white text-left z-20">
                <h3 className="font-heading font-bold text-[24px] md:text-[28px] leading-tight tracking-tight mb-2">
                  {cat.name}
                </h3>
                <div className="flex flex-col">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-[2px] flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                    Explore <ArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Mobile Navigation Arrows */}
        <div className="flex sm:hidden justify-center gap-6 mt-8">
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 flex items-center justify-center bg-surface text-text rounded-full shadow-sm active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 flex items-center justify-center bg-surface text-text rounded-full shadow-sm active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>
    </section>
  )
}
