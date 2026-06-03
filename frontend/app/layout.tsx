import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import AuthProvider from '@/components/auth/AuthProvider'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  metadataBase: new URL('https://shopkarro.com'),
  title: 'Buy Furniture Online Pakistan | Handcrafted & Premium — Shopkarro',
  description: 'Shopkarro brings you handcrafted, quality-inspected furniture across Pakistan. Order online, pay on delivery. Karachi, Lahore, Islamabad & 30+ cities.',
  keywords: 'furniture pakistan, luxury furniture karachi, shopkarro, sheesham wood beds, sofas lahore, modern dining tables, home decor islamabad, office furniture pakistan',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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

import Script from 'next/script'

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Shopkarro",
  "url": "https://shopkarro.com",
  "logo": "https://shopkarro.com/logo-symbol.svg",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-370-6905835",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://www.facebook.com/shopkarro",
    "https://www.instagram.com/shopkarro"
  ]
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Shopkarro",
  "url": "https://shopkarro.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://shopkarro.com/furniture?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://xxhnilswsukipjfbgiec.supabase.co" />
        <link rel="preconnect" href="https://shopkaroo-production.up.railway.app" />
      </head>
      <body className="flex flex-col min-h-screen font-body antialiased">
        <Script id="org-schema" type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <Script id="website-schema" type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
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
