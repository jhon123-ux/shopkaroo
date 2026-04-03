export default function TrustBar() {
  return (
    <section className="w-full bg-[#1A1A2E] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-8 md:justify-between">
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <h3 className="text-white font-semibold text-sm font-heading">Cash on Delivery</h3>
              <p className="text-white/60 text-xs font-body">Pay at your doorstep</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-white/20"></div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h3 className="text-white font-semibold text-sm font-heading">Free Delivery</h3>
              <p className="text-white/60 text-xs font-body">Karachi & Lahore</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-white/20"></div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h3 className="text-white font-semibold text-sm font-heading">7-Day Returns</h3>
              <p className="text-white/60 text-xs font-body">Hassle-free returns</p>
            </div>
          </div>

          <div className="hidden xl:block w-px h-8 bg-white/20"></div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="text-white font-semibold text-sm font-heading">Quality Guaranteed</h3>
              <p className="text-white/60 text-xs font-body">Inspected before dispatch</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
