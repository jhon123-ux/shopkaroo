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
    <section className="w-full py-12 px-5 md:px-16 md:py-14 relative overflow-hidden bg-[#1C1410]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#783A3A]/40 to-transparent z-0 opacity-60" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-16 lg:gap-12">
          
          {/* Left Side */}
          <div className="flex-1 text-center lg:text-left max-w-lg">
            <span className="inline-block bg-white/10 text-white text-[11px] px-4 py-1.5 rounded-0 font-bold tracking-[2px] mb-4 lg:mb-8 border border-white/20 uppercase mx-auto lg:mx-0 font-body">
              {banner.badge_text}
            </span>
            <h2 className="text-[32px] sm:text-[36px] md:text-5xl lg:text-5xl font-bold font-heading text-white mb-6 uppercase tracking-widest leading-tight text-center lg:text-left whitespace-nowrap">
              {banner.title}
            </h2>
            <p className="text-white/80 text-[14px] lg:text-lg font-body mt-2 mb-8 max-w-lg mx-auto lg:mx-0 italic leading-relaxed px-4 lg:px-0 text-center lg:text-left">
              {banner.subtitle}
            </p>
            <Link href={banner.cta_link} className="inline-block bg-white text-[#1C1410] px-10 py-3 lg:px-10 lg:py-5 rounded-[3px] font-bold uppercase tracking-[3px] text-[12px] hover:bg-[#FAF7F4] active:scale-95 transition-all shadow-2xl mx-auto lg:mx-0 block lg:inline-block w-auto mb-6 lg:mb-0">
              {banner.cta_text}
            </Link>
          </div>

          {/* Right Side (Countdown) */}
          <div className="flex justify-center gap-3 md:gap-4 w-full max-w-[320px] lg:max-w-none mx-auto lg:mx-0 lg:flex lg:items-center mt-6 lg:mt-0">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.minutes },
              { label: 'Secs', value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={i} className="bg-white/12 rounded-[4px] p-3 md:p-[16px_20px] text-center min-w-[64px] md:min-w-[80px] border border-white/20 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl md:text-[40px] font-bold text-white font-heading leading-tight uppercase">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-white/60 text-[8px] sm:text-[11px] uppercase tracking-[1.5px] mt-1 font-bold font-body">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
