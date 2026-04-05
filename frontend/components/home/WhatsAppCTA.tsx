export default function WhatsAppCTA() {
  return (
    <section 
      className="py-24 flex justify-center items-center"
      style={{ background: 'linear-gradient(135deg, #4A2C6E, #3A1F57)' }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <div className="text-4xl mb-8 select-none opacity-90">
          💬
        </div>
        
        <h2 className="text-[42px] md:text-[56px] font-bold font-heading text-white mb-6 leading-tight">
          Need Help Choosing?
        </h2>
        
        <p className="text-white/75 text-lg font-body mt-4 mb-12 max-w-lg mx-auto leading-relaxed">
          Our furniture experts are ready to help you find the perfect piece for your home.
        </p>
        
        <a 
          href="https://wa.me/923001234567" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-[#25D366] text-white px-12 py-5 rounded-[3px] font-bold font-body text-base hover:bg-[#1fba59] transition-all shadow-lg active:scale-95"
        >
          Chat on WhatsApp <span className="ml-3 font-body text-xl">→</span>
        </a>

      </div>
    </section>
  )
}
