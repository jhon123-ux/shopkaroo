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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#6C3FC5] border-t-transparent rounded-full" />
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
  
  // CMS Category Metadata
  const [categoryData, setCategoryData] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Fetch Category Details
  useEffect(() => {
    const fetchCategoryMetadata = async () => {
      if (!categorySlug) return
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
    
    router.push(`/furniture/${categorySlug}?${params.toString()}`, { scroll: false })
  }, [sort, currentPage, minPrice, maxPrice, selectedMaterials, selectedCities, categorySlug, router])

  // Fetch Data
  useEffect(() => {
    const fetchProducts = async () => {
      if (!categorySlug) return
      
      setLoading(true)
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        const queryParams = new URLSearchParams({
          category: categorySlug,
          limit: '12',
          offset: ((currentPage - 1) * 12).toString()
        })
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
    <main className="bg-[#FAF7F4] min-h-screen font-body">
      {/* LUXURY HERO HEADER */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden">
        {categoryData?.image_url ? (
          <img 
            src={categoryData.image_url} 
            alt={catName} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1410] to-[#4A2C6E]" />
        )}
        <div className="absolute inset-0 bg-[#1C1410]/40 backdrop-blur-[2px]" />
        
        <div className="relative text-center px-6">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-[4px] mb-4">Collection Gallery</p>
          <h1 className="text-white font-heading italic text-[48px] md:text-[64px] leading-none mb-6 capitalize">
            {catName}
          </h1>
          <div className="flex items-center justify-center gap-3 text-white/40 text-[12px] font-bold uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="opacity-20">/</span>
            <span className="text-white">Shop {catName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16">
        
        {/* SIDEBAR FILTERS — Minimalist Archive Style */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-12">
            <div>
              <h2 className="text-[#1C1410] font-heading font-bold text-[22px] mb-8">Architect Filters</h2>
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
              <div className="pt-12 border-t border-[#E8E2D9]">
                <p className="text-[#6B6058] text-[12px] font-bold uppercase tracking-[2px] mb-4 opacity-40">Room Narrative</p>
                <p className="text-[#6B6058] text-[14px] leading-relaxed italic opacity-80">
                  {categoryData.description}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* PRODUCTS REGISTRY */}
        <div className="flex-1">
          {/* Sorting & Filter Trigger (Mobile) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 pb-6 border-b border-[#E8E2D9] gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40">Classification:</span>
              <div className="flex flex-wrap gap-2">
                {activeFiltersTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => removeFilterTag(tag)}
                    className="bg-white border border-[#E8E2D9] text-[#1C1410] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 hover:border-[#4A2C6E] transition-colors"
                  >
                    {tag} <X size={10} className="opacity-40" />
                  </button>
                ))}
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-[#A89890] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:text-[#DC2626]">Clear</button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex-1 sm:flex-none border border-[#E8E2D9] px-6 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Filter size={14} /> Filter
              </button>
              
              <div className="relative group flex-1 sm:flex-none">
                <select 
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full bg-transparent border-b border-black text-[11px] font-bold uppercase tracking-widest py-2 pr-8 focus:outline-none cursor-pointer appearance-none"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-[#F2EDE6] animate-pulse rounded-0 border border-[#E8E2D9]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-[#E8E2D9] bg-white shadow-sm">
              <div className="text-[#1C1410] opacity-10 mb-8 flex justify-center">
                <Filter size={80} strokeWidth={0.5} />
              </div>
              <h3 className="font-heading italic text-[32px] text-[#1C1410] mb-4">No exhibits found</h3>
              <p className="text-[#6B6058] max-w-md mx-auto text-[14px]">Our current archive does not contain pieces matching these specifications.</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="mt-8 bg-[#1C1410] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest rounded-0 shadow-lg">Refresh Registry</button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* PAGINATION — Minimalist Numerics */}
              {totalPages > 1 && (
                <div className="mt-24 pt-12 border-t border-[#E8E2D9] flex justify-center items-center gap-6">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 border border-[#E8E2D9] hover:bg-[#FAF7F4] transition-colors disabled:opacity-20"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex gap-4">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`text-[12px] font-bold font-mono tracking-widest transition-all ${
                          currentPage === (i + 1) ? 'text-[#4A2C6E] border-b-2 border-[#4A2C6E] pb-1' : 'text-[#A89890] hover:text-[#1C1410]'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 border border-[#E8E2D9] hover:bg-[#FAF7F4] transition-colors disabled:opacity-20"
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
          <div className="bg-white min-h-screen p-10 animate-slideUp relative shadow-2xl">
            <button onClick={() => setIsMobileFilterOpen(false)} className="absolute top-8 right-8 text-[#1C1410] opacity-40 hover:opacity-100"><X size={28} /></button>
            <h2 className="text-[#1C1410] font-heading font-bold text-[32px] mb-12">Filter Collection</h2>
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
        <h4 className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-6">Price Spectrum</h4>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-[10px] font-bold opacity-30">PKR</span>
            <input 
              type="number" 
              placeholder="Min" 
              value={localMinPrice}
              onChange={e => setLocalMinPrice(e.target.value)}
              className="w-full bg-[#F2EDE6] border-b border-[#E8E2D9] pl-10 pr-4 py-3 text-[13px] outline-none focus:border-[#4A2C6E] transition-colors" 
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-[10px] font-bold opacity-30">PKR</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={localMaxPrice}
              onChange={e => setLocalMaxPrice(e.target.value)}
              className="w-full bg-[#F2EDE6] border-b border-[#E8E2D9] pl-10 pr-4 py-3 text-[13px] outline-none focus:border-[#4A2C6E] transition-colors" 
            />
          </div>
        </div>
        <button 
          onClick={applyPriceRange}
          className="w-full bg-[#1C1410] text-white py-3.5 text-[11px] font-bold uppercase tracking-widest mt-6 hover:bg-[#4A2C6E] transition-all shadow-lg active:scale-95"
        >
          Execute Range
        </button>
      </div>

      <div>
        <h4 className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-6">Materials Archive</h4>
        <div className="space-y-3">
          {ALL_MATERIALS.map(mat => (
            <label key={mat} className="flex items-center gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedMaterials.includes(mat)}
                onChange={() => handleMaterialToggle(mat)}
                className="w-4 h-4 rounded-0 border-[#E8E2D9] text-[#4A2C6E] focus:ring-0 accent-[#4A2C6E]" 
              />
              <span className="text-[13px] text-[#1C1410] font-medium group-hover:text-[#4A2C6E] transition-colors">{mat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-6">Dispatch Cities</h4>
        <div className="space-y-3">
          {ALL_CITIES.map(city => (
            <label key={city} className="flex items-center gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedCities.includes(city)}
                onChange={() => handleCityToggle(city)}
                className="w-4 h-4 rounded-0 border-[#E8E2D9] text-[#4A2C6E] focus:ring-0 accent-[#4A2C6E]" 
              />
              <span className="text-[13px] text-[#1C1410] font-medium group-hover:text-[#4A2C6E] transition-colors">{city}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearAllFilters}
          className="w-full border border-[#DC2626] text-[#DC2626] py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
        >
          Reset All Attributes
        </button>
      )}
    </div>
  )
}
