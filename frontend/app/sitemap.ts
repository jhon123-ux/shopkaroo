import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  const siteUrl = 'https://shopkarro.com'
  
  // Base routes
  const routes = [
    '',
    '/faqs',
    '/cart',
    '/checkout',
    '/furniture',
    '/privacy-policy',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const fetchJson = async (endpoint: string) => {
    try {
      const res = await fetch(`${backendUrl}${endpoint}`, { next: { revalidate: 3600 } })
      if (!res.ok) return []
      const data = await res.json()
      return data.data || []
    } catch (e) {
      console.error(`Sitemap fetch error for ${endpoint}:`, e)
      return []
    }
  }

  // Categories
  const categories = await fetchJson('/api/categories?all=true')
  const categoryRoutes = categories.map((cat: any) => ({
    url: `${siteUrl}/furniture/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Products
  const products = await fetchJson('/api/products?limit=500')
  const productRoutes = products.map((prod: any) => ({
    url: `${siteUrl}/product/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...categoryRoutes, ...productRoutes]
}
