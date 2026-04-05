import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CategorySection() {
  const categories = [
    {
      id: 'living-room',
      name: 'Living Room',
      count: '48 Products',
      gradient: 'linear-gradient(135deg, #4A2C6E, #7B5EA7)',
      link: '/furniture/living-room'
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      count: '36 Products',
      gradient: 'linear-gradient(135deg, #3A1F57, #5D4480)',
      link: '/furniture/bedroom'
    },
    {
      id: 'office',
      name: 'Office',
      count: '24 Products',
      gradient: 'linear-gradient(135deg, #1C1410, #4A2C6E)',
      link: '/furniture/office'
    },
    {
      id: 'dining',
      name: 'Dining',
      count: '18 Products',
      gradient: 'linear-gradient(135deg, #2D1B40, #7B5EA7)',
      link: '/furniture/dining'
    }
  ]

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-16">
          <h2 className="text-[36px] font-bold font-heading text-[#1C1410]">
            Shop by Room
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={cat.link}
              className="group relative h-[200px] rounded-[4px] overflow-hidden cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all duration-300 block"
            >
              {/* Background gradient */}
              <div 
                className="absolute inset-0"
                style={{ background: cat.gradient }}
              ></div>

              {/* Decorative overlay pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white text-left z-10 w-full">
                <h3 className="font-heading font-bold text-[20px] drop-shadow-sm leading-tight">{cat.name}</h3>
                <p className="text-white/60 text-[13px] font-body mt-1">{cat.count}</p>
                
                <div className="absolute bottom-4 right-4 text-white/50 text-[12px] font-body font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   Explore <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
