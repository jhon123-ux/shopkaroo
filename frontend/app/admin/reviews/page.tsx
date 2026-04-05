'use client'

import { useState, useEffect } from 'react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchReviews = async () => {
    setLoading(true)
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const headers = { 'x-admin-auth': adminToken || '' }

    try {
      const res = await fetch(`${backendUrl}/api/reviews/admin`, { headers })
      const data = await res.json()
      setReviews(data.data || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load reviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpdateStatus = async (id: string, is_approved: boolean) => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    try {
      const res = await fetch(`${backendUrl}/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': adminToken || ''
        },
        body: JSON.stringify({ is_approved })
      })

      if (!res.ok) throw new Error('Update failed')
      
      const { data } = await res.json()
      setReviews(reviews.map(r => r.id === id ? data : r))
      showToast(is_approved ? 'Sentiment Approved' : 'Sentiment Restricted', 'success')
    } catch (err) {
      showToast('Synchronization Error', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Acknowledge: Final deletion of this sentiment record?')) return
    
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    try {
      const res = await fetch(`${backendUrl}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': adminToken || '' }
      })

      if (!res.ok) throw new Error('Delete failed')
      
      setReviews(reviews.filter(r => r.id !== id))
      showToast('Record purged from registry.', 'success')
    } catch (err) {
      showToast('Purge Protocol Failed', 'error')
    }
  }

  return (
    <div className="relative font-body text-left">
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
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40 mb-1">Sentiment Curation</p>
          <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">Customer Reviews</h2>
        </div>
        <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40 min-w-[200px] text-right">
          {reviews.filter(r => !r.is_approved).length} PENDING MODERATION
        </p>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        {[
          { label: 'Total Records', value: reviews.length, color: '#1C1410' },
          { label: 'Pending Audit', value: reviews.filter(r => !r.is_approved).length, color: '#4A2C6E' },
          { label: 'Market Visible', value: reviews.filter(r => r.is_approved).length, color: '#2D6A4F' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#E8E2D9] p-8 rounded-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[3px] mb-2 opacity-40">{stat.label}</p>
            <p className="text-[32px] font-bold font-heading leading-none" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-white border border-[#FAF7F4] animate-pulse" />
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-[#E8E2D9] p-24 text-center opacity-40 uppercase tracking-[4px] font-bold text-[12px]">
            No records located in sentiment registry.
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={`bg-white border border-[#E8E2D9] p-10 flex flex-col md:flex-row gap-10 transition-all shadow-sm ${!review.is_approved ? 'ring-1 ring-[#D4CCC2]' : ''}`}>
              
              {/* CONTENT */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <span key={i} className={`text-[18px] ${i < review.rating ? 'text-[#4A2C6E]' : 'text-[#D4CCC2]'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[2px] opacity-40">
                    SCORING: {review.rating}.0 / 5.0
                  </span>
                </div>

                <blockquote className="text-[#1C1410] text-[20px] font-heading font-medium mb-8 leading-relaxed italic pr-12">
                  "{review.comment}"
                </blockquote>

                <div className="flex items-center gap-4 pt-8 border-t border-[#FAF7F4]">
                  <div className="w-12 h-12 bg-[#FAF7F4] border border-[#E8E2D9] flex items-center justify-center text-[#1C1410] font-bold text-[15px] font-heading tracking-widest ring-1 ring-[#1C1410]/5">
                    {review.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-[#1C1410] text-[12px] uppercase tracking-[2px]">{review.name}</p>
                    <p className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[1px] opacity-40 mt-1">Verified Audit • {new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-4 bg-[#FAF7F4] px-6 py-3 border border-[#E8E2D9]">
                    <span className="text-[9px] font-bold text-[#6B6058] uppercase tracking-[2px] opacity-40">EXHIBIT:</span>
                    <span className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] max-w-[180px] truncate">{review.products?.name || 'Protocol Entry'}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-row md:flex-col justify-center gap-4 shrink-0 pt-8 md:pt-0 border-t md:border-t-0 md:border-l border-[#FAF7F4] md:pl-10">
                {!review.is_approved ? (
                  <button 
                    onClick={() => handleUpdateStatus(review.id, true)}
                    className="flex-1 bg-[#2D6A4F] text-white px-10 py-5 font-bold uppercase tracking-[3px] text-[11px] shadow-xl active:scale-95 transition-all"
                  >
                    Authorize
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(review.id, false)}
                    className="flex-1 border border-[#D4CCC2] text-[#6B6058] px-10 py-5 font-bold uppercase tracking-[3px] text-[11px] hover:bg-[#FAF7F4] shadow-sm transition-all"
                  >
                    Restrict
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="px-10 py-5 text-[#DC2626] font-bold uppercase tracking-[3px] text-[11px] hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                >
                  Purge
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}
