'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, X, Camera, Hourglass, Sofa, Bed, Archive, Utensils, Box, Plus, Edit2, Trash2 } from 'lucide-react'
import useAdminAuthStore from '@/lib/adminAuthStore'

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'living-room': return <Sofa className="w-5 h-5" />
    case 'bedroom': return <Bed className="w-5 h-5" />
    case 'office': return <Archive className="w-5 h-5" />
    case 'dining': return <Utensils className="w-5 h-5" />
    default: return <Box className="w-5 h-5" />
  }
}

export default function AdminProductsPage() {
  const { hasPermission } = useAdminAuthStore()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProductId, setCurrentProductId] = useState<string | null>(null)
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [flatCategories, setFlatCategories] = useState<{id: string, slug: string, name: string, path: string}[]>([])
  
  const [formData, setFormData] = useState({
    name: '', slug: '', category: '', material: '', price_pkr: '',
    sale_price: '', stock_qty: '10', weight_kg: '', dim_l: '', dim_w: '', dim_h: '',
    description: '', name_urdu: '', is_active: true, images: [] as string[],
    // SEO fields
    meta_title: '', meta_description: '',
    // Rich content
    opening_paragraph: '',
    features: '',  // newline-separated, converted to array on submit
    seo_paragraph: '', closing_cta: '',
    // Per-image alt texts (parallel to images[])
    image_alts: [] as string[]
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchInitialData = async () => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
    const headers = { 'Authorization': `Bearer ${adminToken}` }
    setLoading(true)
    try {
      // 1. Fetch Products
      const prodRes = await fetch(`${apiUrl}/api/products?all=true&limit=100`, { headers, credentials: 'include' })
      const prodData = await prodRes.json()
      setProducts(prodData.data || [])

      // 2. Fetch Categories for selection
      const catRes = await fetch(`${apiUrl}/api/categories?all=true`, { headers, credentials: 'include' })
      const catData = await catRes.json()
      const rawCats = catData.data || []
      setAllCategories(rawCats)

      // 3. Flatten for dropdowns (Parent > Child)
      const parents = rawCats.filter((c: any) => !c.parent_id)
      const subs = rawCats.filter((c: any) => c.parent_id)
      
      const flattened: any[] = []
      parents.forEach((p: any) => {
        flattened.push({ id: p.id, slug: p.slug, name: p.name, path: p.name })
        subs.filter((s: any) => s.parent_id === p.id).forEach((s: any) => {
          flattened.push({ id: s.id, slug: s.slug, name: s.name, path: `${p.name} > ${s.name}` })
        })
      })
      
      setFlatCategories(flattened)
      if (!isEditMode && flattened.length > 0) {
        setFormData(prev => ({ ...prev, category: flattened[0].slug }))
      }

    } catch (err) {
      showToast('Data synchronization failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInitialData() }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredProducts = products
    .filter(p => searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    .filter(p => categoryFilter && categoryFilter !== 'all' ? p.category === categoryFilter : true)
    .filter(p => statusFilter === 'active' ? p.is_active : statusFilter === 'inactive' ? !p.is_active : true)

  const openAddModal = () => {
    setIsEditMode(false); setCurrentProductId(null)
    setFormData({
      name: '', slug: '', category: flatCategories[0]?.slug || 'living-room', material: '', price_pkr: '',
      sale_price: '', stock_qty: '10', weight_kg: '', dim_l: '', dim_w: '', dim_h: '',
      description: '', name_urdu: '', is_active: true, images: [],
      meta_title: '', meta_description: '',
      opening_paragraph: '', features: '', seo_paragraph: '', closing_cta: '',
      image_alts: []
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setIsEditMode(true); setCurrentProductId(product.id)
    setFormData({
      name: product.name || '', slug: product.slug || '', category: product.category || 'living-room',
      material: product.material || '', price_pkr: product.price_pkr?.toString() || '',
      sale_price: product.sale_price?.toString() || '', stock_qty: product.stock_qty?.toString() || '0',
      weight_kg: product.weight_kg?.toString() || '', dim_l: product.dimensions?.L?.toString() || '',
      dim_w: product.dimensions?.W?.toString() || '', dim_h: product.dimensions?.H?.toString() || '',
      description: product.description || '', name_urdu: product.name_urdu || '',
      is_active: product.is_active, images: product.images || [],
      meta_title: product.meta_title || '', meta_description: product.meta_description || '',
      opening_paragraph: product.opening_paragraph || '',
      features: (product.features || []).join('\n'),
      seo_paragraph: product.seo_paragraph || '', closing_cta: product.closing_cta || '',
      image_alts: product.image_alts || []
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
        const res = await fetch(`${apiUrl}/api/products/${id}`, { 
          method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` }, credentials: 'include'
        })
        if (!res.ok) throw new Error('Delete failed')
        setProducts(products.filter(p => p.id !== id))
        showToast('Product deleted.', 'success')
      } catch (err) {
        showToast('Failed to delete product.', 'error')
      }
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
      const res = await fetch(`${apiUrl}/api/products/${id}/toggle`, { 
        method: 'PATCH', headers: { 'Authorization': `Bearer ${adminToken}` }, credentials: 'include'
      })
      const { data } = await res.json()
      setProducts(products.map(p => p.id === id ? data : p))
      showToast(data.is_active ? 'Status: Active' : 'Status: Inactive', 'success')
    } catch (err) {
      showToast('Status synchronization failed.', 'error')
    }
  }

  const getCategoryName = (idOrSlug: string) => {
    // Check by ID first (uuid), then slug for backward compatibility
    const cat = allCategories.find(c => c.id === idOrSlug || c.slug === idOrSlug)
    if (!cat) return idOrSlug
    
    if (cat.parent_id) {
      const parent = allCategories.find(p => p.id === cat.parent_id)
      return parent ? `${parent.name} > ${cat.name}` : cat.name
    }
    return cat.name
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev, name: val,
      slug: !isEditMode ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return
    
    // Calculate remaining slots
    const rem = 5 - formData.images.length
    if (rem <= 0) {
      showToast('Maximum 5 images reached.', 'error')
      return
    }
    
    // Filter out files beyond limit
    const filesToUpload = Array.from(files).slice(0, rem)
    
    setIsUploading(true)
    setUploadingCount(filesToUpload.length)
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const fData = new FormData()
      fData.append('image', filesToUpload[i])
      try {
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
        // IMPORTANT: Do NOT set Content-Type header manually when sending FormData.
        // The browser must auto-generate the multipart/form-data boundary.
        const res = await fetch(`${apiUrl}/api/upload/product`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          credentials: 'include',
          body: fData
        })
        const data = await res.json()
        if (res.ok && data.url) {
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }))
        } else {
          console.error('Upload error response:', data)
          showToast(data.error || `Upload failed (${res.status})`, 'error')
        }
      } catch (err) { 
        console.error('Upload network error:', err)
        showToast('Network error during upload', 'error')
      }
      setUploadingCount(prev => prev - 1)
    }
    setIsUploading(false); e.target.value = ''
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    const featuresArray = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0)
    const payload = {
      name: formData.name, slug: formData.slug, category: formData.category, material: formData.material,
      price_pkr: parseInt(formData.price_pkr) || 0, sale_price: formData.sale_price ? parseInt(formData.sale_price) : null,
      stock_qty: parseInt(formData.stock_qty) || 0, weight_kg: parseFloat(formData.weight_kg) || 0,
      dimensions: { L: parseFloat(formData.dim_l) || 0, W: parseFloat(formData.dim_w) || 0, H: parseFloat(formData.dim_h) || 0, unit: 'in' },
      description: formData.description, name_urdu: formData.name_urdu, is_active: formData.is_active, images: formData.images,
      meta_title: formData.meta_title || null, meta_description: formData.meta_description || null,
      opening_paragraph: formData.opening_paragraph || null,
      features: featuresArray,
      seo_paragraph: formData.seo_paragraph || null,
      closing_cta: formData.closing_cta || null,
      image_alts: formData.image_alts
    }
    try {
      const url = isEditMode ? `${apiUrl}/api/products/${currentProductId}` : `${apiUrl}/api/products`
      const method = isEditMode ? 'PATCH' : 'POST'
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
      const res = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Submission failed')
      }

      showToast(`Product saved: ${formData.name}`)
      setIsModalOpen(false); fetchInitialData()
    } catch (err: any) {
      showToast(err.message || 'Save failed.', 'error')
    }
  }

  return (
    <div className="relative font-body">
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 rounded-0 shadow-2xl flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}</span>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40 mb-1">Manage Products</p>
          <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">Products</h2>
        </div>
        {hasPermission('products_edit') && (
          <button onClick={openAddModal} className="bg-[#1C1410] text-white px-8 py-4 rounded-0 font-bold uppercase tracking-[3px] text-[12px] hover:bg-[#33221b] transition-all shadow-xl active:scale-95">
            + Add Product
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="flex-1 border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[13px] focus:border-[#783A3A] outline-none shadow-sm font-body" />
        <div className="relative min-w-[180px]">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[11px] font-bold uppercase tracking-[2px] appearance-none pr-10 cursor-pointer focus:border-[#783A3A] outline-none">
            <option value="all">All Categories</option>
            {flatCategories.map(c => (
              <option key={c.id} value={c.id}>{c.path}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        </div>
        <div className="relative min-w-[180px]">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[11px] font-bold uppercase tracking-[2px] appearance-none pr-10 cursor-pointer focus:border-[#783A3A] outline-none">
            <option value="all">Status</option>
            <option value="active">Active Products</option>
            <option value="inactive">Archived Products</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        </div>
      </div>

      <div className="bg-white rounded-0 border border-[#E8E2D9] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#E8E2D9]">
            <tr>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Image</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Product Name</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Category</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Price</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Stock</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Status</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i} className="border-b border-[#FAF7F4] animate-pulse">
                <td className="px-8 py-6"><div className="w-16 h-16 bg-gray-100 rounded-0" /></td>
                <td className="px-8 py-6"><div className="w-40 h-4 bg-gray-100 mb-2" /><div className="w-20 h-3 bg-gray-100" /></td>
                <td className="px-8 py-6"><div className="w-20 h-6 bg-gray-100 rounded-0" /></td>
                <td className="px-8 py-6"><div className="w-24 h-4 bg-gray-100" /></td>
                <td className="px-8 py-6"><div className="w-16 h-4 bg-gray-100" /></td>
                <td className="px-8 py-6"><div className="w-10 h-6 bg-gray-100 rounded-0" /></td>
                <td className="px-8 py-6"><div className="w-20 h-8 bg-gray-100 rounded-0" /></td>
              </tr>
            )) : filteredProducts.length === 0 ? (
              <tr><td colSpan={7} className="px-8 py-24 text-center opacity-40 uppercase tracking-[4px] font-bold text-[12px]">No exhibits found in registry.</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p.id} className="border-b border-[#FAF7F4] last:border-0 hover:bg-[#FAF7F4]/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="w-16 h-16 bg-[#FAF7F4] border border-[#E8E2D9] relative overflow-hidden ring-1 ring-[#1C1410]/5">
                    {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">{getCategoryEmoji(p.category)}</div>}
                  </div>
                </td>
                <td className="px-8 py-6 text-left">
                  <p className="font-bold text-[#1C1410] text-[15px] font-heading tracking-widest">{p.name}</p>
                  <p className="text-[10px] text-[#6B6058] font-bold opacity-40 mt-1 uppercase tracking-widest">{p.slug}</p>
                </td>
                <td className="px-8 py-6"><span className="text-[9px] font-bold uppercase tracking-[2px] px-3 py-1 bg-[#F5E8E8] text-[#783A3A] border border-[rgba(120,58,58,0.1)]">{getCategoryName(p.category)}</span></td>
                <td className="px-8 py-6">
                  {p.sale_price ? <><p className="font-bold text-[#783A3A] font-heading text-[16px]">{p.sale_price.toLocaleString()} PKR</p><p className="text-[10px] line-through text-[#6B6058] opacity-40">Was {p.price_pkr.toLocaleString()} PKR</p></> : <p className="font-bold text-[#1C1410] font-heading text-[16px]">{p.price_pkr?.toLocaleString()} PKR</p>}
                </td>
                <td className="px-8 py-6"><p className={`text-[12px] font-bold uppercase tracking-widest ${p.stock_qty > 5 ? 'text-[#2D6A4F]' : 'text-red-500'}`}>{p.stock_qty} Items</p></td>
                <td className="px-8 py-6">
                  {hasPermission('products_edit') ? (
                    <button onClick={() => handleToggle(p.id)} className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${p.is_active ? 'bg-[#2D6A4F]' : 'bg-[#E8E2D9]'}`}>
                      <div className={`w-4 h-4 bg-white shadow-md rounded-full absolute top-1 transition-all ${p.is_active ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  ) : (
                    <div className={`w-11 h-6 rounded-full relative opacity-40 ${p.is_active ? 'bg-[#2D6A4F]' : 'bg-[#E8E2D9]'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 ${p.is_active ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-4">
                    {hasPermission('products_edit') && (
                      <button onClick={() => openEditModal(p)} className="p-2 border border-[#E8E2D9] text-[#1C1410] hover:bg-[#1C1410] hover:text-white transition-all">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {hasPermission('products_delete') && (
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 border border-[#E8E2D9] text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                    {!hasPermission('products_edit') && !hasPermission('products_delete') && (
                      <span className="text-[10px] uppercase font-bold opacity-20">No Auth</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1C1410]/60 z-50 overflow-y-auto flex items-start justify-center pt-10 pb-10 px-6 backdrop-blur-md text-left">
          <div className="bg-white rounded-0 max-w-4xl w-full p-12 md:p-16 shadow-2xl relative animate-slideUp">
            <div className="flex justify-between items-start mb-12 border-b border-[#FAF7F4] pb-8">
              <div><p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[3px] opacity-40 mb-2">New Product</p><h2 className="font-heading font-bold text-[32px] text-[#1C1410] uppercase tracking-widest">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2></div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#1C1410] text-4xl font-light hover:opacity-100 opacity-20 transition">&times;</button>
            </div>
            <form onSubmit={submitForm} className="grid grid-cols-2 gap-10">

              {/* ── SECTION 1: BASIC INFO ── */}
              <div className="col-span-2 md:col-span-1 space-y-8">
                <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Product Name *</label><input required value={formData.name} onChange={handleNameChange} className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[14px] focus:border-[#1C1410] outline-none shadow-sm font-body" /></div>
                <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">URL Slug *</label><input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] font-mono opacity-60 outline-none" /><p className="text-[9px] text-[#6B6058] mt-2 font-bold opacity-40 italic">Auto-generated from product name. You can edit it manually.</p></div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Category *</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[11px] font-bold uppercase tracking-[1px] appearance-none bg-white"
                    >
                      {flatCategories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.path}</option>
                      ))}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Material</label><input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} placeholder="e.g. Keekar Wood" className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body" /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Price (PKR) *</label><input required type="number" value={formData.price_pkr} onChange={e => setFormData({...formData, price_pkr: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[14px] outline-none font-body" /></div>
                  <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Sale Price (PKR)</label><input type="number" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[14px] outline-none font-body" /></div>
                </div>
              </div>

              {/* ── SECTION 2: STOCK & DIMENSIONS ── */}
              <div className="col-span-2 md:col-span-1 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1"><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Stock Quantity</label><input type="number" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-4 py-4 text-center outline-none font-body" /></div>
                  <div className="col-span-2"><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Weight (KG)</label><input type="number" step="0.1" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-4 py-4 text-center outline-none font-body" /></div>
                </div>
                <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Dimensions (L × W × H inches)</label><div className="flex gap-4"><input placeholder="L" type="number" value={formData.dim_l} onChange={e => setFormData({...formData, dim_l: e.target.value})} className="w-full border border-[#D4CCC2] text-center py-4 font-body" /><input placeholder="W" type="number" value={formData.dim_w} onChange={e => setFormData({...formData, dim_w: e.target.value})} className="w-full border border-[#D4CCC2] text-center py-4 font-body" /><input placeholder="H" type="number" value={formData.dim_h} onChange={e => setFormData({...formData, dim_h: e.target.value})} className="w-full border border-[#D4CCC2] text-center py-4 font-body" /></div></div>
                <div><label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Specifications Description</label><textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Appears in the Specifications tab on the product page" className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none h-28 font-body" /></div>
              </div>

              {/* ── SECTION 3: SEO ── */}
              <div className="col-span-2 border border-[#E8E2D9] rounded-0 p-8 bg-[#FDFCFA] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-[3px] bg-[#783A3A] text-white px-3 py-1">SEO</span>
                  <span className="text-[11px] text-[#6B6058] font-bold uppercase tracking-[2px] opacity-60">Search Engine Optimisation</span>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] opacity-40">Meta Title</label>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-[#6B6058] opacity-40'}`}>{formData.meta_title.length}/60</span>
                  </div>
                  <input
                    value={formData.meta_title}
                    onChange={e => setFormData({...formData, meta_title: e.target.value})}
                    placeholder="e.g. Nautical Azure Console | Teal Hand-Painted Table Pakistan"
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body focus:border-[#1C1410]"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] opacity-40">Meta Description</label>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.meta_description.length > 160 ? 'text-red-500' : formData.meta_description.length > 140 ? 'text-green-600' : 'text-[#6B6058] opacity-40'}`}>{formData.meta_description.length}/160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.meta_description}
                    onChange={e => setFormData({...formData, meta_description: e.target.value})}
                    placeholder="Shop the... — describe product benefits. Target 140–160 chars."
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body focus:border-[#1C1410] resize-none"
                  />
                </div>
              </div>

              {/* ── SECTION 4: RICH CONTENT ── */}
              <div className="col-span-2 border border-[#E8E2D9] rounded-0 p-8 bg-[#FDFCFA] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-[3px] bg-[#1C1410] text-white px-3 py-1">Content</span>
                  <span className="text-[11px] text-[#6B6058] font-bold uppercase tracking-[2px] opacity-60">Rich Product Content</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Opening Paragraph (Bold Intro)</label>
                  <textarea
                    rows={4}
                    value={formData.opening_paragraph}
                    onChange={e => setFormData({...formData, opening_paragraph: e.target.value})}
                    placeholder="Make a statement that no one forgets. The [Product Name] is not just furniture — it is wearable art for your home..."
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body focus:border-[#1C1410] resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-2 opacity-40">Features / Bullet Points</label>
                  <p className="text-[10px] text-[#6B6058] opacity-50 mb-3 font-body">One feature per line — each line becomes a bullet point on the product page.</p>
                  <textarea
                    rows={7}
                    value={formData.features}
                    onChange={e => setFormData({...formData, features: e.target.value})}
                    placeholder={`Hand-painted nautical scene on tabletop\nVibrant teal deco paint finish with lacquer\nIntricate floral accents on drawer fronts\n2 functional drawers with smooth glide\nElegant curved cabriole legs`}
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body focus:border-[#1C1410] resize-none leading-relaxed"
                  />
                  {formData.features && (
                    <p className="text-[10px] text-[#6B6058] opacity-40 mt-2">{formData.features.split('\n').filter(f => f.trim()).length} bullet point(s)</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">SEO Paragraph (City Targeting)</label>
                  <textarea
                    rows={4}
                    value={formData.seo_paragraph}
                    onChange={e => setFormData({...formData, seo_paragraph: e.target.value})}
                    placeholder="The [Product] is available with cash on delivery across Pakistan, including Lahore, Karachi, Islamabad..."
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body focus:border-[#1C1410] resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Closing CTA Text</label>
                  <input
                    value={formData.closing_cta}
                    onChange={e => setFormData({...formData, closing_cta: e.target.value})}
                    placeholder="Order now and pay on delivery — no card, no compromise."
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body focus:border-[#1C1410]"
                  />
                </div>
              </div>
              {/* ── SECTION 5: IMAGES ── */}
              <div className="col-span-2 py-8 bg-[#FAF7F4] p-8 -mx-1 border-t border-b border-[#E8E2D9]">
                <div className="flex justify-between items-end mb-6">
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[3px] block opacity-60">Product Images</label>
                  <span className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[1.5px] opacity-40">{formData.images.length}/5 images</span>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {formData.images.length < 5 && (
                    <label className={`cursor-pointer bg-white border-2 border-dashed border-[#D4CCC2] aspect-square flex flex-col items-center justify-center hover:border-[#1C1410] transition group relative ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="mb-1">{isUploading ? <Hourglass className="w-8 h-8 opacity-20 group-hover:opacity-100 transition" /> : <Camera className="w-8 h-8 opacity-20 group-hover:opacity-100 transition" />}</div>
                      <span className="text-[9px] font-bold uppercase tracking-[2px] mt-2 opacity-40">{isUploading ? `Uploading ${uploadingCount}...` : 'Add Image'}</span>
                      <span className="text-[7px] font-bold uppercase tracking-[1px] opacity-25 mt-1">Max 5MB • JPG/PNG</span>
                      <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  )}

                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative border border-[#E8E2D9] group bg-white shadow-inner">
                      <div className="relative aspect-square overflow-hidden">
                        <Image src={img} alt={formData.image_alts[idx] || 'product image'} fill className="object-cover" />
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1 bg-[#783A3A] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-md">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            removeImage(idx)
                            setFormData(prev => ({
                              ...prev,
                              image_alts: prev.image_alts.filter((_, i) => i !== idx)
                            }))
                          }}
                          className="absolute top-1 right-1 bg-[#1C1410]/70 text-white w-6 h-6 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1C1410]"
                        >
                          &times;
                        </button>
                      </div>
                      {/* Alt text input */}
                      <div className="px-2 py-2">
                        <input
                          type="text"
                          value={formData.image_alts[idx] || ''}
                          onChange={e => {
                            const alts = [...formData.image_alts]
                            alts[idx] = e.target.value
                            setFormData(prev => ({ ...prev, image_alts: alts }))
                          }}
                          placeholder={`Alt text ${idx + 1}`}
                          className="w-full text-[9px] border border-[#E8E2D9] bg-white px-2 py-1.5 outline-none font-body focus:border-[#1C1410] placeholder:opacity-40"
                        />
                      </div>
                    </div>
                  ))}

                  {formData.images.length === 5 && (
                    <div className="aspect-square bg-white/50 border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center text-center p-4">
                      <span className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[1.5px] opacity-40">Max Limit Reached</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[#6B6058] opacity-40 mt-4 font-body">Add descriptive alt text for each image to improve SEO and accessibility.</p>
              </div>
              <div className="col-span-2 flex justify-between items-center mt-6 pt-10 border-t border-[#FAF7F4]">
                <div className="flex items-center gap-4"><button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`w-12 h-6 rounded-full relative shadow-inner ${formData.is_active ? 'bg-[#2D6A4F]' : 'bg-[#E8E2D9]'}`}><div className={`w-4 h-4 bg-white shadow-md rounded-full absolute top-1 transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} /></button><span className="text-[11px] font-bold uppercase tracking-[2px]">Product is Active</span></div>
                <div className="flex gap-6"><button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-[11px] font-bold uppercase tracking-[3px] opacity-40 hover:opacity-100 transition">Cancel</button><button type="submit" className="bg-[#1C1410] text-white px-12 py-5 font-bold uppercase tracking-[3px] text-[11px] shadow-2xl active:scale-95 transition-all">Save Product</button></div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
