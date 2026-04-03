import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'

export default function NewArrivalsStrip() {
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
      id: "6", name: "Vintage Bookshelf",
      slug: "vintage-bookshelf",
      description: '', material: '', is_active: true,
      price_pkr: 32000, sale_price: null,
      category: "office", images: [],
      created_at: new Date().toISOString(), stock_qty: 4
    }
  ]

  return (
    <section className="bg-[#FFFFFF] py-20 overflow-hidden cursor-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-block bg-[#6C3FC5] text-white text-[10px] px-3 py-1 rounded-full font-mono tracking-widest mb-3 uppercase font-bold shadow-sm">
              NEW
            </div>
            <h2 className="text-3xl font-extrabold font-heading text-[#1A1A2E]">
              Just Landed
            </h2>
          </div>
          <Link href="/furniture" className="text-[#6C3FC5] font-semibold flex items-center group font-body">
            See All <span className="ml-1 group-hover:ml-2 transition-all">→</span>
          </Link>
        </div>

        {/* Scroll Container */}
        <div className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide scroll-smooth snap-x snap-mandatory pr-4">
          
          {mockProducts.map((product) => (
            <div key={product.id} className="min-w-[240px] max-w-[240px] snap-start mb-2">
              <ProductCard product={product} />
            </div>
          ))}

        </div>

      </div>
    </section>
  )
}
