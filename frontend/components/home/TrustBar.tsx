import { Truck, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react'

export default function TrustBar() {
  return (
    <section className="w-full bg-text py-6 border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-y-8 gap-x-12">
          
          <div className="flex items-center gap-4 min-w-[200px] group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Truck size={24} className="text-primary-soft" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[13px] font-body uppercase tracking-[2px]">Cash on Delivery</h3>
              <p className="text-white/40 text-[12px] font-body mt-0.5">Pay at your doorstep</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10"></div>

          <div className="flex items-center gap-4 min-w-[200px] group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <RotateCcw size={24} className="text-primary-soft" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[13px] font-body uppercase tracking-[2px]">7-Day Returns</h3>
              <p className="text-white/40 text-[12px] font-body mt-0.5">Hassle-free returns</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-12 bg-white/10"></div>

          <div className="flex items-center gap-4 min-w-[200px] group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ShieldCheck size={24} className="text-primary-soft" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[13px] font-body uppercase tracking-[2px]">Quality Guaranteed</h3>
              <p className="text-white/40 text-[12px] font-body mt-0.5">Inspected before dispatch</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
