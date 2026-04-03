export default function WhatsAppCTA() {
  return (
    <section 
      className="py-20 flex justify-center items-center"
      style={{ background: 'linear-gradient(135deg, #6C3FC5, #5530A8)' }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        
        <div className="text-5xl mb-6 select-none animate-bounce-short">
          💬
        </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-white mb-4">
          Need Help Choosing?
        </h2>
        
        <p className="text-white/80 text-lg font-body mt-3 mb-10 max-w-lg mx-auto leading-relaxed">
          Our furniture experts are ready to help you find the perfect piece for your home.
        </p>
        
        <a 
          href="https://wa.me/923001234567" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-[#4CAF7D] text-white px-10 py-5 rounded-xl font-bold font-heading text-lg hover:bg-green-600 transition-all shadow-[0_8px_30px_rgb(76,175,125,0.3)] hover:-translate-y-1 active:scale-95"
        >
          Chat on WhatsApp <span className="ml-2 font-body text-xl">→</span>
        </a>

      </div>
    </section>
  )
}
