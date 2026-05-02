'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Trash2, 
  Star, 
  MessageSquare, 
  Package, 
  User, 
  Clock,
  Filter,
  Search,
  XCircle
} from 'lucide-react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchReviews = async () => {
    setLoading(true)
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
    const headers = { 'Authorization': `Bearer ${adminToken}` }

    try {
      const res = await fetch(`${apiUrl}/api/reviews/admin`, { headers })
      const data = await res.json()
      setReviews(data.data || [])
    } catch (err) {
      console.error(err)
      showToast('Sync Error', 'error')
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

  const handleApprove = async (id: string) => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
    try {
      const res = await fetch(`${apiUrl}/api/reviews/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })

      if (!res.ok) throw new Error('Approval failed')
      
      const { data } = await res.json()
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r))
      showToast('Review Approved', 'success')
    } catch (err) {
      showToast('Error', 'error')
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this review?')) return
    
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''
    try {
      const res = await fetch(`${apiUrl}/api/reviews/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })

      if (!res.ok) throw new Error('Rejection failed')
      
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: false } : r))
      showToast('Review Rejected', 'success')
    } catch (err) {
      showToast('Error', 'error')
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return r.is_approved === null
    if (activeTab === 'approved') return r.is_approved === true
    if (activeTab === 'rejected') return r.is_approved === false
    return true
  })

  return (
    <div className="relative font-body text-left">
      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 rounded-0 shadow-2xl flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}</span>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-1">Review Management</p>
          <h2 className="text-[28px] font-bold font-heading text-text uppercase tracking-widest leading-none">Reviews</h2>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[#783A3A] text-[13px] font-bold uppercase tracking-[2px]">
            {reviews.filter(r => r.is_approved === null).length} Pending Audit
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-10 border-b border-[#E8E2D9] mb-12">
        {[
          { id: 'all', label: 'All Reviews' },
          { id: 'pending', label: 'Pending' },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[11px] font-bold uppercase tracking-[2.5px] transition-all relative ${
              activeTab === tab.id 
                ? 'text-[#783A3A]' 
                : 'text-[#6B6058] opacity-70 hover:opacity-100'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#783A3A] animate-slideUp" />
            )}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[#E8E2D9] rounded-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF7F4] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-8 py-5 font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px]">Product</th>
                <th className="px-8 py-5 font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px]">Customer</th>
                <th className="px-8 py-5 font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px]">Rating</th>
                <th className="px-8 py-5 font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px]">Review Content</th>
                <th className="px-8 py-5 font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px]">Status</th>
                <th className="px-8 py-5 font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F4]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8 h-16 bg-white" />
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <p className="text-[11px] font-bold text-[#6B6058] uppercase tracking-[4px] opacity-20">No matching review records</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map(review => (
                  <tr key={review.id} className="hover:bg-[#FAF7F4]/30 transition-colors">
                    <td className="px-8 py-6 max-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 skeleton bg-[#F2EDE6] rounded-0 flex-shrink-0 flex items-center justify-center opacity-40">
                          <Package size={14} />
                        </div>
                        <span className="font-bold text-[#1C1410] truncate text-[13px]">{review.products?.name || 'Unknown Item'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F5E8E8] text-[#783A3A] font-bold rounded-0 flex items-center justify-center text-[11px] font-heading">
                          {review.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1C1410] text-[13px]">{review.name}</span>
                          <span className="text-[10px] text-[#6B6058] font-bold uppercase tracking-wider">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-0.5">
                        {Array.from({length: 5}).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < review.rating ? "#783A3A" : "none"} 
                            className={i < review.rating ? "text-[#783A3A]" : "text-[#D4CCC2]"} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-[300px]">
                      <p className="text-[#6B6058] text-[13px] italic line-clamp-2 leading-relaxed">"{review.comment}"</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex px-3 py-1.5 rounded-0 border text-[9px] font-bold uppercase tracking-[2px] font-mono ${
                        review.is_approved === true ? 'bg-[#EBF7F0] text-[#2D6A4F] border-[rgba(45,106,79,0.1)]' :
                        review.is_approved === false ? 'bg-[#FEF2F2] text-[#991B1B] border-[rgba(153,27,27,0.1)]' :
                        'bg-[#FFFBEB] text-[#D97706] border-[rgba(217,119,6,0.1)]'
                      }`}>
                        {review.is_approved === true ? 'Approved' :
                         review.is_approved === false ? 'Rejected' :
                         'Pending'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        {review.is_approved !== true && (
                          <button 
                            onClick={() => handleApprove(review.id)}
                            className="w-9 h-9 bg-[#EBF7F0] text-[#2D6A4F] flex items-center justify-center rounded-[3px] border border-[rgba(45,106,79,0.1)] hover:bg-[#2D6A4F] hover:text-white transition-all active:scale-90"
                            title="Approve Review"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {review.is_approved !== false && (
                          <button 
                            onClick={() => handleReject(review.id)}
                            className="w-9 h-9 bg-[#FEF2F2] text-[#991B1B] flex items-center justify-center rounded-[3px] border border-[rgba(153,27,27,0.1)] hover:bg-[#991B1B] hover:text-white transition-all active:scale-90"
                            title="Reject Review"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
