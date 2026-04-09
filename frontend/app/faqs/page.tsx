'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MessageCircle, HelpCircle, Truck, CreditCard, ShieldCheck, RotateCcw } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQs & Support - Shopkarro',
  description: 'Find answers to common questions about Shopkarro furniture delivery, payments, returns, and assembly. We are here to help you create your perfect home.',
}

const FAQ_DATA = [
  {
    category: 'Ordering & Delivery',
    icon: <Truck size={20} className="text-[#783A3A]" />,
    questions: [
      {
        q: 'Which cities do you deliver to?',
        a: 'We offer nationwide delivery across Pakistan. Primary cities like Karachi, Lahore, and Islamabad usually receive deliveries within 2-3 business days. Other cities may take 5-7 business days.'
      },
      {
        q: 'What are the delivery charges?',
        a: 'We strive to provide the most competitive rates. Delivery within Karachi and Lahore is often complimentary for specific items. For other locations, a nominal delivery fee is calculated based on the weight and volume of the pieces selected.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Once your order is despatched, you will receive a confirmation email. You can also view your order status by logging into your account or contacting our support team via WhatsApp.'
      }
    ]
  },
  {
    category: 'Payments',
    icon: <CreditCard size={20} className="text-[#783A3A]" />,
    questions: [
      {
        q: 'Do you offer Cash on Delivery (COD)?',
        a: 'Absolutely. We specialize in Cash on Delivery for all our furniture items to ensure maximum trust and security for our customers. You only pay when the item reaches your doorstep.'
      },
      {
        q: 'Are there any other payment methods?',
        a: 'Currently, we focus on Cash on Delivery to provide the safest experience. However, for large corporate orders or specific requests, we can facilitate Bank Transfers. Please contact our support for details.'
      }
    ]
  },
  {
    category: 'Quality & Warranty',
    icon: <ShieldCheck size={20} className="text-[#783A3A]" />,
    questions: [
      {
        q: 'What materials are used in your furniture?',
        a: 'Shopkaroo furniture is crafted using premium materials, including solid seasoned wood, high-density foam, and designer-grade upholstery fabrics. Each piece is designed for longevity and comfort.'
      },
      {
        q: 'Is there a warranty?',
        a: 'We stand by our craftsmanship. Most of our pieces come with a 1-year limited structure warranty. Individual product pages will specify if any additional warranty applies.'
      }
    ]
  },
  {
    category: 'Returns & Cancellations',
    icon: <RotateCcw size={20} className="text-[#783A3A]" />,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day hassle-free return policy if the item delivered is damaged or differs significantly from the description. Please ensure the item is kept in its original condition and packaging.'
      },
      {
        q: 'How do I cancel my order?',
        a: 'You can cancel your order within 24 hours of placement for a full, no-questions-asked cancellation. After 24 hours (once processing has begun), please contact our support team immediately.'
      }
    ]
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>('0-0')

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <main className="bg-white min-h-screen pb-24">
      {/* Breadcrumbs */}
      <div className="bg-[#FAF7F4] border-b border-[#E8E2D9] py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-3 text-[11px] font-bold tracking-[2px] uppercase opacity-40">
          <Link href="/" className="hover:text-[#783A3A] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#783A3A]">Support Center</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <header className="text-center mb-20 animate-slideDown">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F5E8E8] text-[#783A3A] rounded-full mb-6">
            <HelpCircle size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold font-heading text-[#1C1410] leading-tight mb-6">
            Frequently Asked <span className="text-[#783A3A]">Questions</span>
          </h1>
          <p className="text-[#6B6058] text-[16px] md:text-[18px] font-body max-w-2xl mx-auto leading-relaxed opacity-70">
            Everything you need to know about bringing Shopkaroo pieces into your home. Transparency and trust are built into every answer.
          </p>
        </header>

        <div className="space-y-12">
          {FAQ_DATA.map((category, catIdx) => (
            <section key={catIdx} className="animate-slideUp" style={{ animationDelay: `${catIdx * 0.1}s` }}>
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[#FAF7F4]">
                <div className="p-2.5 bg-[#F5E8E8] rounded-[4px]">
                  {category.icon}
                </div>
                <h2 className="text-[20px] font-bold font-heading text-[#1C1410] uppercase tracking-[1px]">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, faqIdx) => {
                  const index = `${catIdx}-${faqIdx}`
                  const isOpen = openIndex === index

                  return (
                    <div 
                      key={faqIdx} 
                      className={`group border rounded-[4px] transition-all duration-300 ${isOpen ? 'border-[#783A3A]/30 bg-[#FAF7F4]' : 'border-[#E8E2D9] bg-white hover:border-[#783A3A]/30'}`}
                    >
                      <button 
                        onClick={() => toggleAccordion(index)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                      >
                        <span className={`text-[15px] md:text-[16px] font-bold font-heading transition-colors ${isOpen ? 'text-[#783A3A]' : 'text-[#1C1410] group-hover:text-[#783A3A]'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown 
                          size={18} 
                          className={`flex-shrink-0 text-[#6B6058] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#783A3A]' : ''}`} 
                        />
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6 animate-slideDown">
                          <p className="text-[#6B6058] text-[14px] md:text-[15px] font-body leading-relaxed opacity-80 border-t border-[#E8E2D9]/30 pt-4">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Support CTA */}
        <section className="mt-24 bg-[#1C1410] p-10 md:p-16 rounded-[4px] text-center relative overflow-hidden shadow-2xl animate-slideUp">
          <div className="relative z-10">
            <h3 className="text-white font-heading font-bold text-[28px] md:text-[36px] mb-6">Still have questions?</h3>
            <p className="text-white/60 font-body text-[15px] md:text-[17px] mb-10 max-w-xl mx-auto leading-relaxed">
              Our dedicated support team is ready to help you architect your perfect living space. We're just a message away.
            </p>
            <a 
              href="https://wa.me/923706905835?text=Hi Shopkaroo! I have some questions about your furniture."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-[3px] font-bold text-[14px] uppercase tracking-[2px] hover:bg-[#1fba59] transition-all shadow-xl active:scale-95"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>
          </div>
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#783A3A]/20 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#783A3A]/10 blur-[80px] -ml-32 -mb-32" />
        </section>
      </div>
    </main>
  )
}
