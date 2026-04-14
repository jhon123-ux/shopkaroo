import CategoryClient from './[category]/CategoryClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop All Furniture Collections - Shopkarro',
  description: 'Explore our complete range of premium handcrafted furniture. From living room to bedroom, find the perfect pieces for your home with Cash on Delivery across Pakistan.',
}

export default function FurniturePage() {
  return <CategoryClient />
}
