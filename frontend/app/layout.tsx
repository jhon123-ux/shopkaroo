import type { Metadata } from 'next'
import { Syne, Epilogue } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

const syne = Syne({ 
  subsets: ['latin'], 
  variable: '--font-syne',
  display: 'swap',
})

const epilogue = Epilogue({ 
  subsets: ['latin'], 
  variable: '--font-epilogue',
  display: 'swap',
})

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
      <body className={`${epilogue.variable} ${syne.variable} flex flex-col min-h-screen font-body antialiased`} suppressHydrationWarning>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
