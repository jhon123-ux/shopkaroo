import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import AuthProvider from '@/components/auth/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  title: 'Buy Furniture Online Pakistan | Handcrafted & Premium — Shopkarro',
  description: 'Shopkarro brings you handcrafted, quality-inspected furniture across Pakistan. Order online, pay on delivery. Karachi, Lahore, Islamabad & 30+ cities.',
  keywords: 'furniture pakistan, luxury furniture karachi, shopkarro, sheesham wood beds, sofas lahore, modern dining tables, home decor islamabad, office furniture pakistan',
  alternates: {
    canonical: 'https://shopkarro.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Buy Furniture Online Pakistan | Handcrafted & Premium — Shopkarro',
    description: 'Shopkarro brings you handcrafted, quality-inspected furniture across Pakistan. Order online, pay on delivery.',
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
    title: 'Buy Furniture Online Pakistan | Handcrafted & Premium — Shopkarro',
    description: 'Shopkarro brings you handcrafted, quality-inspected furniture across Pakistan. Order online, pay on delivery.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://xxhnilswsukipjfbgiec.supabase.co" />
        <link rel="preconnect" href="https://shopkaroo-production.up.railway.app" />
        {/* Explicit favicon declarations — helps Google pick up the correct icon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="flex flex-col min-h-screen font-body antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-TTR2LMCV6K" />
      </body>
    </html>
  )
}
