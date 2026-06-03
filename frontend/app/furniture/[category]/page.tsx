import { Metadata } from 'next'
import CategoryClient from './CategoryClient'
import Script from 'next/script'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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

export default async function Page({ params, searchParams }: Props) {
  const { category: categorySlug } = await params
  const resolvedSearchParams = await searchParams
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  const isAllFurniture = !categorySlug || categorySlug === 'all'

  let initialProducts = []
  let totalCount = 0
  let categoryData = null

  try {
    if (!isAllFurniture) {
      const catRes = await fetch(`${backendUrl}/api/categories?all=true`, { cache: 'no-store' })
      const catJson = await catRes.json()
      categoryData = catJson.data?.find((c: any) => c.slug === categorySlug) || null
    }

    const queryParams = new URLSearchParams()
    queryParams.set('limit', '12')
    
    const page = resolvedSearchParams.page ? String(resolvedSearchParams.page) : '1'
    queryParams.set('offset', ((parseInt(page) - 1) * 12).toString())
    
    if (!isAllFurniture) queryParams.set('category', categorySlug)
    
    if (resolvedSearchParams.sort) queryParams.set('sort', String(resolvedSearchParams.sort))
    else queryParams.set('sort', 'newest')
    
    if (resolvedSearchParams.min_price) queryParams.set('min_price', String(resolvedSearchParams.min_price))
    if (resolvedSearchParams.max_price) queryParams.set('max_price', String(resolvedSearchParams.max_price))
    if (resolvedSearchParams.material) queryParams.set('material', String(resolvedSearchParams.material))
    if (resolvedSearchParams.city) queryParams.set('city', String(resolvedSearchParams.city))
    
    const prodRes = await fetch(`${backendUrl}/api/products?${queryParams.toString()}`, { cache: 'no-store' })
    if (prodRes.ok) {
      const prodJson = await prodRes.json()
      initialProducts = prodJson.data || []
      totalCount = prodJson.total || 0
    }
  } catch (err) {
    console.error(err)
  }

  const catName = categoryData?.name || categorySlug.replace('-', ' ')

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://shopkarro.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Furniture",
        "item": "https://shopkarro.com/furniture"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": catName,
        "item": `https://shopkarro.com/furniture/${categorySlug}`
      }
    ]
  }

  return (
    <>
      <Script id={`breadcrumb-${categorySlug}`} type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CategoryClient 
        initialCategoryData={categoryData} 
        initialProducts={initialProducts} 
        initialTotalCount={totalCount} 
      />
    </>
  )
}
