'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OfferBannerData {
  id: string
  title: string
  subtitle: string
  badge_text: string
  cta_text: string
  cta_link: string
  end_date: string
  is_active: boolean
}

export default function OfferBanner() {
  const [banner, setBanner] = useState<OfferBannerData | null>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  })

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    fetch(`${backendUrl}/api/offer-banner`)
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          setBanner(data.data)
        }
      })
      .catch((err) => {
        console.warn('OfferBanner fetch failed:', err)
      })
  }, [])

  useEffect(() => {
    if (!banner) return
    
    const calculateTime = () => {
      const end = new Date(banner.end_date).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [banner])

  if (!banner || !banner.is_active) return null

  return (
    <section className="w-full py-16" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #6C3FC5 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-8 lg:px-16">
          
          {/* Left Side */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full font-mono tracking-widest mb-4 font-bold border border-white/30 backdrop-blur-sm">
              {banner.badge_text}
            </span>
            <h2 className="text-5xl font-extrabold font-heading text-white mb-2 leading-tight">
              {banner.title}
            </h2>
            <p className="text-white/80 text-lg font-body mt-2 mb-8 max-w-lg mx-auto lg:mx-0">
              {banner.subtitle}
            </p>
            <Link href={banner.cta_link} className="inline-block bg-white text-[#6C3FC5] px-8 py-4 rounded-xl font-bold font-syne hover:bg-[#EDE6FA] active:scale-95 transition-all shadow-lg text-lg">
              {banner.cta_text}
            </Link>
          </div>

          {/* Right Side (Countdown) */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-4 text-center min-w-[80px] backdrop-blur-sm border border-white/30 border-t-white/50 border-l-white/50 shadow-xl">
              <div className="text-4xl font-extrabold text-white font-heading">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-white/70 text-xs uppercase tracking-wide mt-1 font-bold">Days</div>
            </div>
            <div className="text-white/50 text-2xl font-bold font-heading animate-pulse">:</div>

            <div className="bg-white/20 rounded-xl p-4 text-center min-w-[80px] backdrop-blur-sm border border-white/30 border-t-white/50 border-l-white/50 shadow-xl">
              <div className="text-4xl font-extrabold text-white font-heading">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-white/70 text-xs uppercase tracking-wide mt-1 font-bold">Hours</div>
            </div>
            <div className="text-white/50 text-2xl font-bold font-heading animate-pulse">:</div>

            <div className="bg-white/20 rounded-xl p-4 text-center min-w-[80px] backdrop-blur-sm border border-white/30 border-t-white/50 border-l-white/50 shadow-xl">
              <div className="text-4xl font-extrabold text-white font-heading">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-white/70 text-xs uppercase tracking-wide mt-1 font-bold">Mins</div>
            </div>
            <div className="text-white/50 text-2xl font-bold font-heading animate-pulse">:</div>

            <div className="bg-white/20 rounded-xl p-4 text-center min-w-[80px] backdrop-blur-sm border border-white/30 border-t-white/50 border-l-white/50 shadow-xl">
              <div className="text-4xl font-extrabold text-white font-heading">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-white/70 text-xs uppercase tracking-wide mt-1 font-bold">Secs</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
