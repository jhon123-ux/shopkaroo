import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import AuthProvider from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Shopkaroo - Premium Furniture in Pakistan',
  description: 'Shopkaroo is your go-to destination for premium furniture in Pakistan. Cash on Delivery available nationwide.',
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
      </body>
    </html>
  )
}
