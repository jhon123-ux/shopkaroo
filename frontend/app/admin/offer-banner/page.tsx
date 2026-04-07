'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OfferBannerData {
  id: string
  title: string
  subtitle: string
  badge_text: string
  cta_text: string
  cta_link: string
  end_date: string
  is_active: boolean
}

export default function AdminOfferBannerPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [banner, setBanner] = useState<OfferBannerData>({
    id: '',
    title: 'Up to 30% Off',
    subtitle: 'On selected bedroom & living room furniture. This week only.',
    badge_text: 'LIMITED TIME OFFER',
    cta_text: 'Shop Now',
    cta_link: '/furniture/sale',
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: true
  })

  const [previewTimeLeft, setPreviewTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    fetch(`${backendUrl}/api/offer-banner`)
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          const formattedDate = new Date(data.data.end_date).toISOString().slice(0, 16)
          setBanner({ ...data.data, end_date: formattedDate })
        }
      })
      .catch(err => console.error('Fetch failed:', err))
      .finally(() => setLoading(false))
  }, [backendUrl])

  useEffect(() => {
    const calculatePreview = () => {
      const end = new Date(banner.end_date).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setPreviewTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setPreviewTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }

    calculatePreview()
    const timer = setInterval(calculatePreview, 1000)
    return () => clearInterval(timer)
  }, [banner.end_date])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!banner.id) {
      showToast('Identifier signature not located.', 'error')
      return
    }

    setSaving(true)
    try {
      const adminToken = localStorage.getItem('admin_token')
      const res = await fetch(`${backendUrl}/api/offer-banner/${banner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': adminToken || ''
        },
        body: JSON.stringify({
          ...banner,
          end_date: new Date(banner.end_date).toISOString()
        })
      })

      if (!res.ok) throw new Error('Save failed')
      showToast('Promotional manifest updated.')
    } catch (err) {
      showToast('Synchronization failed.', 'error')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 opacity-40 font-bold uppercase tracking-[4px] text-[12px]">
        <span className="animate-pulse">Retrieving promotional logs...</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 font-body">
      
      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 rounded-0 shadow-2xl flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="text-left mb-12">
        <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40 mb-1">Storefront Promotions</p>
        <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">Promotionals</h2>
      </div>

      {/* EDIT FORM */}
      <div className="bg-white rounded-0 border border-[#E8E2D9] p-12 shadow-sm mb-16 text-left">
        <div className="grid grid-cols-1 gap-10">
          
          <div>
            <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Announcement Designation</label>
            <input 
              type="text" 
              value={banner.title}
              onChange={e => setBanner({...banner, title: e.target.value})}
              className="w-full border border-[#D4CCC2] rounded-0 px-6 py-4 text-[14px] focus:border-[#1C1410] outline-none shadow-sm font-body"
              placeholder="e.g. Seasonal Clearance"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Exhibition Narrative</label>
            <textarea 
              rows={2}
              value={banner.subtitle}
              onChange={e => setBanner({...banner, subtitle: e.target.value})}
              className="w-full border border-[#D4CCC2] rounded-0 px-6 py-4 text-[14px] focus:border-[#1C1410] outline-none shadow-sm font-body h-24"
              placeholder="Descriptive details for the front-facing banner..."
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Inscription Badge</label>
              <input 
                type="text" 
                value={banner.badge_text}
                onChange={e => setBanner({...banner, badge_text: e.target.value})}
                className="w-full border border-[#D4CCC2] rounded-0 px-6 py-4 text-[12px] font-bold uppercase tracking-[3px] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Action Designation</label>
              <input 
                type="text" 
                value={banner.cta_text}
                onChange={e => setBanner({...banner, cta_text: e.target.value})}
                className="w-full border border-[#D4CCC2] rounded-0 px-6 py-4 text-[14px] font-bold uppercase tracking-[2px] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Target Protocol (Link)</label>
              <input 
                type="text" 
                value={banner.cta_link}
                onChange={e => setBanner({...banner, cta_link: e.target.value})}
                className="w-full border border-[#D4CCC2] rounded-0 px-6 py-4 text-[12px] font-mono opacity-60 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-4 opacity-40">Temporal Expiry (Date & Time)</label>
              <input 
                type="datetime-local" 
                value={banner.end_date}
                onChange={e => setBanner({...banner, end_date: e.target.value})}
                className="w-full border border-[#D4CCC2] rounded-0 px-6 py-4 text-[13px] font-bold uppercase tracking-[2px] outline-none"
              />
            </div>
          </div>

          <div className="bg-[#FAF7F4] p-8 border border-[#E8E2D9] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#783A3A] uppercase tracking-[3px] opacity-60 italic">Real-Time Synchronization Preview:</span>
              <div className="font-heading font-bold text-[#1C1410] text-[18px] uppercase tracking-widest">
                {previewTimeLeft.days}d {previewTimeLeft.hours}h {previewTimeLeft.minutes}m {previewTimeLeft.seconds}s
              </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#FAF7F4]">
            <div className="flex items-center gap-4"><button type="button" onClick={() => setBanner({...banner, is_active: !banner.is_active})} className={`w-12 h-6 rounded-full relative shadow-inner transition-all ${banner.is_active ? 'bg-[#2D6A4F]' : 'bg-[#E8E2D9]'}`}><div className={`w-4 h-4 bg-white shadow-md rounded-full absolute top-1 transition-all ${banner.is_active ? 'left-7' : 'left-1'}`} /></button><span className="text-[11px] font-bold uppercase tracking-[2px]">Market Visibility Active</span></div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1C1410] text-white px-12 py-5 font-bold uppercase tracking-[3px] text-[11px] shadow-2xl disabled:opacity-30 active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-4"
            >
              {saving ? 'SYNCHRONIZING...' : 'SYNCHRONIZE MANIFEST'}
            </button>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW AREA */}
      <div className="border-t border-[#FAF7F4] pt-16">
        <h3 className="font-heading font-bold text-[#1C1410] text-[18px] uppercase tracking-widest mb-10 opacity-40 text-left">Real-Time Visualization</h3>
        
        <div className="rounded-0 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)] relative group bg-[#1C1410]">
          <div className="p-16 md:p-20 text-center relative z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#783A3A]/60 to-[#1C1410]/95 z-0" />
            
            <div className="relative z-20">
              <span className="inline-block bg-white/10 text-white text-[10px] px-4 py-1.5 rounded-0 font-bold tracking-[3px] mb-8 border border-white/20 uppercase">
                {banner.badge_text || 'BADGE_INSCRIPTION'}
              </span>
              <h4 className="text-[42px] font-bold font-heading text-white mb-6 uppercase tracking-widest leading-none drop-shadow-2xl">
                {banner.title || 'Exhibition Title'}
              </h4>
              <p className="text-white/70 text-[15px] font-body max-w-sm mx-auto mb-12 italic leading-relaxed">
                {banner.subtitle || 'Promotional narrative details for front-facing exhibits.'}
              </p>
              <div className="bg-white text-[#1C1410] px-10 py-4 rounded-0 font-bold text-[12px] uppercase tracking-[3px] inline-block shadow-2xl active:scale-95 transition-all">
                {banner.cta_text || 'DISCOVER'}
              </div>
              
              {/* Countdown Preview */}
              <div className="mt-20 flex justify-center gap-6">
                {[
                  { l: 'Days', v: previewTimeLeft.days },
                  { l: 'Hrs', v: previewTimeLeft.hours },
                  { l: 'Min', v: previewTimeLeft.minutes },
                  { l: 'Sec', v: previewTimeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 px-6 py-4 rounded-0 border border-white/10 min-w-[80px]">
                    <div className="text-white font-heading font-bold text-[24px] mb-1">{String(item.v).padStart(2, '0')}</div>
                    <div className="text-white/30 text-[9px] uppercase font-bold tracking-[2px]">{item.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
