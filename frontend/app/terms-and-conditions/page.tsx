import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Shopkarro',
  description: 'Terms and Conditions for Shopkarro — Your guide to using our services and making purchases.',
}

export default function TermsAndConditionsPage() {
  const today = new Date().toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <main className="bg-background min-h-screen transition-colors duration-300">
      
      {/* Navigation Top Bar */}
      <nav className="bg-bg-white border-b border-border py-4 sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-text-muted hover:text-primary transition-colors text-[11px] font-bold uppercase tracking-[2px]">
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="text-[14px] font-heading font-bold text-text">Shopkarro</div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-brand-black py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-primary font-bold text-[11px] tracking-[4px] uppercase mb-6 font-body">
            Legal Agreement
          </p>
          <h1 className="text-white text-[42px] md:text-[64px] font-bold font-heading mb-6 leading-tight">
            Terms & <span className="text-primary-soft">Conditions</span>
          </h1>
          <p className="text-white/40 text-[14px] font-body tracking-wider uppercase">
            Last updated: {today}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Intro */}
        <div className="bg-bg-white border border-border p-10 mb-16 shadow-sm rounded-[4px] transition-colors">
          <p className="text-text-muted text-[16px] leading-relaxed font-body">
            Welcome to <strong className="text-text">Shopkarro</strong>. By accessing and using our website 
            <strong className="text-primary"> shopkarro.com</strong>, you agree to comply with and be bound by the 
            following terms and conditions. These terms govern our relationship with you relative to this website. 
            If you have any questions, please contact us at 
            <a href="mailto:shopkarro.ecom@gmail.com" className="text-text font-bold hover:text-primary mx-1">shopkarro.ecom@gmail.com</a> 
            or call <a href="tel:03706905835" className="text-text font-bold hover:text-primary">03706905835</a>.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section, index) => (
            <section key={index} className="animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center gap-5 mb-8">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-tint flex items-center justify-center rounded-[2px] transition-colors">
                  <span className="text-primary text-[16px] font-bold font-heading">
                    {index + 1}
                  </span>
                </div>
                <h2 className="text-text text-[22px] md:text-[26px] font-bold font-heading">
                  {section.title}
                </h2>
              </div>
              
              <div className="ml-0 md:ml-12 space-y-6">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-text-muted text-[15px] md:text-[16px] leading-relaxed font-body opacity-80">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {index < sections.length - 1 && (
                <div className="mt-16 h-px w-full bg-border transition-colors"></div>
              )}
            </section>
          ))}
        </div>

        {/* Support CTA */}
        <section className="mt-28 bg-brand-black p-10 md:p-16 rounded-[4px] text-center relative overflow-hidden shadow-2xl transition-colors">
          <div className="relative z-10">
            <h3 className="text-white font-heading font-bold text-[28px] md:text-[36px] mb-6">Need Clarification?</h3>
            <p className="text-white/50 font-body text-[14px] md:text-[16px] mb-10 max-w-xl mx-auto leading-relaxed">
              If any clause is unclear, our support team is available to explain our policies in detail.
            </p>
            <a 
              href="https://wa.me/923706905835?text=Hi Shopkaroo! I have some questions about your terms and conditions."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-[3px] font-bold text-[13px] uppercase tracking-[2px] hover:bg-[#1fba59] transition-all shadow-xl active:scale-95"
            >
              <MessageCircle size={18} /> Contact Support
            </a>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] -ml-32 -mb-32" />
        </section>
      </div>
    </main>
  )
}

const sections = [
  {
    title: "General Use",
    content: [
      "By using Shopkarro, you represent that you are at least 18 years of age or possess legal parental or guardian consent to use this site. We reserve the right to refuse service to anyone at any time.",
      "Users are solely responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account."
    ]
  },
  {
    title: "Products & Pricing",
    content: [
      "All prices listed on Shopkarro are in Pakistani Rupees (PKR) and are inclusive of relevant taxes unless stated otherwise. Prices are subject to change without prior notice.",
      "We make every effort to display product colors and textures as accurately as possible. However, as the actual colors you see will depend on your monitor, we cannot guarantee that your display's depiction of any color will be accurate. Product images are for illustrative purposes only."
    ]
  },
  {
    title: "Orders & Payment",
    content: [
      "Shopkarro currently operates exclusively on a Cash on Delivery (COD) basis. No advance payment is required for standard retail orders.",
      "All orders are subject to confirmation. We will contact you via phone or email to confirm the order details before dispatch. We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspicion of fraudulent activity."
    ]
  },
  {
    title: "Shipping & Delivery",
    content: [
      "Delivery timelines provided at checkout are estimates and may vary based on your city and local logistics conditions within Pakistan. Typically, orders are delivered within 3-7 business days.",
      "While we partner with reputable courier services, Shopkarro is not held liable for delays caused by external courier issues, weather conditions, or political situations."
    ]
  },
  {
    title: "Returns & Refunds",
    content: [
      "We accept returns within 7 days of delivery if the item is found to be defective, damaged, or differs significantly from the description. Please contact our support team immediately to initiate the process.",
      "Once a return is approved and the item is received back in its original condition, refunds are processed within 7–10 business days via bank transfer or easy-paisa as per the customer's preference."
    ]
  },
  {
    title: "Intellectual Property",
    content: [
      "The content on this website, including but not limited to text, graphics, logos, and images, is the property of Shopkarro and is protected by copyright laws. Unauthorized use, reproduction, or distribution of this content is strictly prohibited."
    ]
  },
  {
    title: "Limitation of Liability",
    content: [
      "Shopkarro shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or the inability to use our services or products."
    ]
  },
  {
    title: "Privacy",
    content: [
      "Your privacy is critical to us. We collect, store, and process personal data strictly in accordance with our Privacy Policy. We do not sell or rent user data to third parties for marketing purposes."
    ]
  },
  {
    title: "Changes to Terms",
    content: [
      "Shopkarro reserves the right to update or modify these Terms & Conditions at any time without prior notice. Your continued use of the website following any changes indicates your acceptance of the new terms."
    ]
  },
  {
    title: "Contact Us",
    content: [
      "For any queries regarding these terms, you may reach out to us:",
      "Email: shopkarro.ecom@gmail.com",
      "Phone: 03706905835",
      "Web: shopkarro.com"
    ]
  }
]
