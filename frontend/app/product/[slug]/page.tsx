import { Metadata } from 'next'
import ProductClient from './ProductClient'
import Script from 'next/script'

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

export default async function Page({ params }: Props) {
  const { slug } = await params
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  let initialProduct = null
  let initialReviews = []
  let initialRelated = []

  try {
    const prodRes = await fetch(`${backendUrl}/api/products?slug=${slug}`, { cache: 'no-store' })
    const prodData = await prodRes.json()
    
    if (prodData.data && prodData.data.length > 0) {
      initialProduct = prodData.data[0]
      
      const revRes = await fetch(`${backendUrl}/api/reviews?product_id=${initialProduct.id}&approved=true`, { cache: 'no-store' })
      const revData = await revRes.json()
      initialReviews = revData.data || []

      const relRes = await fetch(`${backendUrl}/api/products?category=${initialProduct.category}&limit=4`, { cache: 'no-store' })
      const relData = await relRes.json()
      initialRelated = (relData.data || []).filter((p: any) => p.id !== initialProduct.id)
    }
  } catch (err) {
    console.error('Error fetching product data for SSR:', err)
  }

  let productSchema = null
  if (initialProduct) {
    productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": initialProduct.name,
      "description": initialProduct.description || initialProduct.meta_description || initialProduct.name,
      "image": initialProduct.images || [],
      "sku": initialProduct.slug,
      "brand": {
        "@type": "Brand",
        "name": "Shopkarro"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://shopkarro.com/product/${initialProduct.slug}`,
        "priceCurrency": "PKR",
        "price": initialProduct.sale_price ?? initialProduct.price_pkr,
        "availability": initialProduct.stock_qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "PKR"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "businessDays": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "https://schema.org/Monday",
                "https://schema.org/Tuesday",
                "https://schema.org/Wednesday",
                "https://schema.org/Thursday",
                "https://schema.org/Friday",
                "https://schema.org/Saturday"
              ]
            }
          }
        }
      }
    }
  }

  return (
    <>
      {productSchema && (
        <Script id={`product-schema-${slug}`} type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      )}
      <ProductClient 
        initialProduct={initialProduct} 
        initialReviews={initialReviews} 
        initialRelated={initialRelated} 
      />
    </>
  )
}
