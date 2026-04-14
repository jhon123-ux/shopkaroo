'use client'
import dynamic from 'next/dynamic'
import HeroSlider from '@/components/hero/HeroSlider'
import TrustBar from '@/components/home/TrustBar'
import CategorySection from '@/components/home/CategorySection'
import FeaturedProducts from '@/components/home/FeaturedProducts'

// Lazy load below-the-fold sections
const OfferBanner = dynamic(() => import('@/components/home/OfferBanner'), { ssr: false })
const WhyShopkarro = dynamic(() => import('@/components/home/WhyShopkarro'), { ssr: false })
const CustomerReviews = dynamic(() => import('@/components/home/CustomerReviews'), { ssr: false })
const WhatsAppCTA = dynamic(() => import('@/components/home/WhatsAppCTA'), { ssr: false })

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <HeroSlider />
      <TrustBar />
      <CategorySection />
      <FeaturedProducts />
      <OfferBanner />
      <WhyShopkarro />
      <CustomerReviews />
      <WhatsAppCTA />
    </main>
  )
}
