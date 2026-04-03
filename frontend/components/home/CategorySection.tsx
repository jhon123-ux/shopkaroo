import Link from 'next/link'

export default function CategorySection() {
  const categories = [
    {
      id: 'living-room',
      name: 'Living Room',
      icon: '🛋️',
      count: '48 Products',
      gradient: 'linear-gradient(135deg, #6C3FC5, #8B5CF6)',
      link: '/furniture/living-room'
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      icon: '🛏️',
      count: '36 Products',
      gradient: 'linear-gradient(135deg, #5530A8, #7C3AED)',
      link: '/furniture/bedroom'
    },
    {
      id: 'office',
      name: 'Office',
      icon: '🪑',
      count: '24 Products',
      gradient: 'linear-gradient(135deg, #4C1D95, #6D28D9)',
      link: '/furniture/office'
    },
    {
      id: 'dining',
      name: 'Dining',
      icon: '🍽️',
      count: '18 Products',
      gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
      link: '/furniture/dining'
    }
  ]

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold font-heading text-[#1A1A2E]">
            Shop by Room
          </h2>
          <div className="w-16 h-1 bg-[#6C3FC5] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={cat.link}
              className="group relative h-[240px] rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 block"
            >
              {/* Background gradient */}
              <div 
                className="absolute inset-0"
                style={{ background: cat.gradient }}
              ></div>

              {/* Decorative overlay pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-center text-white text-left z-10 w-full">
                <div className="text-6xl mb-4 drop-shadow-sm">{cat.icon}</div>
                <h3 className="font-heading font-extrabold text-2xl drop-shadow-sm">{cat.name}</h3>
                <p className="text-white/80 text-base mt-2">{cat.count}</p>
                
                <div className="absolute bottom-5 left-6 text-white/70 text-sm font-medium flex items-center">
                   Explore <span className="ml-1 text-lg leading-none">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
