import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowRight, FolderTree } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'All Categories | Shopkarro Furniture',
  description: 'Explore our furniture collections by room or type.',
}

export default async function CategoriesPage() {
  const supabase = createClient()
  if (!supabase) return null

  // Fetch all active categories to calculate hierarchy in one go
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  const topLevelCategories = allCategories?.filter(cat => !cat.parent_id) || []
  
  if (topLevelCategories.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <FolderTree size={64} className="mx-auto mb-6 text-text opacity-10" />
        <h1 className="text-[24px] font-bold font-heading text-text tracking-widest uppercase mb-4">No categories yet</h1>
        <p className="text-text-muted mb-10 max-w-sm mx-auto">Explore our collection soon. We're currently updating our catalog.</p>
        <Link 
          href="/admin/categories"
          className="border border-border px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[2px] transition-all hover:bg-surface active:scale-95"
        >
          Go to Admin
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      {/* HEADER */}
      <div className="mb-16 text-center md:text-left">
        <h1 className="text-[40px] md:text-[56px] font-bold font-heading text-text tracking-tight leading-tight mb-4">
          All Categories
        </h1>
        <p className="text-text-muted text-[16px] md:text-[18px] font-body max-w-2xl opacity-70">
          Find furniture by room or type. Discover handcrafted pieces designed for your home.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {topLevelCategories.map((cat) => {
          const subcategories = allCategories?.filter(c => c.parent_id === cat.id) || []
          const hasSubcategories = subcategories.length > 0
          const destination = hasSubcategories 
            ? `/categories/${cat.slug}`
            : `/products?category=${cat.id}`

          return (
            <Link 
              key={cat.id} 
              href={destination}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer block transition-all duration-500 bg-surface border border-transparent hover:border-primary/20 shadow-sm"
            >
              {/* Image Layer */}
              <div className="absolute inset-0 z-0">
                {cat.image_url ? (
                  <Image 
                    src={cat.image_url} 
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#F5F2EF]" />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-90"></div>
              </div>

              {/* Subcategories Badge */}
              {hasSubcategories && (
                <div className="absolute top-4 right-4 z-30 bg-primary text-white text-[9px] font-bold uppercase tracking-[2px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  Subcategories <ChevronRight size={10} strokeWidth={3} />
                </div>
              )}

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white text-left z-20">
                <h3 className="font-heading font-bold text-[18px] md:text-[24px] leading-tight mb-2 tracking-tight group-hover:translate-y-[-4px] transition-transform duration-300">
                  {cat.name}
                </h3>
                <div className="overflow-hidden h-6">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[2px] flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    EXPLORE <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
