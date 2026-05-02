'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  ChevronLeft,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function SubcategoryManagementPage() {
  const params = useParams()
  const router = useRouter()
  const parentId = params?.id as string

  const [categories, setCategories] = useState<any[]>([])
  const [parentCategory, setParentCategory] = useState<any | null>(null)
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
    parent_id: parentId
  })

  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchData = async () => {
    setLoading(true)
    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch(`${apiUrl}/api/categories?all=true`, {
        headers: { 'x-admin-auth': adminToken || '' }
      })
      const data = await res.json()
      const allCats = data.data || []
      
      setCategories(allCats)
      
      const foundParent = allCats.find((c: any) => c.id === parentId)
      setParentCategory(foundParent)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (parentId) fetchData()
  }, [parentId])

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
        parent_id: cat.parent_id || parentId
      })
    } else {
      setEditingCat(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        sort_order: categories.filter(c => c.parent_id === parentId).length + 1,
        is_active: true,
        parent_id: parentId
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
      const res = await fetch(`${apiUrl}/api/upload/category`, {
        method: 'POST',
        headers: { 'x-admin-auth': adminToken || '' },
        body: fData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      if (data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }))
        showToast('Image uploaded successfully')
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const method = editingCat ? 'PATCH' : 'POST'
    const url = editingCat ? `${apiUrl}/api/categories/${editingCat.id}` : `${apiUrl}/api/categories`

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
      if (!res.ok) throw new Error(data.error || 'Failed to save category')
      
      showToast(`Subcategory ${editingCat ? 'updated' : 'created'} successfully`)
      setShowModal(false)
      fetchData()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to expunge this subcategory?')) return
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''

    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': adminToken || '' }
      })
      if (res.ok) {
        showToast('Subcategory expunged')
        fetchData()
      }
    } catch (err) {
      showToast('Deletion failed', 'error')
    }
  }

  const handleToggle = async (id: string) => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'x-admin-auth': adminToken || '' }
      })
      if (res.ok) fetchData()
    } catch (err) {
      showToast('Toggle failed', 'error')
    }
  }

  const subCategories = categories.filter(cat => cat.parent_id === parentId)

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
      <div className="flex flex-col mb-12">
        <Link 
          href="/admin/categories" 
          className="flex items-center gap-2 text-[#6B6058] hover:text-[#783A3A] text-[11px] font-bold uppercase tracking-[2px] mb-6 transition-colors group w-max"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Classifications
        </Link>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[#783A3A] text-[11px] font-bold uppercase tracking-[3px] mb-1 font-body">
              {parentCategory?.name || 'Loading...'} <span className="mx-2 opacity-30">/</span> Subcategories
            </p>
            <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">
              Manage Sub-classifications
            </h2>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#783A3A] text-white px-6 py-3 rounded-[3px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-[#5B2C2C] transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Subcategory
          </button>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-[300px] bg-white border border-[#E8E2D9] animate-pulse" />
          ))}
        </div>
      ) : subCategories.length === 0 ? (
        <div className="bg-white border border-[#E8E2D9] p-24 text-center">
          <FolderOpen size={48} className="mx-auto mb-6 text-[#1C1410] opacity-10" />
          <h3 className="font-heading font-bold text-[20px] text-[#1C1410] uppercase tracking-widest">No Subcategories Found</h3>
          <p className="text-[#6B6058] mt-4 opacity-60">Begin by adding the first sub-classification for {parentCategory?.name}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subCategories.map((cat) => (
            <div key={cat.id} className="bg-white border border-[#E8E2D9] rounded-0 overflow-hidden shadow-sm group hover:border-[#783A3A] transition-colors relative">
              <div className="h-40 relative flex items-center justify-center overflow-hidden bg-[#FAF7F4]">
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <FolderOpen size={48} className="text-[#1C1410] opacity-10" />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                   <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] border ${
                     cat.is_active ? 'bg-[#EBF7F0] text-[#2D6A4F] border-[rgba(45,106,79,0.1)]' : 'bg-gray-100 text-gray-400 border-gray-200'
                   }`}>
                     {cat.is_active ? 'Active' : 'Inactive'}
                   </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading font-bold text-[18px] text-[#1C1410] uppercase tracking-widest">{cat.name}</h3>
                  <span className="bg-[#FAF7F4] text-[#1C1410] px-2 py-1 text-[10px] font-mono font-bold opacity-40">ORDER: {cat.sort_order}</span>
                </div>
                <p className="text-[11px] text-[#6B6058] font-mono tracking-wider opacity-60 mb-6">slug/{cat.slug}</p>
                
                <div className="flex gap-3 pt-6 border-t border-[#FAF7F4]">
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
              {editingCat ? 'Update Subcategory' : `New Sub-category for ${parentCategory?.name}`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Classification Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => handleNameChange(e.target.value)}
                    required
                    placeholder="e.g. Office Chairs"
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none focus:border-[#783A3A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">System Slug (Auto)</label>
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
                <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Narrative Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none focus:border-[#783A3A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Visual Asset Exhibit</label>
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
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#1C1410] opacity-40">
                      {isUploading ? 'Synchronizing Asset...' : 'Upload Visual Exhibit'}
                    </span>
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                )}
              </div>

              <div className="flex gap-8">
                <div className="flex-1 opacity-50 cursor-not-allowed">
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Parent Category</label>
                  <input 
                    type="text" 
                    value={parentCategory?.name || ''} 
                    disabled
                    className="w-full border border-[#D4CCC2] bg-[#FAF7F4] rounded-0 px-5 py-4 text-[13px] outline-none font-bold text-[#783A3A]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Sort Sequence</label>
                  <input 
                    type="number" 
                    value={formData.sort_order} 
                    onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none focus:border-[#783A3A]"
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
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#1C1410] opacity-60 group-hover:opacity-100 transition-opacity">Protocol Active</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1C1410] text-white py-6 rounded-[3px] font-bold uppercase tracking-[4px] text-[13px] hover:bg-[#33221b] transition-all shadow-xl active:scale-95"
              >
                {editingCat ? 'Update Subcategory' : 'Initialize Subcategory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
