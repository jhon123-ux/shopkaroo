// File: frontend/app/privacy-policy/page.tsx
// Add this file to your Next.js frontend

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Shopkarro',
  description: 'Privacy Policy for Shopkarro — Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#FAF7F4] min-h-screen">
      
      {/* Header */}
      <div className="bg-[#1C1410] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#7B5EA7] font-medium text-sm tracking-widest uppercase mb-4"
             style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '3px' }}>
            Legal
          </p>
          <h1 className="text-white text-5xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm"
             style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Last updated: April 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Intro */}
        <div className="bg-white border border-[#E8E2D9] p-8 mb-8" style={{ borderRadius: '4px' }}>
          <p className="text-[#6B6058] text-base leading-relaxed"
             style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Welcome to <strong className="text-[#1C1410]">Shopkarro</strong> ("we", "our", "us"). 
            We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website <strong className="text-[#4A2C6E]">shopkarro.com</strong> and 
            make purchases from us. Please read this policy carefully.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#4A2C6E] flex items-center justify-center"
                   style={{ borderRadius: '2px' }}>
                <span className="text-white text-sm font-bold"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {index + 1}
                </span>
              </div>
              <h2 className="text-[#1C1410] text-2xl font-bold pt-0.5"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                {section.title}
              </h2>
            </div>
            
            <div className="ml-12">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} 
                   className="text-[#6B6058] text-base leading-relaxed mb-4"
                   style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {paragraph}
                </p>
              ))}
              
              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet, bIndex) => (
                    <li key={bIndex} 
                        className="flex items-start gap-3 text-[#6B6058] text-base"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <span className="w-1.5 h-1.5 bg-[#4A2C6E] rounded-full mt-2 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {index < sections.length - 1 && (
              <hr className="mt-8 border-[#E8E2D9]" />
            )}
          </div>
        ))}

        {/* Contact Box */}
        <div className="bg-[#4A2C6E] p-8 mt-12" style={{ borderRadius: '4px' }}>
          <h2 className="text-white text-2xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Contact Us About Privacy
          </h2>
          <p className="text-white/70 text-base mb-6"
             style={{ fontFamily: 'DM Sans, sans-serif' }}>
            If you have questions or concerns about this Privacy Policy or our data practices, 
            please contact us:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm uppercase tracking-widest"
                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '2px' }}>
                Email
              </span>
              <a href="mailto:shopkarro.ecom@gmail.com"
                 className="text-white font-medium hover:text-white/80 transition-colors"
                 style={{ fontFamily: 'DM Sans, sans-serif' }}>
                shopkarro.ecom@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm uppercase tracking-widest"
                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '2px' }}>
                Phone
              </span>
              <a href="tel:03706905835"
                 className="text-white font-medium hover:text-white/80 transition-colors"
                 style={{ fontFamily: 'DM Sans, sans-serif' }}>
                03706905835
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm uppercase tracking-widest"
                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '2px' }}>
                Website
              </span>
              <span className="text-white font-medium"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}>
                shopkarro.com
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}

const sections = [
  {
    title: "Information We Collect",
    content: [
      "When you visit Shopkarro and place an order, we collect certain information to process your order and provide our services. This information includes:"
    ],
    bullets: [
      "Personal identification information: Full name, phone number, and email address (if provided)",
      "Delivery information: City, full address, and special delivery instructions",
      "Order information: Products ordered, quantities, prices, and order history",
      "Account information: Email address and password (if you create an account)",
      "Usage data: Pages visited, time spent on site, and browsing patterns (via Google Analytics)",
      "Device information: Browser type, IP address, and operating system"
    ]
  },
  {
    title: "How We Use Your Information",
    content: [
      "We use the information we collect for the following purposes:"
    ],
    bullets: [
      "To process and fulfill your orders via Cash on Delivery",
      "To send order confirmation and status update emails",
      "To contact you by phone to confirm your order before dispatch",
      "To provide customer support and respond to your inquiries",
      "To improve our website, products, and services",
      "To send you promotional information (only if you opt in)",
      "To prevent fraud and ensure the security of our platform",
      "To comply with legal obligations"
    ]
  },
  {
    title: "Cash on Delivery & Payment",
    content: [
      "Shopkarro operates exclusively on a Cash on Delivery (COD) basis. We do not collect, store, or process any credit card, debit card, or online banking information. All payments are made in cash at the time of delivery.",
      "Your financial information is never shared with or stored by us. We do not use any payment gateway that would require you to enter your banking details on our platform."
    ]
  },
  {
    title: "Information Sharing & Disclosure",
    content: [
      "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following limited circumstances:"
    ],
    bullets: [
      "Delivery partners (TCS, Leopards, Trax, or similar couriers): We share your name, phone number, and delivery address to fulfill your order",
      "Service providers: Email service (Resend) to send transactional emails on our behalf",
      "Analytics: Google Analytics receives anonymized usage data to help us improve the website",
      "Legal requirements: We may disclose information if required by law, court order, or government authority",
      "Business transfers: If Shopkarro is acquired or merged, your information may be transferred as part of that transaction"
    ]
  },
  {
    title: "Data Storage & Security",
    content: [
      "Your data is stored securely on Supabase, a PostgreSQL database platform with enterprise-grade security. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
      "All data transmission between your browser and our website is encrypted using SSL/TLS technology (HTTPS). However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
    ]
  },
  {
    title: "Cookies & Tracking",
    content: [
      "We use cookies and similar tracking technologies to enhance your experience on our website:",
    ],
    bullets: [
      "Essential cookies: Required for the website to function, including your shopping cart and login session",
      "Analytics cookies: Google Analytics uses cookies to collect anonymized data about how visitors use our site",
      "Preference cookies: Remember your settings and preferences for future visits",
      "You can control cookies through your browser settings. Disabling cookies may affect some functionality of our website"
    ]
  },
  {
    title: "Your Rights",
    content: [
      "You have the following rights regarding your personal information:"
    ],
    bullets: [
      "Access: Request a copy of the personal information we hold about you",
      "Correction: Request correction of any inaccurate or incomplete information",
      "Deletion: Request deletion of your personal information, subject to legal obligations",
      "Opt-out: Unsubscribe from marketing emails at any time using the link in our emails",
      "Account deletion: Delete your Shopkarro account through your profile settings",
      "To exercise any of these rights, contact us at shopkarro.ecom@gmail.com"
    ]
  },
  {
    title: "Children's Privacy",
    content: [
      "Shopkarro is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we will delete such information from our systems."
    ]
  },
  {
    title: "Third-Party Links",
    content: [
      "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to review the privacy policies of any third-party sites you visit. This Privacy Policy applies only to information collected by Shopkarro."
    ]
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new policy on this page with an updated 'Last Updated' date.",
      "Your continued use of Shopkarro after any changes to this Privacy Policy constitutes your acceptance of the updated policy. We encourage you to review this policy periodically."
    ]
  }
]
