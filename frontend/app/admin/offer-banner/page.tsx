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
          // Format date for datetime-local input
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
      showToast('No banner ID found to update.', 'error')
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
          end_date: new Date(banner.end_date).toISOString() // Send back as full ISO
        })
      })

      if (!res.ok) throw new Error('Save failed')
      showToast('Offer banner updated successfully!')
    } catch (err) {
      showToast('Failed to save changes.', 'error')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#6C3FC5]/30 border-t-[#6C3FC5] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp text-white font-medium ${
          toast.type === 'success' ? 'bg-[#1A1A2E]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      {/* EDIT FORM */}
      <div className="bg-white rounded-2xl border border-[#E5E0F5] p-8 shadow-sm mb-10">
        <div className="grid grid-cols-1 gap-6">
          
          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Banner Title</label>
            <input 
              type="text" 
              value={banner.title}
              onChange={e => setBanner({...banner, title: e.target.value})}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none"
              placeholder="e.g. Up to 30% Off"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Subtitle</label>
            <textarea 
              rows={2}
              value={banner.subtitle}
              onChange={e => setBanner({...banner, subtitle: e.target.value})}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none resize-none"
              placeholder="On selected furniture..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Badge Text</label>
              <input 
                type="text" 
                value={banner.badge_text}
                onChange={e => setBanner({...banner, badge_text: e.target.value})}
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A2E] mb-2">CTA Button Text</label>
              <input 
                type="text" 
                value={banner.cta_text}
                onChange={e => setBanner({...banner, cta_text: e.target.value})}
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">CTA Link</label>
            <input 
              type="text" 
              value={banner.cta_link}
              onChange={e => setBanner({...banner, cta_link: e.target.value})}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Offer End Date & Time</label>
            <input 
              type="datetime-local" 
              value={banner.end_date}
              onChange={e => setBanner({...banner, end_date: e.target.value})}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none"
            />
            <div className="mt-3 bg-[#F7F5FF] rounded-xl px-4 py-2 border border-[#E5E0F5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#6C3FC5] font-mono">LIVE COUNTDOWN PREVIEW:</span>
              <div className="flex gap-2 font-black text-[#1A1A2E] text-xs font-mono uppercase tracking-tighter">
                {previewTimeLeft.days}d {previewTimeLeft.hours}h {previewTimeLeft.minutes}m {previewTimeLeft.seconds}s
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full relative transition-colors ${banner.is_active ? 'bg-[#6C3FC5]' : 'bg-[#D1D5DB]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${banner.is_active ? 'left-7' : 'left-1'}`}></div>
              </div>
              <input 
                type="checkbox" 
                checked={banner.is_active} 
                onChange={e => setBanner({...banner, is_active: e.target.checked})}
                className="hidden" 
              />
              <span className="text-sm font-bold text-[#1A1A2E]">Banner is active on homepage</span>
            </label>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#6C3FC5] text-white py-4 rounded-xl font-bold font-heading hover:bg-[#5530A8] transition-all disabled:opacity-70 mt-4 shadow-lg shadow-[#6C3FC5]/20 flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW AREA */}
      <div className="border-t border-[#E5E0F5] pt-10">
        <h3 className="font-heading font-black text-[#1A1A2E] text-lg mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#6C3FC5] rounded-full animate-ping"></span>
          Live Preview
        </h3>
        
        <div className="rounded-3xl overflow-hidden shadow-2xl relative group" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #6C3FC5 100%)' }}>
          <div className="p-8 md:p-10 text-center">
            <span className="inline-block bg-white/20 text-white text-[10px] px-3 py-1 rounded-full font-mono tracking-widest mb-3 font-bold border border-white/30 backdrop-blur-sm">
              {banner.badge_text || 'BADGE TEXT'}
            </span>
            <h4 className="text-3xl font-extrabold font-heading text-white mb-2">
              {banner.title || 'Offer Title'}
            </h4>
            <p className="text-white/80 text-sm font-body max-w-sm mx-auto mb-6">
              {banner.subtitle || 'Subtitle describes the terms of your limited time furniture offer.'}
            </p>
            <div className="bg-white text-[#6C3FC5] px-6 py-2.5 rounded-lg font-bold text-sm inline-block shadow-lg">
              {banner.cta_text || 'Shop Now'}
            </div>
            
            {/* Countdown Preview */}
            <div className="mt-8 flex justify-center gap-2">
              {[
                { l: 'Days', v: previewTimeLeft.days },
                { l: 'Hrs', v: previewTimeLeft.hours },
                { l: 'Min', v: previewTimeLeft.minutes },
                { l: 'Sec', v: previewTimeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 min-w-[50px]">
                  <div className="text-white font-black text-lg">{String(item.v).padStart(2, '0')}</div>
                  <div className="text-white/60 text-[9px] uppercase font-bold">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
