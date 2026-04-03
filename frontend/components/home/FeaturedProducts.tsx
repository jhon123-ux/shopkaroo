import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'

export default async function FeaturedProducts() {
  // Using explicit mock data requested dynamically as per instructions
  const mockProducts: Product[] = [
    { 
      id: "1", name: "Sheesham Wood Sofa Set 3 Seater",
      slug: "sheesham-sofa-set-3-seater",
      description: '', material: '', is_active: true,
      price_pkr: 85000, sale_price: 72000,
      category: "living-room", images: [],
      created_at: new Date().toISOString(), stock_qty: 5
    },
    {
      id: "2", name: "King Size Bed Frame Walnut",
      slug: "king-size-bed-frame-walnut",
      description: '', material: '', is_active: true,
      price_pkr: 65000, sale_price: null,
      category: "bedroom", images: [],
      created_at: new Date().toISOString(), stock_qty: 3
    },
    {
      id: "3", name: "Executive Office Desk",
      slug: "executive-office-desk",
      description: '', material: '', is_active: true,
      price_pkr: 45000, sale_price: 38000,
      category: "office", images: [],
      created_at: new Date().toISOString(), stock_qty: 8
    },
    {
      id: "4", name: "6 Seater Dining Table Set",
      slug: "6-seater-dining-table-set",
      description: '', material: '', is_active: true,
      price_pkr: 72000, sale_price: null,
      category: "dining", images: [],
      created_at: new Date().toISOString(), stock_qty: 2
    },
    {
      id: "5", name: "L-Shape Corner Sofa",
      slug: "l-shape-corner-sofa",
      description: '', material: '', is_active: true,
      price_pkr: 110000, sale_price: 95000,
      category: "living-room", images: [],
      created_at: new Date().toISOString(), stock_qty: 4
    },
    {
      id: "6", name: "Single Bed with Storage",
      slug: "single-bed-with-storage",
      description: '', material: '', is_active: true,
      price_pkr: 38000, sale_price: null,
      category: "bedroom", images: [],
      created_at: new Date().toISOString(), stock_qty: 6
    },
    {
      id: "7", name: "Ergonomic Office Chair",
      slug: "ergonomic-office-chair",
      description: '', material: '', is_active: true,
      price_pkr: 28000, sale_price: 22000,
      category: "office", images: [],
      created_at: new Date().toISOString(), stock_qty: 10
    },
    {
      id: "8", name: "4 Seater Dining Chair Set",
      slug: "4-seater-dining-chair-set",
      description: '', material: '', is_active: true,
      price_pkr: 32000, sale_price: null,
      category: "dining", images: [],
      created_at: new Date().toISOString(), stock_qty: 7
    }
  ]

  let products = mockProducts
  let isError = false

  // Fallback map in case of SSR render block
  if (isError || products.length === 0) {
    return (
      <section className="bg-[#F7F5FF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedHeader />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-2xl overflow-hidden shadow-sm h-[320px] animate-pulse">
                {/* Image Skeleton */}
                <div className="h-44 bg-gray-200"></div>
                {/* Body skeleton */}
                <div className="p-4 flex flex-col h-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 mt-auto"></div>
                  <div className="h-[44px] bg-gray-200 rounded-xl w-full mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#F7F5FF] py-20 cursor-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <FeaturedHeader />

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <div key={product.id} className="h-full">
               <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedHeader() {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
      <div>
        <div className="text-xs font-mono tracking-widest text-[#6C3FC5] mb-2 font-bold">
          FEATURED
        </div>
        <h2 className="text-4xl font-extrabold font-heading text-[#1A1A2E]">
          Featured Furniture
        </h2>
        <p className="text-[#6B7280] text-lg font-body mt-2">
          Handpicked pieces for your home
        </p>
      </div>
      <Link 
        href="/furniture/living-room" 
        className="text-[#6C3FC5] font-semibold hover:underline flex items-center group font-body"
      >
        View All Collection 
        <span className="ml-1 group-hover:ml-2 transition-all">→</span>
      </Link>
    </div>
  )
}
