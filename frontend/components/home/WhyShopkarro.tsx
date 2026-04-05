import { Truck, Banknote, ShieldCheck } from 'lucide-react'

export default function WhyShopkarro() {
  const cards = [
    {
      icon: <Truck size={24} className="text-[#4A2C6E]" />,
      title: 'Delivered to Your Door',
      desc: 'We deliver across 30+ cities in Pakistan including Karachi, Lahore, Islamabad, and Faisalabad.'
    },
    {
      icon: <Banknote size={24} className="text-[#4A2C6E]" />,
      title: 'Cash on Delivery',
      desc: 'No online payment required. Browse, order, and pay cash when your furniture arrives at your home.'
    },
    {
      icon: <ShieldCheck size={24} className="text-[#4A2C6E]" />,
      title: 'Quality Assured',
      desc: 'Every piece is inspected before dispatch. We stand behind the quality of every item we sell.'
    }
  ]

  return (
    <section className="bg-[#FAF7F4] py-24 border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <h2 className="text-[36px] font-bold font-heading text-[#1C1410] mb-4">
            Why Choose Shopkarro?
          </h2>
          <p className="text-[#6B6058] text-lg font-body max-w-xl mx-auto opacity-80">
            Precision craftsmanship and reliable delivery for every home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-[4px] p-8 border border-[#E8E2D9] hover:border-[#4A2C6E] transition-all duration-300 group"
            >
              <div className="w-[52px] h-[52px] bg-[#F0EBF8] rounded-[3px] flex items-center justify-center mb-8 text-2xl group-hover:scale-105 transition-transform duration-300">
                {card.icon}
              </div>
              
              <h3 className="font-heading font-semibold text-[18px] text-[#1C1410] mb-4">
                {card.title}
              </h3>
              
              <p className="text-[#6B6058] text-[14px] leading-relaxed font-body">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
