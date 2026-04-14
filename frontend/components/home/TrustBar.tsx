import { Truck, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react'

export default function TrustBar() {
  return (
    <section className="w-full bg-text py-6 border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-y-8 gap-x-12">
          
          <div className="flex items-center gap-4 min-w-[200px]">
            <Truck size={20} className="text-primary-light" />
            <div>
              <h3 className="text-white/90 font-semibold text-[13px] font-body uppercase tracking-wider">Cash on Delivery</h3>
              <p className="text-white/50 text-[12px] font-body mt-0.5">Pay at your doorstep</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-white/10"></div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <RotateCcw size={20} className="text-primary-light" />
            <div>
              <h3 className="text-white/90 font-semibold text-[13px] font-body uppercase tracking-wider">7-Day Returns</h3>
              <p className="text-white/50 text-[12px] font-body mt-0.5">Hassle-free returns</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-10 bg-white/10"></div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <ShieldCheck size={20} className="text-primary-light" />
            <div>
              <h3 className="text-white/90 font-semibold text-[13px] font-body uppercase tracking-wider">Quality Guaranteed</h3>
              <p className="text-white/50 text-[12px] font-body mt-0.5">Inspected before dispatch</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
