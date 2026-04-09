import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import AuthProvider from '@/components/auth/AuthProvider'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: 'Shopkarro — Premium Furniture Pakistan',
  description: 'Buy premium quality furniture online in Pakistan. Cash on Delivery available across 30+ cities.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Shopkarro — Premium Furniture Pakistan',
    description: 'Premium furniture delivered to your door. COD available.',
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
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopkarro — Premium Furniture Pakistan',
    description: 'Premium furniture delivered to your door. COD available.',
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
