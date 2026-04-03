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
      showToast(is_approved ? 'Review approved!' : 'Review hidden', 'success')
    } catch (err) {
      showToast('Action failed', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return
    
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    try {
      const res = await fetch(`${backendUrl}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': adminToken || '' }
      })

      if (!res.ok) throw new Error('Delete failed')
      
      setReviews(reviews.filter(r => r.id !== id))
      showToast('Review deleted permanently', 'success')
    } catch (err) {
      showToast('Delete failed', 'error')
    }
  }

  return (
    <div className="p-8 font-body">
      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp text-white font-medium ${
          toast.type === 'success' ? 'bg-[#1A1A2E]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-10">
        
        <p className="text-[#6B7280] text-sm mt-1">
          {reviews.filter(r => !r.is_approved).length} pending moderation • {reviews.length} total
        </p>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border p-6 rounded-2xl shadow-sm">
          <p className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mb-1">Total</p>
          <p className="text-3xl font-black text-[#1A1A2E]">{reviews.length}</p>
        </div>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] p-6 rounded-2xl shadow-sm">
          <p className="text-[#92400E] text-xs font-bold uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-black text-[#D97706]">{reviews.filter(r => !r.is_approved).length}</p>
        </div>
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-6 rounded-2xl shadow-sm">
          <p className="text-[#166534] text-xs font-bold uppercase tracking-widest mb-1">Approved</p>
          <p className="text-3xl font-black text-[#4CAF7D]">{reviews.filter(r => r.is_approved).length}</p>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-white border rounded-2xl animate-pulse"></div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white border rounded-2xl p-20 text-center text-[#6B7280]">
            <span className="text-5xl block mb-4">⭐</span>
            No reviews submitted yet.
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 transition-all ${!review.is_approved ? 'border-l-4 border-l-[#D97706]' : 'border-l-4 border-l-[#4CAF7D]'}`}>
              
              {/* CONTENT */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {Array.from({length: 5}).map((_, i) => (
                      <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="bg-[#F7F5FF] text-[#6C3FC5] text-[10px] font-bold uppercase px-2 py-0.5 rounded-md font-mono">
                    Rating: {review.rating}/5
                  </span>
                </div>

                <p className="text-[#1A1A2E] text-lg font-heading font-medium mb-4 italic">
                  "{review.comment}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F7F5FF] flex items-center justify-center text-[#6C3FC5] font-bold border border-[#E5E0F5]">
                    {review.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A2E] text-sm uppercase tracking-tight">{review.name}</p>
                    <p className="text-[#6B7280] text-xs font-medium">Verified Customer • {new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 bg-[#F7F5FF] px-3 py-1.5 rounded-xl border border-[#E5E0F5]">
                    <span className="text-xs font-bold text-[#6B7280]">Product:</span>
                    <span className="text-xs font-black text-[#6C3FC5] uppercase font-mono max-w-[120px] truncate">{review.products?.name || 'Unknown Item'}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-row md:flex-col justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#E5E0F5] md:pl-6">
                {!review.is_approved ? (
                  <button 
                    onClick={() => handleUpdateStatus(review.id, true)}
                    className="flex-1 bg-[#4CAF7D] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#3d8b64] transition active:scale-95 shadow-lg shadow-[#4CAF7D]/20"
                  >
                    Approve
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(review.id, false)}
                    className="flex-1 border border-[#E5E0F5] text-[#6B7280] px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition active:scale-95"
                  >
                    Unapprove
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="bg-[#FEF2F2] text-[#DC2626] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#DC2626] hover:text-white transition active:scale-95"
                >
                  Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}
