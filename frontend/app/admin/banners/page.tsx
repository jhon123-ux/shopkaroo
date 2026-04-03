'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { bannerAPI } from '@/lib/api'
import { Banner } from '@/types'

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Modal Form State
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState<Partial<Banner>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBanners = async () => {
    try {
      const res = await bannerAPI.getAllAdmin()
      setBanners(res.data.data || [])
    } catch (error) {
      console.error('Failed fetching banners', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleToggle = async (id: string) => {
    try {
      await bannerAPI.toggle(id)
      fetchBanners()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to hard delete this banner?')) return
    try {
      await bannerAPI.delete(id)
      fetchBanners()
    } catch (e) {
      console.error(e)
    }
  }

  const openNewModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '', subtitle: '', badge_text: '', badge_color: '#6C3FC5',
      cta_primary_text: 'Shop Now', cta_primary_link: '/furniture/living-room',
      cta_secondary_text: 'WhatsApp Us', cta_secondary_link: 'https://wa.me/923001234567',
      bg_image_url: null, bg_overlay: 'rgba(26,26,46,0.55)',
      sort_order: banners.length + 1, is_active: true
    })
    setIsModalOpen(true)
  }

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({ ...banner })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title) return showToast('Title is required', 'error')
    setIsSaving(true)
    try {
      if (editingBanner) {
        await bannerAPI.update(editingBanner.id, formData)
        showToast('Banner updated successfully!')
      } else {
        await bannerAPI.create(formData)
        showToast('New banner created!')
      }
      setIsModalOpen(false)
      fetchBanners()
    } catch (e) {
      console.error(e)
      showToast('Error saving banner', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    const form = new FormData()
    form.append('image', file)

    setIsUploading(true)
    try {
      const res = await bannerAPI.uploadImage(form)
      setFormData(prev => ({ ...prev, bg_image_url: res.data.url }))
    } catch (error) {
      console.error('Upload failed', error)
      showToast('Upload failed. Did you create the Supabase public bucket "banners"?', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-8 relative font-body">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp text-white font-medium ${
          toast.type === 'success' ? 'bg-[#1A1A2E]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E0F5]">
        <div>
           
           <p className="text-[#6B7280] text-sm font-body mt-1 tracking-wide">Manage the interactive landing page carousel slider instances here.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-[#6C3FC5] text-white px-6 py-3 rounded-xl font-bold font-syne hover:bg-[#5530A8] transition-all shadow-md active:scale-95"
        >
          + Add New Banner
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 opacity-50"><span className="animate-pulse">Loading banners...</span></div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-xl p-4 border border-[#E5E0F5] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:border-[#6C3FC5] transition-colors">
              
              <div className="cursor-grab text-gray-400 opacity-50 hover:opacity-100 px-2 py-4 select-none">☰</div>
              
              <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner border border-gray-100" style={{ background: b.bg_image_url ? 'transparent' : b.bg_overlay }}>
                 {b.bg_image_url && <Image src={b.bg_image_url} alt="" fill className="object-cover" />}
                 {!b.bg_image_url && <span className="text-[10px] text-white font-mono opacity-80 backdrop-blur-sm">Gradient</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   <h3 className="font-bold text-[#1A1A2E] font-heading truncate text-lg max-w-[50%]">{b.title}</h3>
                   {b.badge_text && (
                     <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-current text-opacity-80 font-bold" style={{ backgroundColor: `${b.badge_color}10`, color: b.badge_color }}>
                       {b.badge_text.toUpperCase()}
                     </span>
                   )}
                </div>
                <div className="text-xs text-[#6B7280] truncate font-body">
                   <span className="bg-gray-100 px-2 py-1 rounded inline-block mr-2 text-gray-800 font-medium">Primary:</span>{b.cta_primary_text} {b.cta_primary_link ? `→ ${b.cta_primary_link}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-5 ml-auto border-l border-gray-100 pl-6 h-full shrink-0">
                <div className="flex flex-col items-center">
                   <span className="text-[10px] uppercase text-gray-400 mb-1 font-bold">Order</span>
                   <span className="font-mono text-lg font-bold text-primary-dark">{b.sort_order}</span>
                </div>
                
                <button 
                  onClick={() => handleToggle(b.id)} 
                  className={`w-12 h-6 rounded-full relative transition-colors ${b.is_active ? 'bg-[#6C3FC5]' : 'bg-gray-300'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${b.is_active ? 'translate-x-7' : 'translate-x-1'}`}></span>
                </button>

                <button onClick={() => openEditModal(b)} className="text-[#6C3FC5] p-2 hover:bg-[#F7F5FF] rounded-lg border border-transparent hover:border-[#E5E0F5]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                
                <button onClick={() => handleDelete(b.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

            </div>
          ))}
          {banners.length === 0 && <div className="text-center p-10 text-gray-500">No banners found. Seed the database or create a new one!</div>}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row gap-8">
            
            {/* Form Fields */}
            <div className="flex-1 space-y-5 border-r border-gray-100 pr-0 md:pr-8">
              <h2 className="text-2xl font-bold font-heading mb-6">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] font-medium placeholder-gray-400"
                  placeholder="Furnish Your Home With Style"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subtitle</label>
                <textarea 
                  rows={2}
                  value={formData.subtitle || ''} 
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] font-medium placeholder-gray-400"
                  placeholder="Premium quality furniture..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Badge Text</label>
                  <input 
                    type="text" 
                    value={formData.badge_text || ''} 
                    onChange={e => setFormData({...formData, badge_text: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] font-medium"
                    placeholder="New Arrivals"
                  />
                </div>
                <div className="w-24 shrink-0">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Color</label>
                  <div className="relative h-12 w-full border border-gray-300 rounded-xl overflow-hidden cursor-pointer shadow-sm">
                     <input 
                       type="color" 
                       value={formData.badge_color || '#6C3FC5'} 
                       onChange={e => setFormData({...formData, badge_color: e.target.value})}
                       className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                     />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-100 rounded-xl shadow-inner">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Background Image</label>
                   {formData.bg_image_url ? (
                     <div className="relative h-24 rounded-lg overflow-hidden border border-gray-300">
                       <Image src={formData.bg_image_url} alt="" fill className="object-cover" />
                       <button onClick={() => setFormData({...formData, bg_image_url: null})} className="absolute top-1 right-1 bg-white/80 p-1 rounded backdrop-blur-sm shadow hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                     </div>
                   ) : (
                     <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center text-center hover:bg-white hover:border-[#6C3FC5] transition-colors cursor-pointer group">
                       <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                       <span className="text-xs text-gray-500 group-hover:text-[#6C3FC5] font-medium">
                         {isUploading ? 'Uploading...' : 'Click to upload image'}
                       </span>
                     </div>
                   )}
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Background Overlay</label>
                   <input 
                     type="text" 
                     value={formData.bg_overlay || 'rgba(26,26,46,0.55)'} 
                     onChange={e => setFormData({...formData, bg_overlay: e.target.value})}
                     className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] font-mono text-sm shadow-sm"
                   />
                   <p className="text-[10px] text-gray-400 mt-2">Example: rgba(220,38,38,0.45)</p>
                 </div>
              </div>
              
              {/* CTAs */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Primary Text</label>
                    <input type="text" value={formData.cta_primary_text || ''} onChange={e => setFormData({...formData, cta_primary_text: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#6C3FC5] focus:outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Primary Link</label>
                    <input type="text" value={formData.cta_primary_link || ''} onChange={e => setFormData({...formData, cta_primary_link: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#6C3FC5] focus:outline-none font-mono" />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Secondary Text</label>
                    <input type="text" value={formData.cta_secondary_text || ''} onChange={e => setFormData({...formData, cta_secondary_text: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#6C3FC5] focus:outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Secondary Link</label>
                    <input type="text" value={formData.cta_secondary_link || ''} onChange={e => setFormData({...formData, cta_secondary_link: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#6C3FC5] focus:outline-none font-mono" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-8 border-t border-gray-100 pt-5">
                 <div className="flex items-center gap-3">
                   <label className="text-sm font-bold text-[#1A1A2E]">Sort Order</label>
                   <input type="number" min={1} value={formData.sort_order || 1} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-20 border border-gray-300 rounded-lg px-3 py-1 font-mono text-center appearance-none" />
                 </div>
                 
                 <label className="flex items-center gap-3 cursor-pointer">
                   <div className="text-sm font-bold text-[#1A1A2E]">Is Active</div>
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.is_active ? 'bg-[#6C3FC5]' : 'bg-gray-300'}`}>
                     <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="sr-only" />
                     <span className={`block w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${formData.is_active ? 'translate-x-[22px]' : 'translate-x-1'}`}></span>
                   </div>
                 </label>
              </div>

            </div>

            {/* Live Preview & Actions */}
            <div className="w-full md:w-[45%] flex flex-col justify-between pt-6 md:pt-0">
               <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Live Preview</h3>
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-center p-6 border border-gray-800" style={{ background: formData.bg_image_url ? 'transparent' : 'linear-gradient(135deg, #1A1A2E, #2D1B69)' }}>
                     {formData.bg_image_url && <Image src={formData.bg_image_url} alt="" fill className="object-cover" />}
                     <div className="absolute inset-0 z-0" style={{ background: formData.bg_overlay || 'rgba(0,0,0,0)' }}></div>
                     
                     <div className="relative z-10 w-full transform scale-[0.85] origin-left">
                        {formData.badge_text && (
                          <div className="inline-flex items-center gap-1.5 mb-3 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur" style={{ background: `${formData.badge_color}40` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: formData.badge_color }}></span>
                            <span className="font-mono text-[9px] tracking-widest uppercase text-white font-bold">{formData.badge_text}</span>
                          </div>
                        )}
                        <h2 className="font-heading font-extrabold text-2xl text-white leading-tight mb-2 drop-shadow-md">{formData.title || 'Banner Title'}</h2>
                        <p className="font-body text-white/90 text-[11px] leading-relaxed mb-4 max-w-sm drop-shadow">{formData.subtitle || 'Banner subtitle goes here...'}</p>
                        
                        <div className="flex gap-2">
                           {formData.cta_primary_text && (
                             <span className="bg-white text-[#1A1A2E] px-4 py-2 rounded-lg font-bold font-syne text-[10px] shadow-lg">{formData.cta_primary_text}</span>
                           )}
                           {formData.cta_secondary_text && (
                             <span className="border border-white/60 text-white px-4 py-2 rounded-lg font-bold font-body text-[10px] backdrop-blur-sm">{formData.cta_secondary_text}</span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="flex gap-4 mt-8 pt-4 justify-end">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition w-full md:w-auto">Cancel</button>
                 <button onClick={handleSave} disabled={isSaving || isUploading} className="px-8 py-3 rounded-xl bg-[#6C3FC5] text-white font-bold hover:bg-[#5530A8] transition shadow-lg disabled:opacity-50 w-full md:w-auto">
                   {isSaving ? 'Saving...' : 'Save Banner'}
                 </button>
               </div>
            </div>

          </div>
        </div>
      )}
      </div>
    </div>
  )
}
