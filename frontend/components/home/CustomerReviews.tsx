'use client'

import { useState, useEffect } from 'react'

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    fetch(`${backendUrl}/api/reviews?limit=5&approved=true`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (reviews.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [reviews])

  if (loading || reviews.length === 0) return null

  // Determine visible reviews for the grid
  const visible = [
    reviews[current % reviews.length],
    ...(reviews.length > 1 ? [reviews[(current + 1) % reviews.length]] : []),
    ...(reviews.length > 2 ? [reviews[(current + 2) % reviews.length]] : []),
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-[#783A3A] uppercase mb-2">Testimonials</p>
          <h2 className="text-4xl font-extrabold text-[#1A1A2E]" style={{fontFamily: 'Syne, sans-serif'}}>
            What Our Customers Say
          </h2>
          <p className="text-[#6B7280] text-lg mt-3">
            Real reviews from real Pakistani customers
          </p>
        </div>

        {/* Dynamic Grid */}
        <div className={`grid grid-cols-1 ${reviews.length >= 3 ? 'md:grid-cols-3' : reviews.length === 2 ? 'md:grid-cols-2' : ''} gap-6`}>
          {visible.map((review, index) => (
            <div key={`${review.id}-${index}`}
              className="bg-[#F7F5FF] rounded-2xl p-6 border border-[#E5E0F5]">
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({length: review.rating}).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>

              {/* Review text */}
              <p className="text-[#1A1A2E] text-sm leading-relaxed italic mb-6">
                "{review.comment || review.review}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDE6FA] flex items-center justify-center text-[#783A3A] font-bold text-sm" style={{fontFamily: 'Syne, sans-serif'}}>
                  {(review.name || "U").charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#1A1A2E] text-sm" style={{fontFamily: 'Syne, sans-serif'}}>
                    {review.name}
                  </p>
                  <p className="text-[#6B7280] text-xs">
                    {review.city || "Pakistan"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#783A3A]' : 'w-2 bg-[#E5E0F5]'}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
