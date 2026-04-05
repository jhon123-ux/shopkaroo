import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1C1410] text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading italic font-bold text-[28px] text-white mb-6">
              Shopkaroo
            </h3>
            <p className="text-white/50 text-[14px] leading-relaxed mb-6 font-body">
              Crafting premium furniture for every Pakistani home. Browse elegantly designed pieces and pay conveniently with cash on delivery nationwide.
            </p>
          </div>

          {/* Shop */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-[2px] text-white/50 uppercase text-[11px] mb-8 font-body">Shop</h4>
            <ul className="space-y-4">
              {['living-room', 'bedroom', 'office', 'dining'].map((slug) => (
                <li key={slug}>
                  <Link 
                    href={`/furniture/${slug}`} 
                    className="text-white/60 hover:text-white/90 transition-colors text-[14px] font-body capitalize"
                  >
                    {slug.replace('-', ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-[2px] text-white/50 uppercase text-[11px] mb-8 font-body">Help</h4>
            <ul className="space-y-4">
              {['FAQ', 'Returns & Refunds', 'Track Order', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    href="/" 
                    className="text-white/60 hover:text-white/90 transition-colors text-[14px] font-body"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-[2px] text-white/50 uppercase text-[11px] mb-8 font-body">Contact</h4>
            <ul className="space-y-4 text-[14px] font-body">
              <li className="flex items-center text-white/60">
                <span className="mr-4 opacity-50">📱</span> 
                WhatsApp: +92-300-1234567
              </li>
              <li className="flex items-center text-white/60">
                <span className="mr-4 opacity-50">📧</span> 
                hello@shopkaroo.com
              </li>
              <li className="flex items-center text-white/60">
                <span className="mr-4 opacity-50">🕐</span> 
                Mon–Sat, 9am–6pm PKT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col items-center justify-between text-[12px] text-white/30 sm:flex-row font-body">
          <p>© {currentYear} Shopkaroo. All rights reserved.</p>
          <div className="mt-6 sm:mt-0 flex items-center space-x-6">
            <span>Designed for Pakistan</span> 
            <span className="text-[#2D6A4F] font-semibold tracking-wide uppercase text-[10px]">✓ Cash on Delivery Only</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
