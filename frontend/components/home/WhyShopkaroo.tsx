export default function WhyShopkaroo() {
  const cards = [
    {
      icon: '🚚',
      title: 'Delivered to Your Door',
      desc: 'We deliver across 30+ cities in Pakistan including Karachi, Lahore, Islamabad, and Faisalabad.'
    },
    {
      icon: '💰',
      title: 'Cash on Delivery',
      desc: 'No online payment required. Browse, order, and pay cash when your furniture arrives at your home.'
    },
    {
      icon: '✅',
      title: 'Quality Assured',
      desc: 'Every piece is inspected before dispatch. We stand behind the quality of every item we sell.'
    }
  ]

  return (
    <section className="bg-[#F7F5FF] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold font-heading text-[#1A1A2E] mb-3">
            Why Choose Shopkaroo?
          </h2>
          <p className="text-[#6B7280] text-lg font-body max-w-2xl mx-auto">
            Everything you need to shop with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-8 border border-[#E5E0F5] hover:border-[#6C3FC5] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#EDE6FA] rounded-2xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                {card.icon}
              </div>
              
              <h3 className="font-heading font-bold text-xl text-[#1A1A2E] mb-3">
                {card.title}
              </h3>
              
              <p className="text-[#6B7280] text-base leading-relaxed font-body">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
