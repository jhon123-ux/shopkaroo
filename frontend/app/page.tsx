import HeroSlider from '@/components/hero/HeroSlider'
import TrustBar from '@/components/home/TrustBar'
import CategorySection from '@/components/home/CategorySection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import NewArrivalsStrip from '@/components/home/NewArrivalsStrip'
import OfferBanner from '@/components/home/OfferBanner'
import WhyShopkarro from '@/components/home/WhyShopkarro'
import CustomerReviews from '@/components/home/CustomerReviews'
import WhatsAppCTA from '@/components/home/WhatsAppCTA'

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <HeroSlider />
      <TrustBar />
      <CategorySection />
      <FeaturedProducts />
      <NewArrivalsStrip />
      <OfferBanner />
      <WhyShopkarro />
      <CustomerReviews />
      <WhatsAppCTA />
    </main>
  )
}
