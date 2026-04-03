import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1A1A2E] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading font-bold text-2xl text-primary-soft mb-4">
              Shopkaroo
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium quality furniture for every Pakistani home. Browse elegantly crafted pieces and pay conveniently with cash on delivery nationwide.
            </p>
          </div>

          {/* Shop */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-wider text-gray-300 uppercase text-sm mb-5">Shop</h4>
            <ul className="space-y-3">
              {['living-room', 'bedroom', 'office', 'dining'].map((slug) => (
                <li key={slug}>
                  <Link 
                    href={`/furniture/${slug}`} 
                    className="text-gray-400 hover:text-primary-soft transition-colors text-sm capitalize"
                  >
                    {slug.replace('-', ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-wider text-gray-300 uppercase text-sm mb-5">Help</h4>
            <ul className="space-y-3">
              {['FAQ', 'Returns & Refunds', 'Track Order', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    href="/" 
                    className="text-gray-400 hover:text-primary-soft transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-wider text-gray-300 uppercase text-sm mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-400">
                <span className="mr-3">📱</span> 
                WhatsApp: +92-300-1234567
              </li>
              <li className="flex items-center text-gray-400">
                <span className="mr-3">📧</span> 
                hello@shopkaroo.com
              </li>
              <li className="flex items-center text-gray-400">
                <span className="mr-3">🕐</span> 
                Mon–Sat, 9am–6pm PKT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col items-center justify-between text-xs text-gray-500 sm:flex-row">
          <p>© {currentYear} Shopkaroo. All rights reserved.</p>
          <p className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span>Designed for Pakistan</span> 
            <span className="text-cod-green font-medium">✓ Cash on Delivery Only</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
