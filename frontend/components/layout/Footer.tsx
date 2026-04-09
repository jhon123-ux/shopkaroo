import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([])

  useEffect(() => {
    const fetchFooterCats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`)
        const data = await res.json()
        if (data.data) {
          setCategories(data.data.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug
          })))
        }
      } catch (err) {
        console.error('Footer category fetch error:', err)
      }
    }
    fetchFooterCats()
  }, [])

  return (
    <footer className="bg-[#1C1410] text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/logo-symbol-light.svg" alt="Shopkarro Logo" width={36} height={36} />
              <h3 className="font-body font-bold text-[28px] text-white m-0">
                Shopkarro
              </h3>
            </div>
            <p className="text-white/50 text-[14px] leading-relaxed mb-6 font-body">
              Crafting premium furniture for every Pakistani home. Browse elegantly designed pieces and pay conveniently with cash on delivery nationwide.
            </p>
          </div>

          {/* Shop */}
          <div className="col-span-1">
            <h4 className="font-semibold tracking-[2px] text-white/50 uppercase text-[11px] mb-8 font-body">Shop</h4>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    href={`/furniture/${cat.slug}`} 
                    className="text-white/60 hover:text-white/90 transition-colors text-[14px] font-body capitalize"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && ['living-room', 'bedroom', 'office', 'dining'].map((slug) => (
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
              {['FAQ', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === 'Privacy Policy' ? '/privacy' : '/faqs'} 
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
              <li className="flex items-center gap-3 text-white/60">
                <Phone size={14} className="opacity-50" />
                <a href="tel:03706905835" className="hover:text-white transition-colors">03706905835</a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail size={14} className="opacity-50" />
                <a href="mailto:shopkarro.ecom@gmail.com" className="hover:text-white transition-colors">shopkarro.ecom@gmail.com</a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Clock size={14} className="opacity-50" />
                <span>Mon-Sat, 9am-6pm PKT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col items-center justify-between text-[12px] text-white/30 sm:flex-row font-body">
          <p>© {currentYear} Shopkarro. All rights reserved.</p>
          <div className="mt-6 sm:mt-0 flex items-center space-x-6">
            <span>Designed for Pakistan</span> 
            <span className="text-[#2D6A4F] font-semibold tracking-wide uppercase text-[10px]">✓ Cash on Delivery Only</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
