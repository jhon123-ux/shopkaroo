'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, X, Menu, Camera } from 'lucide-react'
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
    if (!confirm('Acknowledge: Final deletion of this exhibition banner?')) return
    try {
      await bannerAPI.delete(id)
      fetchBanners()
      showToast('Banner purged from archives.')
    } catch (e) {
      console.error(e)
    }
  }

  const openNewModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '', subtitle: '', badge_text: '', badge_color: '#783A3A',
      cta_primary_text: 'Discover Collection', cta_primary_link: '/furniture/living-room',
      cta_secondary_text: 'Consultation', cta_secondary_link: 'https://wa.me/923706905835',
      bg_image_url: null, bg_overlay: 'rgba(28,20,16,0.4)',
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
    if (!formData.title) return showToast('Designation title required', 'error')
    setIsSaving(true)
    try {
      if (editingBanner) {
        await bannerAPI.update(editingBanner.id, formData)
        showToast('Banner manifest updated.')
      } else {
        await bannerAPI.create(formData)
        showToast('New exhibit banner created.')
      }
      setIsModalOpen(false)
      fetchBanners()
    } catch (e) {
      console.error(e)
      showToast('Error synchronizing manifest.', 'error')
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
    } catch (error: any) {
      console.error('Upload failed', error)
      const msg = error.response?.data?.details || error.response?.data?.error || 'Asset upload failed.'
      showToast(msg, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative font-body">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 rounded-0 shadow-2xl flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}</span>
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-1">Curation Management</p>
            <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">Exhibition Banners</h2>
          </div>
          <button 
            onClick={openNewModal}
            className="bg-[#1C1410] text-white px-8 py-4 rounded-0 font-bold uppercase tracking-[3px] text-[12px] hover:bg-[#33221b] transition-all shadow-xl active:scale-95"
          >
            + New Exhibit
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-24 opacity-40 font-bold uppercase tracking-[4px] text-[12px]">
            <span className="animate-pulse">Accessing archives...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {banners.map(b => (
              <div key={b.id} className="bg-white rounded-0 p-6 border border-[#E8E2D9] shadow-sm flex items-center gap-8 group hover:border-[#783A3A] transition-all">
                
                <div className="cursor-grab text-[#1C1410] opacity-10 hover:opacity-30 px-2 py-4 select-none"><Menu className="w-5 h-5" /></div>
                
                <div className="w-32 h-20 rounded-0 overflow-hidden shrink-0 relative flex items-center justify-center bg-[#FAF7F4] border border-[#E8E2D9]">
                   {b.bg_image_url && (
                     <Image 
                       src={b.bg_image_url} 
                       alt="" 
                       fill 
                       loading="lazy"
                       sizes="128px"
                       className="object-cover" 
                     />
                   )}
                   {!b.bg_image_url && <span className="text-[9px] font-bold text-[#1C1410] opacity-40 uppercase tracking-widest">Protocol BG</span>}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-4 mb-2">
                     <h3 className="font-bold text-[#1C1410] font-heading truncate text-[18px] uppercase tracking-widest">{b.title}</h3>
                     {b.badge_text && (
                       <span className="text-[9px] font-bold px-3 py-1 bg-[#F5E8E8] text-[#783A3A] border border-[rgba(120,58,58,0.1)] uppercase tracking-[2px]">
                         {b.badge_text}
                       </span>
                     )}
                  </div>
                  <div className="text-[11px] text-[#6B6058] truncate font-bold opacity-60 uppercase tracking-widest">
                     <span className="text-[#1C1410] mr-2">Link:</span>{b.cta_primary_link || 'Standard Entry'}
                  </div>
                </div>

                <div className="flex items-center gap-8 ml-auto border-l border-[#FAF7F4] pl-8 h-full shrink-0">
                  <div className="flex flex-col items-center">
                     <span className="text-[9px] uppercase text-[#6B6058] mb-1 font-bold tracking-widest">Index</span>
                     <span className="font-heading text-[20px] font-bold text-[#1C1410]">{b.sort_order}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleToggle(b.id)} 
                    className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${b.is_active ? 'bg-[#2D6A4F]' : 'bg-[#E8E2D9]'}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-all ${b.is_active ? 'left-6' : 'left-1'}`}></span>
                  </button>

                  <button onClick={() => openEditModal(b)} className="text-[#1C1410] p-2 hover:bg-[#FAF7F4] border border-transparent hover:border-[#E8E2D9] transition-all">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 p-2 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

              </div>
            ))}
            {banners.length === 0 && <div className="text-center py-24 opacity-40 uppercase tracking-[4px] font-bold text-[12px]">Registry contains no active banners.</div>}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#1C1410]/60 z-50 flex items-center justify-center p-6 backdrop-blur-md text-left">
            <div className="bg-white rounded-0 p-12 md:p-16 max-w-6xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-[0_30px_100px_rgba(0,0,0,0.2)] flex flex-col md:flex-row gap-16 animate-slideUp">
              
              {/* Form Fields */}
                <div className="flex-1 space-y-8 border-r border-[#FAF7F4] pr-0 md:pr-16">
                <div className="mb-12">
                   <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[3px] mb-2">Protocol Entry</p>
                   <h2 className="text-[32px] font-bold font-heading text-[#1C1410] uppercase tracking-widest">{editingBanner ? 'Modify Exhibit' : 'New Exhibit'}</h2>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Primary Designation *</label>
                  <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[14px] focus:border-[#1C1410] outline-none shadow-sm font-body"
                    placeholder="Classic Furnishings"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Descriptive Narrative</label>
                  <textarea 
                    rows={3}
                    value={formData.subtitle || ''} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] focus:border-[#1C1410] outline-none shadow-sm font-body h-24"
                    placeholder="Exquisite craftsmanship for modern living..."
                  />
                </div>

                <div className="flex gap-8">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Badge Inscription</label>
                    <input 
                      type="text" 
                      value={formData.badge_text || ''} 
                      onChange={e => setFormData({...formData, badge_text: e.target.value})}
                      className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[13px] outline-none font-body"
                      placeholder="Limited Edition"
                    />
                  </div>
                  <div className="w-24 shrink-0">
                    <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3">Tone</label>
                    <div className="relative h-12 w-full border border-[#D4CCC2] rounded-0 overflow-hidden cursor-pointer shadow-sm">
                       <input 
                         type="color" 
                         value={formData.badge_color || '#783A3A'} 
                         onChange={e => setFormData({...formData, badge_color: e.target.value})}
                         className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                       />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 bg-[#FAF7F4] p-8 border border-[#E8E2D9] rounded-0">
                   <div>
                     <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Master Asset</label>
                     {formData.bg_image_url ? (
                       <div className="relative h-24 rounded-0 overflow-hidden border border-[#D4CCC2] shadow-inner group">
                         <Image 
                           src={formData.bg_image_url} 
                           alt="" 
                           fill 
                           loading="lazy"
                           sizes="200px"
                           className="object-cover" 
                         />
                         <button onClick={() => setFormData({...formData, bg_image_url: null})} className="absolute top-1 right-1 bg-white/90 p-1 rounded-0 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow text-red-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                       </div>
                     ) : (
                       <div className="relative border-2 border-dashed border-[#D4CCC2] rounded-0 p-6 flex flex-col items-center justify-center text-center hover:bg-white hover:border-[#1C1410] transition-all cursor-pointer group h-24">
                         <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                         <Camera className="w-8 h-8 opacity-20 mb-1 group-hover:opacity-100 transition" />
                         <span className="text-[9px] font-bold uppercase tracking-[2px] text-[#1C1410] opacity-40">
                           {isUploading ? 'SYNCING...' : 'UPLOAD'}
                         </span>
                       </div>
                     )}
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Atmospheric Filter</label>
                     <input 
                       type="text" 
                       value={formData.bg_overlay || 'rgba(28,20,16,0.4)'} 
                       onChange={e => setFormData({...formData, bg_overlay: e.target.value})}
                       className="w-full border border-[#D4CCC2] bg-white rounded-0 px-4 py-3 focus:outline-none font-mono text-[11px] uppercase tracking-widest shadow-sm"
                     />
                     <p className="text-[9px] text-[#6B6058] mt-3 font-bold opacity-40 italic">RGBA FORMAT REQUIRED</p>
                   </div>
                </div>
              </div>

              {/* Live Preview & Actions */}
              <div className="w-full md:w-[40%] flex flex-col justify-between pt-12 md:pt-0 text-left">
                 <div>
                    <h3 className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[4px] mb-8 opacity-40">Real-Time Visualization</h3>
                    <div className="relative w-full aspect-[4/5] rounded-0 overflow-hidden shadow-2xl flex flex-col justify-end p-12 border border-[#1C1410]/5" style={{ background: formData.bg_image_url ? 'transparent' : '#1C1410' }}>
                       {formData.bg_image_url && (
                         <Image 
                           src={formData.bg_image_url} 
                           alt="" 
                           fill 
                           loading="lazy"
                           sizes="400px"
                           className="object-cover" 
                         />
                       )}
                       <div className="absolute inset-0 z-0" style={{ background: formData.bg_overlay || 'rgba(0,0,0,0)' }}></div>
                       
                       <div className="relative z-10 w-full transform">
                          {formData.badge_text && (
                            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-0 border border-white/20 backdrop-blur-md" style={{ background: `${formData.badge_color}40` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: formData.badge_color }}></span>
                              <span className="font-bold text-[10px] tracking-[3px] uppercase text-white">{formData.badge_text}</span>
                            </div>
                          )}
                          <h2 className="font-heading font-bold text-[36px] text-white leading-tight mb-4 uppercase tracking-widest drop-shadow-2xl">{formData.title || 'BANNER_LABEL'}</h2>
                          <p className="font-body text-white/80 text-[13px] leading-relaxed mb-10 max-w-sm drop-shadow-lg italic">{formData.subtitle || 'Exhibit abstract...'}</p>
                          
                          <div className="flex gap-4">
                             {formData.cta_primary_text && (
                               <span className="bg-white text-[#1C1410] px-6 py-3 rounded-0 font-bold uppercase tracking-[2px] text-[10px] shadow-2xl">{formData.cta_primary_text}</span>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-6 mt-12">
                   <div className="flex gap-10 items-center justify-between py-6 border-t border-[#FAF7F4]">
                      <div className="flex items-center gap-4">
                        <label className="text-[11px] font-bold text-[#1C1410] uppercase tracking-[2px]">Index</label>
                        <input type="number" min={1} value={formData.sort_order || 1} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-20 border border-[#D4CCC2] px-4 py-2 font-mono text-center appearance-none text-[14px]" />
                      </div>
                      
                      <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`w-12 h-6 rounded-full relative shadow-inner transition-all ${formData.is_active ? 'bg-[#2D6A4F]' : 'bg-[#E8E2D9]'}`}>
                        <span className={`block w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-all ${formData.is_active ? 'left-7' : 'left-1'}`}></span>
                      </button>
                   </div>
                   
                   <div className="flex gap-6 pt-6 border-t border-[#FAF7F4]">
                     <button onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 text-[11px] font-bold uppercase tracking-[3px] opacity-40 hover:opacity-100 transition">Terminate</button>
                     <button onClick={handleSave} disabled={isSaving || isUploading} className="flex-[2] bg-[#1C1410] text-white px-10 py-5 font-bold uppercase tracking-[3px] text-[11px] shadow-2xl disabled:opacity-30 active:scale-95 transition-all">
                       {isSaving ? 'SYNCING...' : 'SYNCHRONIZE MANIFEST'}
                     </button>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
