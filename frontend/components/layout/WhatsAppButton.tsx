import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const defaultNumber = '923001234567'
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultNumber
  
  // Create a proper message URI encoding
  const msg = encodeURIComponent('Hi Shopkaroo! I need some help choosing furniture.')
  const whatsappUrl = `https://wa.me/${number}?text=${msg}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cod-green text-white shadow-lg shadow-cod-green/40 hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="absolute inset-0 rounded-full border-2 border-cod-green animate-ping opacity-75 duration-[3000ms]"></div>
      <MessageCircle size={26} fill="white" className="relative z-10" />
    </a>
  )
}
