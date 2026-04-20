import { Truck, RotateCcw, ShieldCheck } from 'lucide-react'

export default function TrustBar() {
  const trustItems = [
    {
      icon: <Truck size={24} className="text-primary-soft" />,
      title: "Cash on Delivery",
      subtitle: "Pay at your doorstep"
    },
    {
      icon: <RotateCcw size={24} className="text-primary-soft" />,
      title: "7-Day Returns",
      subtitle: "Hassle-free returns"
    },
    {
      icon: <ShieldCheck size={24} className="text-primary-soft" />,
      title: "Quality Guaranteed",
      subtitle: "Inspected before dispatch"
    }
  ]

  // Duplicate items for seamless loop
  const duplicatedItems = [...trustItems, ...trustItems, ...trustItems, ...trustItems]

  return (
    <section className="w-full bg-brand-black py-7 border-y border-border transition-colors duration-300 overflow-hidden group">
      <div className="relative flex items-center pause-on-hover">
        {/* Main Marquee Wrapper */}
        <div className="flex animate-marquee whitespace-nowrap">
          {/* We render the set twice to ensure the second set follows the first immediately */}
          {[1, 2].map((set) => (
            <div key={set} className="flex items-center">
              {trustItems.map((item, idx) => (
                <div key={`${set}-${idx}`} className="flex items-center shrink-0">
                  {/* Item content */}
                  <div className="flex items-center gap-4 px-12 group/item cursor-default">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[13px] font-body uppercase tracking-[2px]">
                        {item.title}
                      </h3>
                      <p className="text-white/40 text-[11px] font-body mt-0.5 tracking-wide">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Vertical Divider */}
                  <div className="w-px h-10 bg-white/10 mx-4"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
