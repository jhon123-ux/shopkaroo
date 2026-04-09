'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle, 
  Mail, 
  ArrowRight, 
  Phone, 
  Truck, 
  Package, 
  MessageCircle 
} from 'lucide-react'

import { Suspense } from 'react'

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#783A3A] border-t-transparent rounded-full" />
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  )
}

function OrderConfirmedContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params?.orderId as string
  const email = searchParams?.get('email')

  return (
    <main className="bg-[#FAF7F4] min-h-[90vh] flex flex-col items-center justify-center p-6 text-center font-body relative overflow-hidden">
      
      {/* Subtle brand texture or decoration */}
      <div className="absolute w-[800px] h-[800px] bg-[#783A3A]/[0.02] rounded-full blur-3xl -top-40 -left-40 pointer-events-none shrink-0"></div>
      <div className="absolute w-[600px] h-[600px] bg-[#2D6A4F]/[0.02] rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none shrink-0"></div>

      <div className="max-w-3xl w-full bg-white rounded-0 border border-[#E8E2D9] shadow-sm p-10 md:p-20 relative z-10 animate-slideUp">
        
        {/* Success Icon */}
        <div className="mx-auto w-24 h-24 bg-[#EBF7F0] border border-[rgba(45,106,79,0.1)] rounded-0 flex items-center justify-center mb-10 shadow-sm text-[#2D6A4F]">
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>

        <h1 className="font-heading font-bold text-[36px] md:text-[48px] text-[#1C1410] mb-4 leading-tight">
          Thank You
        </h1>
        
        <p className="text-[#6B6058] text-[14px] uppercase tracking-[4px] font-semibold opacity-60 mb-10">
          Your Collection is being prepared
        </p>

        <div className="flex flex-col items-center gap-2 mb-12">
            <span className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40">Reference Code</span>
            <p className="text-[#783A3A] font-bold text-[22px] md:text-[24px] font-mono tracking-[4px] bg-[#FAF7F4] inline-block px-4 md:px-8 py-3 rounded-[2px] border border-[#E8E2D9] break-all w-full text-center">
            {orderId || 'PENDING'}
            </p>
        </div>

        {/* Email Notice */}
        {email && (
          <div className="bg-[#FAF7F4] rounded-0 p-5 mb-16 border border-[#E8E2D9] text-left flex flex-col sm:flex-row gap-4 items-start max-w-lg mx-auto">
            <div className="bg-white w-10 h-10 flex items-center justify-center flex-shrink-0 border border-[#E8E2D9] shadow-sm">
              <Mail size={18} className="opacity-40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1C1410] font-bold text-[12px] uppercase tracking-wider mb-1">Confirmation Despatched</p>
              <p className="text-[#6B6058] text-[13px] mb-4 opacity-80 break-all">{email}</p>
              
              <div className="pt-3 border-t border-[#E8E2D9]">
                <Link 
                  href={`/signup?email=${encodeURIComponent(email)}&ref=checkout`}
                  className="text-[#783A3A] font-bold text-[12px] uppercase tracking-[1px] hover:underline flex items-center gap-2 transition-all"
                >
                  Create Account To Track <ArrowRight size={14} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Timeline of Luxury Delivery */}
        <div className="max-w-lg mx-auto text-left py-10 border-y border-[#FAF7F4]">
          <h3 className="font-heading font-bold text-[#1C1410] text-[18px] uppercase tracking-widest mb-8 text-center">
            The Journey
          </h3>
          
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-0 bg-[#FAF7F4] text-[#1C1410] flex items-center justify-center font-bold text-[14px] flex-shrink-0 border border-[#E8E2D9]">
                <Phone size={18} className="opacity-40" />
              </div>
              <div className="pt-1">
                <p className="font-bold text-[#1C1410] text-[13px] uppercase tracking-wider">Verification Call</p>
                <p className="text-[14px] text-[#6B6058] opacity-60">Our concierge will contact you within 60 minutes.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-0 bg-[#FAF7F4] text-[#1C1410] flex items-center justify-center font-bold text-[14px] flex-shrink-0 border border-[#E8E2D9]">
                <Package size={18} className="opacity-40" />
              </div>
              <div className="pt-1">
                <p className="font-bold text-[#1C1410] text-[13px] uppercase tracking-wider">Curation & Transit</p>
                <p className="text-[14px] text-[#6B6058] opacity-60">Hand-curated packaging takes 24-48 hours.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-0 bg-[#FAF7F4] text-[#1C1410] flex items-center justify-center font-bold text-[14px] flex-shrink-0 border border-[#E8E2D9]">
                <Truck size={20} className="opacity-40" />
              </div>
              <div className="pt-1">
                <p className="font-bold text-[#1C1410] text-[13px] uppercase tracking-wider">Final Delivery</p>
                <p className="text-[14px] text-[#6B6058] opacity-60">Arriving at your doorstep within 3-5 business days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 justify-center">
          <Link 
            href="/"
            className="w-full sm:w-auto px-12 py-5 bg-[#783A3A] text-white rounded-[3px] font-bold font-body uppercase tracking-[2px] text-[14px] hover:bg-[#5B2C2C] transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-center"
          >
            Explore Collection
          </Link>
            <a 
              href={`https://wa.me/923706905835?text=Hi! I just placed order ${orderId} and want to track its status.`}
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-5 border border-[#2D6A4F] text-[#2D6A4F] bg-[#EBF7F0] rounded-[3px] font-bold font-body uppercase tracking-[2px] text-[14px] hover:bg-[#2D6A4F] hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3"
            >
              <MessageCircle size={18} /> Concierge WhatsApp
            </a>
        </div>

      </div>
    </main>
  )
}
