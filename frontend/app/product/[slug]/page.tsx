import { Metadata } from 'next'
import ProductClient from './ProductClient'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  try {
    const res = await fetch(`${backendUrl}/api/products/${slug}`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    const product = data.data

    if (!product) return { title: 'Product Not Found - Shopkarro' }

    return {
      title: `${product.name} | Premium Furniture Pakistan - Shopkarro`,
      description: product.description?.substring(0, 160) || `Buy ${product.name} at Shopkarro. Handcrafted premium furniture with Cash on Delivery across Pakistan.`,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.image_url ? [{ url: product.image_url }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: product.image_url ? [product.image_url] : [],
      }
    }
  } catch (e) {
    return { 
      title: 'Shopkarro Furniture - Premium Collection',
      description: 'Discover our premium furniture collection with nationwide delivery in Pakistan.'
    }
  }
}

export default function Page() {
  return <ProductClient />
}
