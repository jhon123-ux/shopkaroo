import { Metadata } from 'next'
import CategoryClient from './CategoryClient'

type Props = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const CATEGORY_NAMES: Record<string, string> = {
    'living-room': 'Living Room',
    'bedroom': 'Bedroom', 
    'office': 'Office',
    'dining': 'Dining Room',
    'new': 'New Arrivals',
    'sale': 'Sale Items'
  }

  try {
    const res = await fetch(`${backendUrl}/api/categories?all=true`)
    const data = await res.json()
    const categoryData = data.data?.find((c: any) => c.slug === categorySlug)
    
    const catName = categoryData?.name || CATEGORY_NAMES[categorySlug] || categorySlug.replace('-', ' ')

    return {
      title: `Shop Premium ${catName} Furniture Pakistan - Shopkarro`,
      description: categoryData?.description || `Explore our high-quality ${catName} furniture collection. Handcrafted designs with Cash on Delivery across Pakistan.`,
      openGraph: {
        title: `${catName} Collection - Shopkarro`,
        description: categoryData?.description,
        images: categoryData?.image_url ? [{ url: categoryData.image_url }] : [],
      }
    }
  } catch (e) {
    return { 
      title: 'Shop Furniture Collections - Shopkarro',
      description: 'Explore our premium handcrafted furniture collections for every room in your home.'
    }
  }
}

export default function Page() {
  return <CategoryClient />
}
