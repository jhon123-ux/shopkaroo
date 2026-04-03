'use client'

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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8 relative z-10"
      >
        <path d="M11.99 2C6.47 2 2 6.48 2 12c0 1.95.56 3.77 1.54 5.34L2 22l4.81-1.46A9.914 9.914 0 0011.99 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.23c-1.63 0-3.19-.44-4.54-1.23l-.33-.19-2.73.83.84-2.61-.21-.34A8.257 8.257 0 013.8 12c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2s-3.68 8.23-8.21 8.23zm4.53-6.19c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-1.55-.78-2.65-1.57-3.65-2.78-.15-.18-.01-.28.11-.4.11-.11.25-.29.37-.44.12-.15.16-.25.24-.42.08-.17.04-.32-.02-.45-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.68.32-.23.26-.89.87-.89 2.12 0 1.25.91 2.45 1.04 2.63.13.17 1.8 2.76 4.36 3.86 1.13.48 1.63.63 2.15.58.62-.06 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
      </svg>
    </a>
  )
}
