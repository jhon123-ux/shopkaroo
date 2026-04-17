import { Metadata } from 'next'
import ProductClient from './ProductClient'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  try {
    const res = await fetch(`${backendUrl}/api/products?slug=${slug}`, { cache: 'no-store' })
    if (!res.ok) throw new Error()
    const data = await res.json()
    const product = data.data?.[0]

    if (!product) return { title: 'Product Not Found - Shopkarro' }

    // Prefer admin-entered SEO fields, fall back to auto-generated
    const metaTitle = product.meta_title || `${product.name} | Premium Furniture Pakistan - Shopkarro`
    const metaDescription = product.meta_description || 
      product.description?.substring(0, 160) || 
      `Buy ${product.name} at Shopkarro. Handcrafted premium furniture with Cash on Delivery across Pakistan.`

    const ogImage = product.images?.[0] || null

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        images: ogImage ? [
          { 
            url: ogImage, 
            width: 800, 
            height: 800, 
            alt: product.image_alts?.[0] || product.name 
          }
        ] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: ogImage ? [ogImage] : [],
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
