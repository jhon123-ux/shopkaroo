import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import AuthProvider from '@/components/auth/AuthProvider'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: 'Shopkarro — Premium Furniture Pakistan | Handcrafted Luxury',
  description: 'Shop premium quality furniture online in Pakistan. From handcrafted sheerham wood beds to luxury velvet sofas and ergonomic office chairs. Cash on Delivery available across 30+ cities for your convenience.',
  keywords: 'furniture pakistan, luxury furniture karachi, shopkarro, sheesham wood beds, sofas lahore, modern dining tables, home decor islamabad, office furniture pakistan',
  alternates: {
    canonical: 'https://shopkarro.com',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Shopkarro — Premium Furniture Pakistan',
    description: 'Bespoke luxury furniture delivered to your door. Full Cash on Delivery available nationwide.',
    url: 'https://shopkarro.com',
    siteName: 'Shopkarro',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Shopkarro — Premium Furniture Pakistan',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopkarro — Premium Furniture Pakistan',
    description: 'Transform your home with our premium furniture collection. Handcrafted comfort delivered across Pakistan.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
        <GoogleAnalytics gaId="G-TTR2LMCV6K" />
      </body>
    </html>
  )
}
