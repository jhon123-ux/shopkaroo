import { Metadata } from 'next'
import FAQClient from './FAQClient'

export const metadata: Metadata = {
  title: 'FAQs & Support - Shopkarro',
  description: 'Find answers to common questions about Shopkarro furniture delivery, payments, returns, and assembly. We are here to help you create your perfect home.',
}

export default function Page() {
  return <FAQClient />
}
