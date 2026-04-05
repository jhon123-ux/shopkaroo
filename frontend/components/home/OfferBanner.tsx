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
    <section className="w-full py-20 relative overflow-hidden bg-[#1C1410]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A2C6E]/40 to-transparent z-0 opacity-60" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-16 lg:gap-12">
          
          {/* Left Side */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-white/10 text-white text-[10px] px-4 py-1.5 rounded-0 font-bold tracking-[3px] mb-8 border border-white/20 uppercase">
              {banner.badge_text}
            </span>
            <h2 className="text-[42px] font-bold font-heading text-white mb-6 uppercase tracking-widest leading-tight">
              {banner.title}
            </h2>
            <p className="text-white/70 text-[16px] font-body mt-2 mb-10 max-w-lg mx-auto lg:mx-0 italic leading-relaxed">
              {banner.subtitle}
            </p>
            <Link href={banner.cta_link} className="inline-block bg-white text-[#1C1410] px-10 py-5 rounded-0 font-bold uppercase tracking-[3px] text-[12px] hover:bg-[#FAF7F4] active:scale-95 transition-all shadow-2xl">
              {banner.cta_text}
            </Link>
          </div>

          {/* Right Side (Countdown) */}
          <div className="flex items-center gap-6">
            <div className="bg-white/5 rounded-0 p-8 text-center min-w-[100px] border border-white/10 backdrop-blur-sm">
              <div className="text-[32px] font-bold text-white font-heading">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-[3px] mt-2 font-bold">Days</div>
            </div>

            <div className="bg-white/5 rounded-0 p-8 text-center min-w-[100px] border border-white/10 backdrop-blur-sm">
              <div className="text-[32px] font-bold text-white font-heading">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-[3px] mt-2 font-bold">Hours</div>
            </div>

            <div className="bg-white/5 rounded-0 p-8 text-center min-w-[100px] border border-white/10 backdrop-blur-sm">
              <div className="text-[32px] font-bold text-white font-heading">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-[3px] mt-2 font-bold">Mins</div>
            </div>

            <div className="bg-white/5 rounded-0 p-8 text-center min-w-[100px] border border-white/10 backdrop-blur-sm">
              <div className="text-[32px] font-bold text-white font-heading">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-[3px] mt-2 font-bold">Secs</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
