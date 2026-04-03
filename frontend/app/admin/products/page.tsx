'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'living-room': return '🛋️'
    case 'bedroom': return '🛏️'
    case 'office': return '🪑'
    case 'dining': return '🍽️'
    default: return '🪴'
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProductId, setCurrentProductId] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'living-room',
    material: '',
    price_pkr: '',
    sale_price: '',
    stock_qty: '10',
    weight_kg: '',
    dim_l: '',
    dim_w: '',
    dim_h: '',
    description: '',
    name_urdu: '',
    is_active: true,
    images: [] as string[]
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchProducts = async () => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const headers = { 'x-admin-auth': adminToken || '' }
    
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/products?all=true&limit=100`, { headers })
      const data = await res.json()
      setProducts(data.data || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Derived filtered array
  const filteredProducts = products
    .filter(p => searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    .filter(p => categoryFilter && categoryFilter !== 'all' ? p.category === categoryFilter : true)
    .filter(p => statusFilter === 'active' ? p.is_active : statusFilter === 'inactive' ? !p.is_active : true)

  const openAddModal = () => {
    setIsEditMode(false)
    setCurrentProductId(null)
    setFormData({
      name: '',
      slug: '',
      category: 'living-room',
      material: '',
      price_pkr: '',
      sale_price: '',
      stock_qty: '10',
      weight_kg: '',
      dim_l: '', dim_w: '', dim_h: '',
      description: '',
      name_urdu: '',
      is_active: true,
      images: []
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setIsEditMode(true)
    setCurrentProductId(product.id)
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || 'living-room',
      material: product.material || '',
      price_pkr: product.price_pkr?.toString() || '',
      sale_price: product.sale_price?.toString() || '',
      stock_qty: product.stock_qty?.toString() || '0',
      weight_kg: product.weight_kg?.toString() || '',
      dim_l: product.dimensions?.L?.toString() || '',
      dim_w: product.dimensions?.W?.toString() || '',
      dim_h: product.dimensions?.H?.toString() || '',
      description: product.description || '',
      name_urdu: product.name_urdu || '',
      is_active: product.is_active,
      images: product.images || []
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      try {
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
        const res = await fetch(`${backendUrl}/api/products/${id}`, { 
          method: 'DELETE',
          headers: { 'x-admin-auth': adminToken || '' }
        })
        if (!res.ok) throw new Error('Delete failed')
        
        setProducts(products.filter(p => p.id !== id))
        showToast('Product deleted!', 'success')
      } catch (err) {
        showToast('Failed to delete product', 'error')
      }
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch(`${backendUrl}/api/products/${id}/toggle`, { 
        method: 'PATCH',
        headers: { 'x-admin-auth': adminToken || '' }
      })
      if (!res.ok) throw new Error('Toggle failed')
      
      const { data } = await res.json()
      setProducts(products.map(p => p.id === id ? data : p))
      showToast(data.is_active ? 'Product matched active' : 'Product set inactive', 'success')
    } catch (err) {
      showToast('Toggle error', 'error')
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev,
      name: val,
      // Auto-generate slug if not editing
      slug: !isEditMode ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fData = new FormData()
      fData.append('image', file)

      try {
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
        const res = await fetch(`${backendUrl}/api/upload/product`, {
          method: 'POST',
          headers: { 'x-admin-auth': adminToken || '' },
          body: fData
        })
        const data = await res.json()
        if (res.ok && data.url) {
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }))
        }
      } catch (err) {
        console.error('Upload fail:', err)
      }
    }
    setIsUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // transform string payloads into db architecture matches
    const payload = {
      name: formData.name,
      slug: formData.slug,
      category: formData.category,
      material: formData.material,
      price_pkr: parseInt(formData.price_pkr) || 0,
      sale_price: formData.sale_price ? parseInt(formData.sale_price) : null,
      stock_qty: parseInt(formData.stock_qty) || 0,
      weight_kg: parseFloat(formData.weight_kg) || 0,
      dimensions: {
        L: parseFloat(formData.dim_l) || 0,
        W: parseFloat(formData.dim_w) || 0,
        H: parseFloat(formData.dim_h) || 0,
        unit: 'cm'
      },
      description: formData.description,
      name_urdu: formData.name_urdu,
      is_active: formData.is_active,
      images: formData.images
    }

    try {
      const url = isEditMode 
        ? `${backendUrl}/api/products/${currentProductId}` 
        : `${backendUrl}/api/products`
      const method = isEditMode ? 'PATCH' : 'POST'
      
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': adminToken || ''
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Submission failed')

      showToast(`Product ${isEditMode ? 'updated' : 'created'} successfully!`)
      setIsModalOpen(false)
      fetchProducts() // refresh all mappings natively
      
    } catch (err) {
      showToast('Failed to save product', 'error')
    }
  }

  return (
    <div className="relative font-body">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp text-white font-medium ${
          toast.type === 'success' ? 'bg-[#1A1A2E]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          
          <p className="text-[#6B7280] text-sm mt-1">{products.length} total products</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#6C3FC5] text-white px-6 py-3 rounded-xl font-semibold font-heading hover:bg-[#5530A8] transition-all shadow-sm active:scale-95"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5] outline-none transition-shadow"
        />
        <div className="relative min-w-[160px]">
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm appearance-none bg-white pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none transition-shadow"
          >
            <option value="all">All Categories</option>
            <option value="living-room">Living Room</option>
            <option value="bedroom">Bedroom</option>
            <option value="office">Office</option>
            <option value="dining">Dining</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="relative min-w-[160px]">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm appearance-none bg-white pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none transition-shadow"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5E0F5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F5FF] border-b border-[#E5E0F5]">
              <tr>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Image</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Product</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Category</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Price</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Stock</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // SKELETONS
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[#E5E0F5] animate-pulse">
                    <td className="px-6 py-4"><div className="w-14 h-14 bg-gray-200 rounded-xl"></div></td>
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-gray-200 rounded"></div><div className="w-20 h-3 bg-gray-100 rounded mt-2"></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-6 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-10 h-6 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-8 bg-gray-200 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="font-heading font-bold text-2xl text-[#1A1A2E]">No products yet</h3>
                    <p className="text-[#6B7280] mt-2 mb-6">Add your first product to start selling</p>
                    <button onClick={openAddModal} className="bg-[#6C3FC5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5530A8] transition-all">
                      + Add First Product
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-[#E5E0F5] last:border-0 hover:bg-[#F7F5FF] transition">
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F7F5FF] flex items-center justify-center border border-[#E5E0F5] relative">
                        {p.images && p.images.length > 0 ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <span className="text-2xl">{getCategoryEmoji(p.category)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#1A1A2E] text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5 font-mono">{p.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#EDE6FA] text-[#6C3FC5] text-xs px-3 py-1 rounded-full font-mono inline-block">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.sale_price ? (
                        <>
                          <p className="font-bold text-[#6C3FC5] font-heading">Rs. {p.sale_price.toLocaleString()}</p>
                          <p className="text-xs line-through text-[#6B7280] mt-0.5">Rs. {p.price_pkr.toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="font-bold text-[#6C3FC5] font-heading">Rs. {p.price_pkr?.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.stock_qty > 5 ? (
                        <span className="text-[#4CAF7D] font-medium text-sm">{p.stock_qty} in stock</span>
                      ) : p.stock_qty > 0 ? (
                        <span className="text-[#D97706] font-medium text-sm">Low: {p.stock_qty}</span>
                      ) : (
                        <span className="text-[#DC2626] font-medium text-sm font-bold">Out of stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(p.id)}
                        className={`w-11 h-6 rounded-full relative transition-colors ${p.is_active ? 'bg-[#6C3FC5]' : 'bg-[#D1D5DB]'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${p.is_active ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(p)} className="bg-[#EDE6FA] text-[#6C3FC5] p-2 rounded-lg hover:bg-[#6C3FC5] hover:text-white transition" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" className="bg-[#F7F5FF] text-[#6B7280] p-2 rounded-lg hover:bg-[#1A1A2E] hover:text-white transition" title="View">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>
                        <button onClick={() => handleDelete(p.id, p.name)} className="bg-[#FEF2F2] text-[#DC2626] p-2 rounded-lg hover:bg-[#DC2626] hover:text-white transition" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto flex items-start justify-center pt-8 pb-10 px-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl relative animate-slideUp">
            
            <div className="flex justify-between items-center mb-8 border-b border-[#E5E0F5] pb-4">
              <h2 className="font-heading font-bold text-2xl text-[#1A1A2E]">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A2E] text-3xl transition-colors">&times;</button>
            </div>

            <form onSubmit={submitForm} className="grid grid-cols-2 gap-6">
              
              {/* LEFT COL */}
              <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Product Name *</label>
                  <input required placeholder="Sheesham Wood Sofa Set" value={formData.name} onChange={handleNameChange} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Slug *</label>
                  <input required placeholder="sheesham-wood-sofa" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none font-mono text-[#6B7280]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Category *</label>
                <div className="relative">
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm appearance-none bg-white pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none"
                  >
                    <option value="living-room">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="office">Office</option>
                    <option value="dining">Dining</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Material</label>
                  <input placeholder="Sheesham Wood" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Regular Price PKR *</label>
                  <input required type="number" min="0" placeholder="85000" value={formData.price_pkr} onChange={e => setFormData({...formData, price_pkr: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Sale Price PKR</label>
                  <input type="number" min="0" placeholder="72000 (leave empty for none)" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Stock *</label>
                    <input required type="number" min="0" placeholder="10" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Weight (kg)</label>
                    <input type="number" step="0.1" placeholder="45.5" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none" />
                  </div>
                </div>
              </div>

              {/* RIGHT COL */}
              <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Dimensions (cm) - L | W | H</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="L" value={formData.dim_l} onChange={e => setFormData({...formData, dim_l: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none text-center" />
                    <input type="number" placeholder="W" value={formData.dim_w} onChange={e => setFormData({...formData, dim_w: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none text-center" />
                    <input type="number" placeholder="H" value={formData.dim_h} onChange={e => setFormData({...formData, dim_h: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none text-center" />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Description</label>
                  <textarea rows={4} placeholder="Describe the product..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none resize-none" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Urdu Name</label>
                  <input placeholder="سیسم سوفہ" value={formData.name_urdu} onChange={e => setFormData({...formData, name_urdu: e.target.value})} className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none text-right font-urdu" dir="rtl" />
                </div>
                
                <div className="flex items-center gap-3 bg-[#F7F5FF] p-4 rounded-xl border border-[#E5E0F5] mt-2">
                  <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_active ? 'bg-[#6C3FC5]' : 'bg-[#D1D5DB]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.is_active ? 'left-7' : 'left-1'}`}></div>
                  </button>
                  <span className="text-sm font-bold text-[#1A1A2E]">Product is active</span>
                </div>
              </div>

              {/* IMAGE UPLOAD (FULL WIDTH) */}
              <div className="col-span-2 mt-2">
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Product Images</label>
                
                <label className="block border-2 border-dashed border-[#E5E0F5] rounded-2xl p-8 text-center hover:border-[#6C3FC5] transition cursor-pointer bg-gray-50/50">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="font-semibold text-[#1A1A2E]">{isUploading ? 'Uploading...' : 'Upload product images'}</p>
                  <p className="text-[#6B7280] text-sm mt-1">PNG, JPG, WebP up to 5MB each</p>
                  <input type="file" hidden accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} disabled={isUploading} />
                </label>

                {/* Previews */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-[#E5E0F5]">
                        <Image src={img} alt="preview" fill className="object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-[#DC2626] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-700 transition">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <div className="col-span-2 mt-6 pt-6 border-t border-[#E5E0F5] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-[#6B7280] bg-[#F7F5FF] hover:bg-[#E5E0F5] transition">Cancel</button>
                <button type="submit" className="bg-[#6C3FC5] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5530A8] transition shadow-md active:scale-95">
                  Save Product
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
