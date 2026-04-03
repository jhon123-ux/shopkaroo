'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Banner } from '@/types'

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
      <div className="bg-[#F7F5FF] px-3 py-3 md:px-6 md:py-6 w-full">
        <div className="min-h-screen bg-gradient-to-r from-[#1A1A2E] to-[#2D1B69] animate-pulse flex items-center relative overflow-hidden rounded-2xl shadow-2xl">
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
    badge_color: '#6C3FC5',
    cta_primary_text: 'Shop Now',
    cta_primary_link: '/furniture/living-room',
    cta_secondary_text: 'WhatsApp Us',
    cta_secondary_link: 'https://wa.me/923001234567',
    bg_image_url: null,
    bg_overlay: 'rgba(26,26,46,0.6)',
    sort_order: 1,
    is_active: true
  }]

  const banner = displayBanners[currentSlide]

  return (
    <div className="bg-[#F7F5FF] px-3 py-3 md:px-6 md:py-6 w-full">
      <section 
        className="relative min-h-screen w-full flex items-center overflow-hidden bg-[#1A1A2E] rounded-2xl shadow-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      {/* Background Layers */}
      {displayBanners.map((b, idx) => (
        <div
          key={`bg-${b.id}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
        >
          {b.bg_image_url ? (
            <>
              <Image 
                src={b.bg_image_url}
                alt="Banner background"
                fill
                className="object-cover"
                priority={idx === 0}
              />
              <div className="absolute inset-0 z-0" style={{ background: b.bg_overlay }}></div>
            </>
          ) : (
            <div 
              className="absolute inset-0 z-0" 
              style={{ background: `linear-gradient(135deg, ${b.badge_color}40, #1A1A2E)` }}
            >
              <div className="absolute inset-0 z-0" style={{ background: b.bg_overlay }}></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>
          )}
        </div>
      ))}

      {/* Content Container */}
      <div className="max-w-7xl mx-auto pl-6 md:pl-8 xl:pl-16 pr-6 w-full relative z-10 flex items-center justify-start min-h-screen">
        <div className="max-w-2xl w-full">
          
          {/* Badge */}
          {banner.badge_text && (
            <div 
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm animate-slideUp"
              style={{ background: `${banner.badge_color}40` }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse shadow-lg"
                style={{ background: banner.badge_color }}
              ></span>
              <span className="font-mono text-xs tracking-widest uppercase text-white font-bold drop-shadow-md">
                {banner.badge_text}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 
            key={`title-${currentSlide}`}
            className="font-heading font-extrabold tracking-tight text-3xl md:text-4xl lg:text-5xl xl:text-7xl text-white leading-tight animate-slideUp drop-shadow-lg"
          >
            {banner.title}
          </h1>

          {/* Subtitle */}
          <p 
            key={`sub-${currentSlide}`}
            className="font-body text-white/90 text-xl mt-4 mb-10 max-w-xl leading-relaxed animate-slideUp drop-shadow-md"
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
              className="bg-white text-[#1A1A2E] px-10 py-4 rounded-xl font-bold font-heading text-base text-center shadow-xl hover:bg-[#EDE6FA] hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              {banner.cta_primary_text}
            </Link>
            
            {banner.cta_secondary_text && (
              <Link
                href={banner.cta_secondary_link}
                className="border-2 border-white/60 text-white px-10 py-4 rounded-xl font-semibold font-body text-base text-center hover:bg-white/10 hover:border-white transition-all duration-300 active:scale-95 backdrop-blur-sm"
              >
                {banner.cta_secondary_text}
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Navigation Arrows (Only show if multiple slides) */}
      {displayBanners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/25 hover:scale-105 transition-all outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/25 hover:scale-105 transition-all outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm border border-white/10">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-8 h-2 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2 h-2 hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-float pointer-events-none opacity-60">
        <span className="text-white text-xs tracking-[0.2em] font-mono mb-2 drop-shadow-md uppercase">Scroll</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

    </section>
    </div>
  )
}
