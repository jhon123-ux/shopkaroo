'use client'

import { useState, useEffect } from 'react'

const reviews = [
  {
    id: 1, name: "Ahmed Khan", city: "Lahore", rating: 5,
    review: "Excellent quality sofa set. Delivered in 3 days to Lahore. COD made it very easy. Highly recommend Shopkaroo!"
  },
  {
    id: 2, name: "Sara Malik", city: "Karachi", rating: 5,
    review: "Ordered a king size bed. Assembly team was very professional. Will definitely order again from Shopkaroo."
  },
  {
    id: 3, name: "Usman Ali", city: "Islamabad", rating: 5,
    review: "Best online furniture shop in Pakistan. Prices are fair and quality is top notch. Very happy customer."
  },
  {
    id: 4, name: "Fatima Zahra", city: "Faisalabad", rating: 4,
    review: "Good experience overall. Dining table looks exactly like the photos. Fast delivery too. Recommended!"
  },
  {
    id: 5, name: "Hassan Raza", city: "Rawalpindi", rating: 5,
    review: "COD option made me trust the website. Furniture quality exceeded my expectations completely."
  }
]

export default function CustomerReviews() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const visible = [
    reviews[current % reviews.length],
    reviews[(current + 1) % reviews.length],
    reviews[(current + 2) % reviews.length],
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-[#6C3FC5] uppercase mb-2">Testimonials</p>
          <h2 className="text-4xl font-extrabold text-[#1A1A2E]" style={{fontFamily: 'Syne, sans-serif'}}>
            What Our Customers Say
          </h2>
          <p className="text-[#6B7280] text-lg mt-3">
            Real reviews from real Pakistani customers
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                "{review.review}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDE6FA] flex items-center justify-center text-[#6C3FC5] font-bold text-sm" style={{fontFamily: 'Syne, sans-serif'}}>
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#1A1A2E] text-sm" style={{fontFamily: 'Syne, sans-serif'}}>
                    {review.name}
                  </p>
                  <p className="text-[#6B7280] text-xs">
                    {review.city}, Pakistan
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#6C3FC5]' : 'w-2 bg-[#E5E0F5]'}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
