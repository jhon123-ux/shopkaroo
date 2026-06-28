import CategoryClient from './[category]/CategoryClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop All Furniture Collections - Shopkarro',
  description: 'Explore our complete range of premium handcrafted furniture. From living room to bedroom, find the perfect pieces for your home with Cash on Delivery across Pakistan.',
}

export default async function FurniturePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  let initialProducts = []
  let initialTotalCount = 0

  try {
    const res = await fetch(`${backendUrl}/api/products?limit=12&offset=0&sort=newest&is_active=true`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      initialProducts = json.data || []
      initialTotalCount = json.total || 0
    }
  } catch (err) {
    console.error('Error fetching initial products for /furniture:', err)
  }

  return (
    <CategoryClient 
      initialProducts={initialProducts} 
      initialTotalCount={initialTotalCount} 
    />
  )
}
