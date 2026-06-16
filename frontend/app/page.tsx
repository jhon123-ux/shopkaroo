import dynamic from 'next/dynamic'
import HeroSlider from '@/components/hero/HeroSlider'
import TrustBar from '@/components/home/TrustBar'
import CategorySection from '@/components/home/CategorySection'
import FeaturedProducts from '@/components/home/FeaturedProducts'

// Lazy load below-the-fold sections
const OfferBanner = dynamic(() => import('@/components/home/OfferBanner'))
const WhyShopkarro = dynamic(() => import('@/components/home/WhyShopkarro'))
const CustomerReviews = dynamic(() => import('@/components/home/CustomerReviews'))

export default async function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  let initialProducts = []
  
  try {
    const res = await fetch(`${backendUrl}/api/products?limit=8&is_active=true`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      initialProducts = data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch featured products', err)
  }

  return (
    <main className="overflow-x-hidden">
      <HeroSlider />
      <TrustBar />
      <CategorySection />
      <FeaturedProducts initialProducts={initialProducts} />
      <OfferBanner />
      <WhyShopkarro />
      <CustomerReviews />
    </main>
  )
}
