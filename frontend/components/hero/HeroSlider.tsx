'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Banner } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Fetch banners on mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        const res = await fetch(`${backendUrl}/api/banners`)
        if (res.ok) {
          const json = await res.json()
          setBanners(json.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch banners', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  // Auto-play logic
  useEffect(() => {
    if (banners.length <= 1 || isPaused || loading) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= banners.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length, isPaused, loading])

  // Handlers
  const nextSlide = () => setCurrentSlide((p) => (p >= banners.length - 1 ? 0 : p + 1))
  const prevSlide = () => setCurrentSlide((p) => (p <= 0 ? banners.length - 1 : p - 1))

  // Render Skeleton Loading State
  if (loading) {
    return (
      <div className="bg-surface px-3 py-3 md:px-6 md:py-6 w-full transition-colors duration-300">
        <div className="min-h-screen bg-gradient-to-r from-brand-black to-primary animate-pulse flex items-center relative overflow-hidden rounded-2xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className="max-w-2xl">
              <div className="h-6 w-32 bg-white/20 rounded-full mb-6"></div>
              <div className="h-16 w-3/4 bg-white/20 rounded-lg mb-4"></div>
              <div className="h-16 w-1/2 bg-white/20 rounded-lg mb-6"></div>
              <div className="h-6 w-full bg-white/20 rounded mb-2"></div>
              <div className="h-6 w-2/3 bg-white/20 rounded mb-8"></div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-white/20 rounded-xl"></div>
                <div className="h-12 w-32 bg-white/20 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback if no active banners returned from DB
  const displayBanners = banners.length > 0 ? banners : [{
    id: 'fallback',
    title: 'Furnish Your Home With Style',
    subtitle: 'Premium quality furniture delivered to your door. Pay cash on delivery.',
    badge_text: 'New Arrivals',
    badge_color: 'var(--color-primary)',
    cta_primary_text: 'Shop Now',
    cta_primary_link: '/furniture/living-room',
    cta_secondary_text: 'WhatsApp Us',
    cta_secondary_link: 'https://wa.me/923001234567',
    bg_image_url: null,
    bg_overlay: 'rgba(0,0,0,0.4)',
    sort_order: 1,
    is_active: true
  }]

  const banner = displayBanners[currentSlide]

  return (
    <div className="bg-background px-4 py-4 md:px-5 md:py-5 w-full transition-colors duration-300">
      <section 
        className="relative min-h-[85vh] w-full flex items-center overflow-hidden bg-text rounded-[6px] shadow-sm transition-all duration-500"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      {/* Background Layers */}
      {displayBanners.map((b, idx) => (
        <div
          key={`bg-${b.id}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
        >
          {b.bg_image_url ? (
            <>
              <Image 
                src={b.bg_image_url}
                alt="Banner background"
                fill
                priority={idx === 0}
                loading={idx === 0 ? undefined : "lazy"}
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 z-0" style={{ background: b.bg_overlay }}></div>
            </>
          ) : (
            <div 
              className="absolute inset-0 z-0" 
              style={{ background: `linear-gradient(135deg, ${b.badge_color}40, var(--color-text))` }}
            >
              <div className="absolute inset-0 z-0" style={{ background: b.bg_overlay }}></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>
          )}
        </div>
      ))}

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-20 w-full relative z-10 flex items-center justify-start min-h-[85vh]">
        <div className="max-w-2xl w-full py-20">
          
          {/* Badge */}
          {banner.badge_text && (
            <div 
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2 mb-8 animate-slideUp"
            >
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: banner.badge_color }}
              ></span>
              <span className="font-body text-[10px] tracking-[3px] uppercase text-white font-bold opacity-80">
                {banner.badge_text}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 
            key={`title-${currentSlide}`}
            className="font-heading font-black text-4xl md:text-5xl lg:text-7xl text-white leading-[1.1] animate-slideUp"
          >
            {banner.title}
          </h1>

          {/* Subtitle */}
          <p 
            key={`sub-${currentSlide}`}
            className="font-body text-white/75 text-lg md:text-xl mt-6 mb-12 max-w-lg leading-relaxed animate-slideUp"
            style={{ animationDelay: '150ms' }}
          >
            {banner.subtitle}
          </p>

          {/* CTA Buttons */}
          <div 
            key={`btns-${currentSlide}`}
            className="flex flex-col sm:flex-row gap-4 animate-slideUp"
            style={{ animationDelay: '250ms' }}
          >
            <Link 
              href={banner.cta_primary_link}
              className="bg-bg-white text-text px-10 py-4 rounded-[3px] font-bold font-body text-sm text-center shadow-lg hover:bg-surface transition-all duration-300 active:scale-95"
            >
              {banner.cta_primary_text}
            </Link>
            
            {banner.cta_secondary_text && (
              <Link
                href={banner.cta_secondary_link}
                className="border-[1.5px] border-white text-white px-10 py-4 rounded-[3px] font-semibold font-body text-sm text-center hover:bg-white/10 transition-all duration-300 active:scale-95"
              >
                {banner.cta_secondary_text}
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      {displayBanners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-all opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={40} strokeWidth={1} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-all opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={40} strokeWidth={1} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-500 rounded-[1px] ${idx === currentSlide ? 'bg-white w-6 h-[1.5px]' : 'bg-white/40 w-[6px] h-[1.5px] hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </section>
    </div>
  )
}
