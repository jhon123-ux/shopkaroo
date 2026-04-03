'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderConfirmedPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params?.orderId as string
  const email = searchParams?.get('email')

  return (
    <main className="bg-[#F7F5FF] min-h-[85vh] flex flex-col items-center justify-center p-6 text-center font-body relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute w-[500px] h-[500px] bg-[#6C3FC5]/5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-[#4CAF7D]/5 rounded-full blur-3xl bottom-0 right-0 pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#E5E0F5] shadow-xl p-8 md:p-12 relative z-10 animate-slideUp">
        
        {/* Animated Checkmark */}
        <div className="mx-auto w-24 h-24 bg-[#F0FDF4] border-4 border-[#BBF7D0] rounded-full flex items-center justify-center mb-6 shadow-sm">
          <span className="text-5xl drop-shadow-sm">✅</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#1A1A2E] mb-3">
          Order Placed Successfully!
        </h1>
        
        <p className="text-[#6B7280] font-medium text-lg mb-2">Order Number:</p>
        <p className="text-[#6C3FC5] font-black text-2xl font-mono tracking-wider bg-[#F7F5FF] inline-block px-4 py-2 rounded-xl border border-[#E5E0F5]">
          {orderId || 'PENDING'}
        </p>

        {/* Email Notice */}
        {email && (
          <div className="bg-[#F0FDF4] rounded-2xl p-5 mt-8 border border-[#BBF7D0] shadow-sm text-left flex gap-3 items-start max-w-md mx-auto">
            <span className="text-2xl pt-0.5">📧</span>
            <div>
              <p className="text-[#166534] font-bold text-sm leading-tight">Confirmation email sent to</p>
              <p className="text-[#166534] font-bold text-sm mb-1">{email}</p>
              <p className="text-[#166534]/80 font-medium text-xs">
                Check your inbox for order details and tracking information.
              </p>
              
              <div className="mt-4 pt-4 border-t border-[#166534]/10">
                <p className="text-[#1A1A2E] font-medium text-[11px] uppercase tracking-wider mb-1">💡 Pro Tip</p>
                <Link 
                  href={`/signup?email=${encodeURIComponent(email)}&ref=checkout`}
                  className="text-[#6C3FC5] font-bold text-sm hover:underline flex items-center gap-1"
                >
                  Create a free account to track orders 
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="mt-10 max-w-md mx-auto text-left">
          <h3 className="font-heading font-bold text-[#1A1A2E] text-lg border-b border-[#E5E0F5] pb-3 mb-5">
            What happens next?
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-[#EDE6FA] text-[#6C3FC5] flex items-center justify-center font-bold text-xl flex-shrink-0">📞</div>
              <div>
                <p className="font-bold text-[#1A1A2E] text-sm">We'll call to confirm</p>
                <p className="text-xs text-[#6B7280] font-medium">Within the next hour</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-[#EDE6FA] text-[#6C3FC5] flex items-center justify-center font-bold text-xl flex-shrink-0">📦</div>
              <div>
                <p className="font-bold text-[#1A1A2E] text-sm">Order is prepared</p>
                <p className="text-xs text-[#6B7280] font-medium">Takes 1-2 business days</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-[#EDE6FA] text-[#6C3FC5] flex items-center justify-center font-bold text-xl flex-shrink-0">🚚</div>
              <div>
                <p className="font-bold text-[#1A1A2E] text-sm">Delivered to your door</p>
                <p className="text-xs text-[#6B7280] font-medium">Within 2-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#6C3FC5] text-white rounded-xl font-bold font-heading hover:bg-[#5530A8] transition-all shadow-md active:scale-95"
          >
            Continue Shopping
          </Link>
          <a 
            href={`https://wa.me/923001234567?text=Hi! I just placed order ${orderId} and want to track its status.`}
            target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 border-2 border-[#4CAF7D] text-[#166534] bg-[#F0FDF4] rounded-xl font-bold font-heading hover:bg-[#4CAF7D] hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            💬 Track via WhatsApp
          </a>
        </div>

      </div>
    </main>
  )
}
