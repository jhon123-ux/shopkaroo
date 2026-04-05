'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'

const CATEGORY_NAMES: Record<string, string> = {
  'living-room': 'Living Room',
  'bedroom': 'Bedroom', 
  'office': 'Office',
  'dining': 'Dining Room',
  'new': 'New Arrivals',
  'sale': 'Sale Items'
}

const CATEGORY_ICONS: Record<string, string> = {
  'living-room': '🛋️',
  'bedroom': '🛏️',
  'office': '🪑',
  'dining': '🍽️',
  'new': '✨',
  'sale': '🏷️'
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
  const categoryName = CATEGORY_NAMES[categorySlug] ?? (categorySlug ? categorySlug.replace('-', ' ') : 'All Products')
  const categoryIcon = CATEGORY_ICONS[categorySlug] || '🏠'

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

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

  const totalPages = Math.ceil(totalCount / 12) || 1

  return (
    <main className="bg-white min-h-screen">
      {/* PART 1 — BREADCRUMB */}
      <div className="bg-white border-b border-[#E5E0F5] py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-[#6C3FC5] transition-colors">Home</Link>
          <span className="text-[#6B7280]">/</span>
          <span className="text-[#6C3FC5] font-medium capitalize">{categoryName}</span>
        </div>
      </div>

      {/* PART 2 — PAGE HEADER */}
      <div className="bg-[#F7F5FF] py-12 border-b border-[#E5E0F5]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="text-4xl mb-3 drop-shadow-sm">{categoryIcon}</div>
            <h1 className="text-4xl font-extrabold font-heading text-[#1A1A2E] capitalize">
              {categoryName}
            </h1>
            <p className="text-[#6B7280] text-base mt-2 font-body">
              Showing {totalCount} products
            </p>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-xs font-mono tracking-widest text-[#6B7280] uppercase">Sort by</label>
            <div className="relative">
              <select 
                value={sort}
                onChange={handleSortChange}
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-2.5 text-sm text-[#1A1A2E] bg-white appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PART 3 — MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Button */}
        <button 
          className="md:hidden w-full bg-[#EDE6FA] text-[#6C3FC5] font-semibold py-3 rounded-xl border border-[#d9cbf6] mb-2 flex justify-center gap-2"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters {hasActiveFilters ? `(${activeFiltersTags.length})` : ''}
        </button>

        {/* LEFT — FILTER SIDEBAR (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-max bg-white rounded-2xl border border-[#E5E0F5] p-6 shadow-sm">
          <FilterContent 
            localMinPrice={localMinPrice} setLocalMinPrice={setLocalMinPrice}
            localMaxPrice={localMaxPrice} setLocalMaxPrice={setLocalMaxPrice}
            applyPriceRange={applyPriceRange}
            selectedMaterials={selectedMaterials} handleMaterialToggle={handleMaterialToggle}
            selectedCities={selectedCities} handleCityToggle={handleCityToggle}
            hasActiveFilters={hasActiveFilters} clearAllFilters={clearAllFilters}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm md:hidden">
            <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto px-6 py-8 relative animate-slideUp">
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full"
              >
                ✕
              </button>
              <h2 className="text-xl font-heading font-extrabold mb-6">Filters</h2>
              <FilterContent 
                localMinPrice={localMinPrice} setLocalMinPrice={setLocalMinPrice}
                localMaxPrice={localMaxPrice} setLocalMaxPrice={setLocalMaxPrice}
                applyPriceRange={() => { applyPriceRange(); setIsMobileFilterOpen(false); }}
                selectedMaterials={selectedMaterials} handleMaterialToggle={handleMaterialToggle}
                selectedCities={selectedCities} handleCityToggle={handleCityToggle}
                hasActiveFilters={hasActiveFilters} clearAllFilters={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
              />
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#1A1A2E] text-white py-3.5 rounded-xl font-semibold mt-6"
              >
                View Results
              </button>
            </div>
          </div>
        )}

        {/* RIGHT — PRODUCTS AREA */}
        <div className="flex-1 min-h-[500px]">
          
          {/* Top bar Tags */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {activeFiltersTags.map(tag => (
                <span key={tag} className="bg-[#EDE6FA] text-[#6C3FC5] font-semibold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-[#d2c2f4]">
                  {tag}
                  <button onClick={() => removeFilterTag(tag)} className="hover:text-red-500 ml-1 bg-white/50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Grid / Loading / Empty */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-[420px] w-full border border-gray-200">
                  <div className="h-64 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <div className="text-6xl mb-4">{categoryIcon}</div>
              <h3 className="font-heading font-bold text-2xl text-[#1A1A2E]">No products found</h3>
              <p className="text-[#6B7280] mt-2 font-body max-w-sm">We couldn't find any furniture matching your exact filter choices.</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="mt-6 border-2 border-[#6C3FC5] text-[#6C3FC5] hover:bg-[#6C3FC5] hover:text-white transition-colors px-6 py-2.5 rounded-xl font-semibold">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* PART 4 — PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border border-[#E5E0F5] px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] hover:border-[#6C3FC5] hover:text-[#6C3FC5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mr-2"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-[#6C3FC5] text-white shadow-md' 
                            : 'border border-[#E5E0F5] text-[#6B7280] hover:border-[#6C3FC5] hover:text-[#6C3FC5]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border border-[#E5E0F5] px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] hover:border-[#6C3FC5] hover:text-[#6C3FC5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-2"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
    <>
      <div className="mb-8">
        <h4 className="font-mono text-xs tracking-widest uppercase font-bold text-[#6C3FC5] mb-4">Price Range</h4>
        <div className="flex gap-2 items-center">
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-medium">Rs.</span>
            <input 
              type="number" 
              placeholder="Min" 
              value={localMinPrice}
              onChange={e => setLocalMinPrice(e.target.value)}
              className="border border-[#E5E0F5] rounded-xl pl-8 pr-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-[#6C3FC5]" 
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-medium">Rs.</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={localMaxPrice}
              onChange={e => setLocalMaxPrice(e.target.value)}
              className="border border-[#E5E0F5] rounded-xl pl-8 pr-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-[#6C3FC5]" 
            />
          </div>
        </div>
        <button 
          onClick={applyPriceRange}
          className="w-full bg-[#6C3FC5] text-white py-2 rounded-xl text-sm font-semibold mt-3 hover:bg-[#5530A8] transition-colors shadow-sm"
        >
          Apply Price
        </button>
      </div>

      <div className="mb-8">
        <h4 className="font-mono text-xs tracking-widest uppercase font-bold text-[#6C3FC5] mb-4">Material</h4>
        <div className="flex flex-col gap-1">
          {ALL_MATERIALS.map(mat => (
            <label key={mat} className="flex items-center gap-3 py-1.5 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedMaterials.includes(mat)}
                onChange={() => handleMaterialToggle(mat)}
                className="w-4 h-4 rounded border-[#E5E0F5] text-[#6C3FC5] focus:ring-[#6C3FC5]" 
              />
              <span className="text-sm text-[#1A1A2E] font-medium group-hover:text-[#6C3FC5] transition-colors">{mat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-mono text-xs tracking-widest uppercase font-bold text-[#6C3FC5] mb-4">Delivery City</h4>
        <div className="flex flex-col gap-1">
          {ALL_CITIES.map(city => (
            <label key={city} className="flex items-center gap-3 py-1.5 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedCities.includes(city)}
                onChange={() => handleCityToggle(city)}
                className="w-4 h-4 rounded border-[#E5E0F5] text-[#6C3FC5] focus:ring-[#6C3FC5]" 
              />
              <span className="text-sm text-[#1A1A2E] font-medium group-hover:text-[#6C3FC5] transition-colors">{city}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={clearAllFilters}
          className="text-[#DC2626] text-sm font-semibold hover:underline w-full text-left flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Clear All Filters
        </button>
      )}
    </>
  )
}
