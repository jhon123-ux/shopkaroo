'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  FolderOpen, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  CheckCircle,
  Eye,
  EyeOff,
  MoveVertical,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
    parent_id: ''
  })

  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch(`${backendUrl}/api/categories?all=true`, {
        headers: { 'x-admin-auth': adminToken || '' }
      })
      const data = await res.json()
      setCategories(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditingCat(cat)
      setFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image_url: cat.image_url || '',
        sort_order: cat.sort_order || 0,
        is_active: cat.is_active,
        parent_id: cat.parent_id || ''
      })
    } else {
      setEditingCat(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        sort_order: categories.length + 1,
        is_active: true,
        parent_id: ''
      })
    }
    setShowModal(true)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const fData = new FormData()
    fData.append('image', file)

    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch(`${backendUrl}/api/upload/category`, {
        method: 'POST',
        headers: { 'x-admin-auth': adminToken || '' },
        body: fData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }))
        showToast('Image uploaded successfully')
      }
    } catch (err: any) {
      console.error('Image Upload Error:', err)
      showToast(err.message || 'Asset synchronization failed', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const method = editingCat ? 'PATCH' : 'POST'
    const url = editingCat ? `${backendUrl}/api/categories/${editingCat.id}` : `${backendUrl}/api/categories`

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': adminToken || '' 
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category manifest')
      }
      
      showToast(`Category ${editingCat ? 'updated' : 'created'} successfully`)
      setShowModal(false)
      fetchCategories()
    } catch (err: any) {
      console.error('Save Category Error:', err)
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to expunge this category?')) return
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''

    try {
      const res = await fetch(`${backendUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': adminToken || '' }
      })
      if (res.ok) {
        showToast('Category expunged')
        fetchCategories()
      }
    } catch (err) {
      showToast('Deletion failed', 'error')
    }
  }

  const handleToggle = async (id: string) => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    try {
      const res = await fetch(`${backendUrl}/api/categories/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'x-admin-auth': adminToken || '' }
      })
      if (res.ok) fetchCategories()
    } catch (err) {
      showToast('Toggle failed', 'error')
    }
  }

  const getGradient = (slug: string) => {
    switch (slug) {
      case 'living-room': return 'linear-gradient(135deg, #783A3A, #9B5656)'
      case 'bedroom': return 'linear-gradient(135deg, #5B2C2C, #5D4480)'
      case 'office': return 'linear-gradient(135deg, #1C1410, #783A3A)'
      case 'dining': return 'linear-gradient(135deg, #2D1B40, #9B5656)'
      default: return 'linear-gradient(135deg, #6B6058, #A89890)'
    }
  }

  return (
    <div className="relative font-body">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 rounded-0 shadow-lg flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}</span>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-1">Hierarchy Manifest</p>
          <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">Categories</h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#783A3A] text-white px-6 py-3 rounded-[3px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-[#5B2C2C] transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Category
        </button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-[300px] bg-white border border-[#E8E2D9] animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[#E8E2D9] p-24 text-center">
          <FolderOpen size={48} className="mx-auto mb-6 text-[#1C1410] opacity-10" />
          <h3 className="font-heading font-bold text-[20px] text-[#1C1410] uppercase tracking-widest">No Classifications Found</h3>
          <p className="text-[#6B6058] mt-4 opacity-60">Begin by adding your first product category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories
            .filter(cat => !cat.parent_id)
            .map((cat) => (
            <div key={cat.id} className="bg-white border border-[#E8E2D9] rounded-0 overflow-hidden shadow-sm group hover:border-[#783A3A] transition-colors relative flex flex-col">
              {/* Card Body Link */}
              <Link href={`/admin/categories/${cat.id}`} className="flex-1 flex flex-col cursor-pointer pb-20">
                {/* Image Preview */}
                <div className="h-40 relative flex items-center justify-center overflow-hidden">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: getGradient(cat.slug) }} />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] border ${
                      cat.is_active ? 'bg-[#EBF7F0] text-[#2D6A4F] border-[rgba(45,106,79,0.1)]' : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Overlay for "Manage Subcategories" */}
                  <div className="absolute inset-0 bg-[#1C1410]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase tracking-[3px] border border-white/40 px-4 py-2 flex items-center gap-2">
                      Manage Subcategories <ChevronRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <h3 className="font-heading font-bold text-[18px] text-[#1C1410] uppercase tracking-widest">{cat.name}</h3>
                    </div>
                    <span className="bg-[#FAF7F4] text-[#1C1410] px-2 py-1 text-[10px] font-mono font-bold">ORDER: {cat.sort_order}</span>
                  </div>
                  <p className="text-[11px] text-[#6B6058] font-mono tracking-wider mb-2">slug/{cat.slug}</p>
                  
                  {/* Subcategories Count */}
                  <div className="mt-4 flex items-center gap-2 text-[#783A3A] text-[10px] font-bold uppercase tracking-wider">
                    <FolderOpen size={12} />
                    {categories.filter(c => c.parent_id === cat.id).length} Subcategories
                  </div>
                </div>
              </Link>

              {/* Action Buttons (Absolute at bottom for clean click area) */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-3 pt-6 border-t border-[#FAF7F4]">
                <button 
                  onClick={() => handleToggle(cat.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    cat.is_active ? 'border-[#E8E2D9] text-[#6B6058] hover:bg-[#FAF7F4]' : 'bg-[#783A3A] text-white border-[#783A3A]'
                  }`}
                >
                  {cat.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                  {cat.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="w-10 h-10 flex items-center justify-center border border-[#E8E2D9] text-[#6B6058] hover:bg-[#FAF7F4] transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="w-10 h-10 flex items-center justify-center border border-[#E8E2D9] text-[#DC2626] hover:bg-red-50 hover:border-red-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1C1410]/60 z-50 overflow-y-auto flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white max-w-2xl w-full p-12 shadow-2xl relative animate-slideUp">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[#1C1410] opacity-40 hover:opacity-100 transition">
              <X size={24} />
            </button>

            <h2 className="font-heading font-bold text-[24px] text-[#1C1410] uppercase tracking-widest mb-10 border-b border-[#FAF7F4] pb-6">
              {editingCat ? 'Manifest Update' : 'New Classification'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Classification Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => handleNameChange(e.target.value)}
                    required
                    placeholder="e.g. Living Room"
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none focus:border-[#783A3A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">System Slug (Auto)</label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    required
                    className="w-full border border-[#D4CCC2] bg-[#FAF7F4] rounded-0 px-5 py-4 text-[13px] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Narrative Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none focus:border-[#783A3A]"
                />
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Visual Asset Exhibit</label>
                {formData.image_url ? (
                  <div className="relative h-48 border border-[#E8E2D9] rounded-0 overflow-hidden group bg-[#FAF7F4]">
                    <Image src={formData.image_url} alt="preview" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image_url: ''})}
                      className="absolute top-4 right-4 bg-white/90 text-[#DC2626] w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className={`cursor-pointer border-2 border-dashed border-[#D4CCC2] rounded-0 h-48 flex flex-col items-center justify-center hover:border-[#783A3A] transition group relative ${isUploading ? 'opacity-50' : ''}`}>
                    <Upload size={32} className="text-[#6B6058] opacity-20 group-hover:opacity-40 transition-opacity mb-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#1C1410]">
                      {isUploading ? 'Synchronizing Asset...' : 'Upload Visual Exhibit'}
                    </span>
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                )}
              </div>

              <div className="flex gap-8">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Hierarchy Placement</label>
                  <select 
                    value={formData.parent_id} 
                    onChange={e => setFormData({...formData, parent_id: e.target.value})}
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none focus:border-[#783A3A] bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Top Level (Main Category)</option>
                    {categories
                      .filter(c => c.id !== editingCat?.id && !c.parent_id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Sort Sequence</label>
                  <input 
                    type="number" 
                    value={formData.sort_order} 
                    onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 accent-[#783A3A]"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#1C1410] group-hover:opacity-100 transition-opacity">Protocol Active</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1C1410] text-white py-6 rounded-[3px] font-bold uppercase tracking-[4px] text-[13px] hover:bg-[#33221b] transition-all shadow-xl active:scale-95"
              >
                {editingCat ? 'Execute Update' : 'Initialize Classification'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
