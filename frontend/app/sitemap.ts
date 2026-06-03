import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  try {
    // Fetch categories
    const catRes = await fetch(`${backendUrl}/api/categories?all=true`, { next: { revalidate: 86400 } })
    const catData = await catRes.json()
    const categories = catData.data || []

    // Fetch all active products
    const prodRes = await fetch(`${backendUrl}/api/products?is_active=true&limit=1000`, { next: { revalidate: 86400 } })
    const prodData = await prodRes.json()
    const products = prodData.data || []

    const baseUrl = 'https://shopkarro.com'

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/furniture`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/faqs`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms-and-conditions`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat: any) => ({
      url: `${baseUrl}/furniture/${cat.slug}`,
      lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const productRoutes: MetadataRoute.Sitemap = products.map((prod: any) => ({
      url: `${baseUrl}/product/${prod.slug}`,
      lastModified: prod.created_at ? new Date(prod.created_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
  } catch (err) {
    console.error('Error generating sitemap:', err)
    // Fallback static sitemap if backend is completely down
    return [
      {
        url: 'https://shopkarro.com/',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      }
    ]
  }
}
