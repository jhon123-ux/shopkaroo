'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'
import { 
  Armchair, 
  Bed, 
  Lamp, 
  Utensils, 
  Sparkles, 
  Tag, 
  Home, 
  Filter, 
  ChevronDown, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const CATEGORY_NAMES: Record<string, string> = {
  'living-room': 'Living Room',
  'bedroom': 'Bedroom', 
  'office': 'Office',
  'dining': 'Dining Room',
  'new': 'New Arrivals',
  'sale': 'Sale Items'
}

const CATEGORY_ICONS: Record<string, any> = {
  'living-room': <Armchair size={40} strokeWidth={1.5} />,
  'bedroom': <Bed size={40} strokeWidth={1.5} />,
  'office': <Lamp size={40} strokeWidth={1.5} />,
  'dining': <Utensils size={40} strokeWidth={1.5} />,
  'new': <Sparkles size={40} strokeWidth={1.5} />,
  'sale': <Tag size={40} strokeWidth={1.5} />
}

const ALL_MATERIALS = ['Sheesham Wood', 'Engineered Wood', 'Fabric', 'Metal', 'Glass', 'Leather']
const ALL_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan']

import { Suspense } from 'react'

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-white flex items-center justify-center transition-colors">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <CategoryContent />
    </Suspense>
  )
}

function CategoryContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const categorySlug = params?.category ? (params.category as string) : ''
  const isAllFurniture = !categorySlug || categorySlug === 'all'
  
  // CMS Category Metadata
  const [categoryData, setCategoryData] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Fetch Category Details
  useEffect(() => {
    const fetchCategoryMetadata = async () => {
      if (isAllFurniture) return
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        const res = await fetch(`${backendUrl}/api/categories?all=true`)
        const data = await res.json()
        const meta = data.data?.find((c: any) => c.slug === categorySlug)
        if (meta) setCategoryData(meta)
      } catch (err) {
        console.error('Metadata fetch error:', err)
      }
    }
    fetchCategoryMetadata()
  }, [categorySlug])

  // Filter State mapped from URL
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [minPrice, setMinPrice] = useState<number | null>(searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : null)
  const [maxPrice, setMaxPrice] = useState<number | null>(searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : null)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(searchParams.get('material') ? searchParams.get('material')!.split(',') : [])
  const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.get('city') ? searchParams.get('city')!.split(',') : [])

  // Local inputs for pure price typing before applying
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '')
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '')

  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (sort !== 'newest') params.set('sort', sort)
    if (currentPage > 1) params.set('page', currentPage.toString())
    if (minPrice) params.set('min_price', minPrice.toString())
    if (maxPrice) params.set('max_price', maxPrice.toString())
    if (selectedMaterials.length > 0) params.set('material', selectedMaterials.join(','))
    if (selectedCities.length > 0) params.set('city', selectedCities.join(','))
    
    const baseUrl = isAllFurniture ? '/furniture' : `/furniture/${categorySlug}`
    router.push(`${baseUrl}?${params.toString()}`, { scroll: false })
  }, [sort, currentPage, minPrice, maxPrice, selectedMaterials, selectedCities, categorySlug, isAllFurniture, router])

  // Fetch Data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        const queryParams = new URLSearchParams({
          limit: '12',
          offset: ((currentPage - 1) * 12).toString()
        })
        if (!isAllFurniture) queryParams.set('category', categorySlug)
        if (sort) queryParams.set('sort', sort)
        if (minPrice) queryParams.set('min_price', minPrice.toString())
        if (maxPrice) queryParams.set('max_price', maxPrice.toString())
        if (selectedMaterials.length > 0) queryParams.set('material', selectedMaterials.join(','))
        
        const res = await fetch(`${backendUrl}/api/products?${queryParams.toString()}`)
        if (!res.ok) throw new Error()
        
        const json = await res.json()
        setProducts(json.data || [])
        setTotalCount(json.total || 0)
      } catch (e) {
        console.error('Fetch error:', e)
        setProducts([])
        setTotalCount(0)
      } finally {
        setLoading(false)
        updateURL()
      }
    }
    fetchProducts()
  }, [categorySlug, sort, currentPage, minPrice, maxPrice, selectedMaterials, selectedCities, updateURL])

  // Handlers
  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    )
    setCurrentPage(1)
  }

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
    setCurrentPage(1)
  }

  const applyPriceRange = () => {
    setMinPrice(localMinPrice ? parseInt(localMinPrice) : null)
    setMaxPrice(localMaxPrice ? parseInt(localMaxPrice) : null)
    setCurrentPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setMinPrice(null)
    setMaxPrice(null)
    setLocalMinPrice('')
    setLocalMaxPrice('')
    setSelectedMaterials([])
    setSelectedCities([])
    setCurrentPage(1)
  }

  const hasActiveFilters = minPrice !== null || maxPrice !== null || selectedMaterials.length > 0 || selectedCities.length > 0
  const activeFiltersTags = [
    ...(minPrice ? [`Min: Rs.${minPrice}`] : []),
    ...(maxPrice ? [`Max: Rs.${maxPrice}`] : []),
    ...selectedMaterials,
    ...selectedCities
  ]

  const removeFilterTag = (tag: string) => {
    if (tag.startsWith('Min:')) { setMinPrice(null); setLocalMinPrice('') }
    else if (tag.startsWith('Max:')) { setMaxPrice(null); setLocalMaxPrice('') }
    else if (ALL_MATERIALS.includes(tag)) handleMaterialToggle(tag)
    else if (ALL_CITIES.includes(tag)) handleCityToggle(tag)
  }

  const catName = categoryData?.name || categorySlug.replace('-', ' ')
  const totalPages = Math.ceil(totalCount / 12) || 1
  
  return (
    <main className="bg-background min-h-screen font-body transition-colors duration-300">
      {/* LUXURY HERO HEADER */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden">
        {categoryData?.image_url ? (
          <img 
            src={categoryData.image_url} 
            alt={catName} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-black to-primary" />
        )}
        <div className="absolute inset-0 bg-text/40 backdrop-blur-[2px]" />
        
        <div className="relative text-center px-6">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-[4px] mb-4">Collection Gallery</p>
          <h1 className="text-white font-heading italic text-[48px] md:text-[64px] leading-none mb-6 capitalize">
            {isAllFurniture ? 'All Furniture' : catName}
          </h1>
          <div className="flex items-center justify-center gap-3 text-white/40 text-[12px] font-bold uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="opacity-20">/</span>
            <span className="text-white">{isAllFurniture ? 'All Furniture' : `Shop ${catName}`}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16">
        
        {/* SIDEBAR FILTERS — Minimalist Archive Style */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-12">
            <div>
              <h2 className="text-text font-heading font-bold text-[22px] mb-8">Architect Filters</h2>
              <FilterContent 
                localMinPrice={localMinPrice} setLocalMinPrice={setLocalMinPrice}
                localMaxPrice={localMaxPrice} setLocalMaxPrice={setLocalMaxPrice}
                applyPriceRange={applyPriceRange}
                selectedMaterials={selectedMaterials} handleMaterialToggle={handleMaterialToggle}
                selectedCities={selectedCities} handleCityToggle={handleCityToggle}
                hasActiveFilters={hasActiveFilters} clearAllFilters={clearAllFilters}
              />
            </div>

            {categoryData?.description && (
              <div className="pt-12 border-t border-border">
                <p className="text-text-muted text-[12px] font-bold uppercase tracking-[2px] mb-4 opacity-40">Room Narrative</p>
                <p className="text-text-muted text-[14px] leading-relaxed italic opacity-80">
                  {categoryData.description}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* PRODUCTS REGISTRY */}
        <div className="flex-1">
          {/* Sorting & Filter Trigger (Mobile) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 pb-6 border-b border-border gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-text-muted text-[11px] font-bold uppercase tracking-[2px] opacity-40">Classification:</span>
              <div className="flex flex-wrap gap-2">
                {activeFiltersTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => removeFilterTag(tag)}
                    className="bg-bg-white border border-border text-text text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 hover:border-primary transition-colors"
                  >
                    {tag} <X size={10} className="opacity-40" />
                  </button>
                ))}
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:text-red-500">Clear</button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex-1 sm:flex-none border border-border px-6 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 bg-bg-white text-text"
              >
                <Filter size={14} /> Filter
              </button>
              
              <div className="relative group flex-1 sm:flex-none">
                <select 
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full bg-transparent border-b border-text text-[11px] font-bold uppercase tracking-widest py-2 pr-8 focus:outline-none cursor-pointer appearance-none text-text"
                >
                  <option value="newest">Latest Exhibits</option>
                  <option value="price_asc">Price Ascending</option>
                  <option value="price_desc">Price Descending</option>
                  <option value="popular">Curated Popularity</option>
                </select>
                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-surface animate-pulse rounded-0 border border-border" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-border bg-bg-white shadow-sm">
              <div className="text-text opacity-10 mb-8 flex justify-center">
                <Filter size={80} strokeWidth={0.5} />
              </div>
              <h3 className="font-heading italic text-[32px] text-text mb-4">No exhibits found</h3>
              <p className="text-text-muted max-w-md mx-auto text-[14px]">Our current archive does not contain pieces matching these specifications.</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="mt-8 bg-primary text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest rounded-0 shadow-lg hover:bg-primary-dark transition-colors">Refresh Registry</button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* PAGINATION — Minimalist Numerics */}
              {totalPages > 1 && (
                <div className="mt-24 pt-12 border-t border-border flex justify-center items-center gap-6">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 border border-border hover:bg-surface transition-colors disabled:opacity-20 text-text"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex gap-4">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`text-[12px] font-bold font-mono tracking-widest transition-all ${
                          currentPage === (i + 1) ? 'text-primary border-b-2 border-primary pb-1' : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 border border-border hover:bg-surface transition-colors disabled:opacity-20 text-text"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Fix */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md lg:hidden p-6 overflow-y-auto">
          <div className="bg-bg-white min-h-screen p-10 animate-slideUp relative shadow-2xl">
            <button onClick={() => setIsMobileFilterOpen(false)} className="absolute top-8 right-8 text-text opacity-40 hover:opacity-100"><X size={28} /></button>
            <h2 className="text-text font-heading font-bold text-[32px] mb-12">Filter Collection</h2>
            <FilterContent 
                localMinPrice={localMinPrice} setLocalMinPrice={setLocalMinPrice}
                localMaxPrice={localMaxPrice} setLocalMaxPrice={setLocalMaxPrice}
                applyPriceRange={() => { applyPriceRange(); setIsMobileFilterOpen(false); }}
                selectedMaterials={selectedMaterials} handleMaterialToggle={handleMaterialToggle}
                selectedCities={selectedCities} handleCityToggle={handleCityToggle}
                hasActiveFilters={hasActiveFilters} clearAllFilters={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
              />
          </div>
        </div>
      )}
    </main>
  )
}

function FilterContent({
  localMinPrice, setLocalMinPrice,
  localMaxPrice, setLocalMaxPrice, applyPriceRange,
  selectedMaterials, handleMaterialToggle,
  selectedCities, handleCityToggle,
  hasActiveFilters, clearAllFilters
}: any) {
  return (
    <div className="space-y-12">
      <div>
        <h4 className="text-text-muted text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-6 font-body">Price Spectrum</h4>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-[10px] font-bold opacity-30">PKR</span>
            <input 
              type="number" 
              placeholder="Min" 
              value={localMinPrice}
              onChange={e => setLocalMinPrice(e.target.value)}
              className="w-full bg-surface border-b border-border pl-10 pr-4 py-3 text-[13px] outline-none focus:border-primary transition-colors text-text" 
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-[10px] font-bold opacity-30 text-text">PKR</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={localMaxPrice}
              onChange={e => setLocalMaxPrice(e.target.value)}
              className="w-full bg-surface border-b border-border pl-10 pr-4 py-3 text-[13px] outline-none focus:border-primary transition-colors text-text" 
            />
          </div>
        </div>
        <button 
          onClick={applyPriceRange}
          className="w-full bg-primary text-white py-3.5 text-[11px] font-bold uppercase tracking-widest mt-6 hover:bg-primary-dark transition-all shadow-lg active:scale-95"
        >
          Execute Range
        </button>
      </div>

      <div>
        <h4 className="text-text-muted text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-6 font-body">Materials Archive</h4>
        <div className="space-y-3">
          {ALL_MATERIALS.map(mat => (
            <label key={mat} className="flex items-center gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedMaterials.includes(mat)}
                onChange={() => handleMaterialToggle(mat)}
                className="w-4 h-4 rounded-0 border-border text-primary focus:ring-0 accent-primary" 
              />
              <span className="text-[13px] text-text font-medium group-hover:text-primary transition-colors">{mat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-text-muted text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-6 font-body">Dispatch Cities</h4>
        <div className="space-y-3">
          {ALL_CITIES.map(city => (
            <label key={city} className="flex items-center gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedCities.includes(city)}
                onChange={() => handleCityToggle(city)}
                className="w-4 h-4 rounded-0 border-border text-primary focus:ring-0 accent-primary" 
              />
              <span className="text-[13px] text-text font-medium group-hover:text-primary transition-colors">{city}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearAllFilters}
          className="w-full border border-red-500 text-red-500 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          Reset All Attributes
        </button>
      )}
    </div>
  )
}
