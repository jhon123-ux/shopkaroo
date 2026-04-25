import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Home, ArrowLeft, LayoutGrid } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  if (!supabase) return { title: 'Category' }

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .single()

  return {
    title: category ? `${category.name} | Shopkarro` : 'Category',
    description: `Browse our collection in ${category?.name || 'Category'}.`
  }
}

export default async function SubcategoriesPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()
  if (!supabase) return null

  // 1. Fetch parent category
  const { data: parentCategory } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!parentCategory) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="mb-8 opacity-20 flex justify-center text-text">
          <LayoutGrid size={64} />
        </div>
        <h1 className="text-[24px] font-bold font-heading text-text tracking-widest uppercase mb-4">Category not found</h1>
        <p className="text-text-muted mb-10 max-w-sm mx-auto">The collection you are looking for does not exist or has been relocated.</p>
        <Link 
          href="/categories"
          className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-[4px] text-[11px] font-bold uppercase tracking-[2px] transition-all hover:bg-primary-dark active:scale-95 shadow-xl"
        >
          <ArrowLeft size={16} /> Back to Categories
        </Link>
      </main>
    )
  }

  // 2. Fetch all subcategories
  const { data: subcategories } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentCategory.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 animate-fadeIn">
      
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 mb-12 text-[11px] font-bold uppercase tracking-widest text-text-muted">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 opacity-60">
          <Home size={12} className="mt-[-2px]" /> Home
        </Link>
        <ChevronRight size={12} className="opacity-30" />
        <Link href="/categories" className="hover:text-primary transition-colors opacity-60">
          Collections
        </Link>
        <ChevronRight size={12} className="opacity-30" />
        <span className="text-primary">{parentCategory.name}</span>
      </nav>

      {/* HEADER */}
      <div className="mb-16">
        <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[4px] mb-4 opacity-70">Category</p>
        <h1 className="text-[40px] md:text-[56px] font-bold font-heading text-text tracking-tight leading-tight mb-4">
          {parentCategory.name}
        </h1>
        {parentCategory.description && (
          <p className="text-text-muted text-[16px] md:text-[18px] font-body max-w-2xl opacity-70">
            {parentCategory.description}
          </p>
        )}
      </div>

      {/* GRID */}
      {(!subcategories || subcategories.length === 0) ? (
        <div className="bg-surface border border-border p-20 text-center rounded-[4px]">
           <p className="text-text-muted font-bold text-[14px] uppercase tracking-widest opacity-40 mb-8">No subcategories found</p>
           <Link 
            href={`/furniture/${parentCategory.slug}`}
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-[4px] text-[11px] font-bold uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-lg"
           >
             View All {parentCategory.name} products <ArrowRight size={16} />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {subcategories.map((sub) => (
            <Link 
              key={sub.id} 
              href={`/furniture/${sub.slug}`}
              className="group relative aspect-[3/4] rounded-[4px] overflow-hidden cursor-pointer block transition-all duration-500 bg-surface border border-border hover:border-primary/40 shadow-sm"
            >
              {/* Image Layer */}
              <div className="absolute inset-0 z-0">
                {sub.image_url ? (
                  <Image 
                    src={sub.image_url} 
                    alt={sub.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#F5F2EF]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10 opacity-90 transition-opacity"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white text-left z-20">
                <h3 className="font-heading font-bold text-[18px] md:text-[24px] leading-tight mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                  {sub.name}
                </h3>
                <div className="overflow-hidden">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[2px] flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                    SHOP COLLECTION <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
