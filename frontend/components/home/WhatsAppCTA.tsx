import { Phone, Mail } from 'lucide-react'

export default function WhatsAppCTA() {
  return (
    <section 
      className="py-24 flex justify-center items-center"
      style={{ background: 'linear-gradient(135deg, #4A2C6E, #3A1F57)' }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="text-[42px] md:text-[56px] font-bold font-heading text-white mb-6 leading-tight">
          Need Help Choosing?
        </h2>
        
        <p className="text-white/75 text-lg font-body mt-4 mb-12 max-w-xl mx-auto leading-relaxed">
          Our furniture experts are ready to help you find the perfect piece for your home.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="tel:03706905835" 
            className="inline-flex items-center justify-center bg-[#4A2C6E] text-white px-8 py-4 rounded-[3px] font-bold font-body text-base hover:bg-[#3A1F57] transition-all shadow-lg active:scale-95 gap-3 w-full sm:w-auto"
          >
            <Phone size={16} /> Call 03706905835
          </a>

          <a 
            href="mailto:shopkarro.ecom@gmail.com" 
            className="inline-flex items-center justify-center bg-transparent text-white border-[1.5px] border-white px-8 py-4 rounded-[3px] font-bold font-body text-base hover:bg-white/10 transition-all active:scale-95 gap-3 w-full sm:w-auto"
          >
            <Mail size={16} /> Email Us
          </a>
        </div>

      </div>
    </section>
  )
}
