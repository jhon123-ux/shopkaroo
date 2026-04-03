'use client'

import { useState, useEffect } from 'react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal Data
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchOrders = async () => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const headers = { 'x-admin-auth': adminToken || '' }

    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/orders?all=true&limit=100`, { headers })
      const data = await res.json()
      setOrders(data.data || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const updateOrderStatus = async (status: string) => {
    if (!selectedOrder) return
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    try {
      const res = await fetch(`${backendUrl}/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': adminToken || ''
        },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      const { data } = await res.json()
      
      // Update states locally automatically avoiding hard resets
      setSelectedOrder(data)
      setOrders(orders.map(o => o.id === data.id ? data : o))
      showToast(`✅ Status updated — Customer notified via email & WhatsApp`, 'success')
      
    } catch (err) {
      showToast('Error updating status', 'error')
    }
  }

  // Filter Logic Math
  const filteredOrders = orders.filter(o => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const match = o.order_number?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q)
      if (!match) return false
    }

    // 2. Status Match
    if (statusFilter !== 'all' && o.status !== statusFilter) return false

    // 3. City Match
    if (cityFilter !== 'all') {
      if (cityFilter === 'Other') {
        const majorCities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad']
        if (majorCities.includes(o.city)) return false
      } else {
        if (o.city !== cityFilter) return false
      }
    }

    // 4. Date Match
    if (dateFilter !== 'all' && o.created_at) {
      const orderDate = new Date(o.created_at).getTime()
      const now = new Date().getTime()
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24)

      if (dateFilter === 'today' && diffDays > 1) return false
      if (dateFilter === 'week' && diffDays > 7) return false
      if (dateFilter === 'month' && diffDays > 30) return false
    }

    return true
  })

  // Dynamic CSS Generator for specific status pillars
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
      case 'confirmed': return 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
      case 'shipped': return 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]'
      case 'delivered': return 'bg-[#F0FDF4] text-[#4CAF7D] border border-[#BBF7D0]'
      case 'cancelled': return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Generate WhatsApp routing parameter securely
  const wpText = selectedOrder ? encodeURIComponent(`Hi ${selectedOrder.customer_name}! Regarding your Shopkaroo order ${selectedOrder.order_number}`) : ''

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

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          
          <p className="text-[#6B7280] text-sm mt-1">{filteredOrders.length} total orders</p>
        </div>
        <button className="border border-[#E5E0F5] bg-white text-[#6B7280] px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-[#F7F5FF] transition-colors shadow-sm">
          ↓ Export CSV
        </button>
      </div>

      {/* TOP AGGREGATE STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E5E0F5] rounded-2xl p-5 shadow-sm">
          <p className="font-heading font-extrabold text-3xl text-[#6C3FC5]">{orders.length}</p>
          <p className="text-[#6B7280] font-medium text-sm mt-0.5">Total Orders</p>
        </div>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="font-heading font-extrabold text-3xl text-[#D97706] relative z-10">{orders.filter(o => o.status === 'pending').length}</p>
          <p className="text-[#92400E] font-medium text-sm mt-0.5 relative z-10">Pending</p>
          <div className="absolute top-2 right-2 text-4xl opacity-10">⏳</div>
        </div>
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="font-heading font-extrabold text-3xl text-[#2563EB] relative z-10">{orders.filter(o => o.status === 'shipped').length}</p>
          <p className="text-[#1E40AF] font-medium text-sm mt-0.5 relative z-10">Shipped</p>
          <div className="absolute top-2 right-2 text-4xl opacity-10">🚚</div>
        </div>
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <p className="font-heading font-extrabold text-3xl text-[#4CAF7D] relative z-10">{orders.filter(o => o.status === 'delivered').length}</p>
          <p className="text-[#166534] font-medium text-sm mt-0.5 relative z-10">Delivered</p>
          <div className="absolute top-2 right-2 text-4xl opacity-10">✅</div>
        </div>
      </div>

      {/* DYNAMIC FILTER ROW */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order # or customer..."
          className="flex-1 min-w-[200px] border border-[#E5E0F5] bg-white rounded-xl px-4 py-3 text-sm focus:border-[#6C3FC5] focus:ring-1 focus:ring-[#6C3FC5] outline-none shadow-sm"
        />
        <div className="relative min-w-[140px]">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-[#E5E0F5] bg-white rounded-xl px-4 py-3 text-sm appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="relative min-w-[140px]">
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full border border-[#E5E0F5] bg-white rounded-xl px-4 py-3 text-sm appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none shadow-sm"
          >
            <option value="all">All Cities</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Faisalabad">Faisalabad</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="relative min-w-[140px]">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-[#E5E0F5] bg-white rounded-xl px-4 py-3 text-sm appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C3FC5] focus:border-transparent outline-none shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* CORE DATA TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5E0F5] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F5FF] border-b border-[#E5E0F5]">
              <tr>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Order #</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Customer</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">City</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Items</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Total</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Status</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Date</th>
                <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeletons
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[#E5E0F5] animate-pulse">
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-gray-200 rounded"></div><div className="w-20 h-3 bg-gray-100 rounded mt-2"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-6 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-8 bg-gray-200 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center">
                    <div className="text-6xl mb-4 text-[#6B7280]/20">🛒</div>
                    <h3 className="font-heading font-bold text-2xl text-[#1A1A2E]">No orders found</h3>
                    <p className="text-[#6B7280] mt-2 mb-6 text-sm">Adjust your filters or wait for new purchases to roll in.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-[#E5E0F5] last:border-0 hover:bg-[#F7F5FF] transition">
                    <td className="px-6 py-4 font-mono font-bold text-[#6C3FC5] text-sm">{o.order_number}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1A1A2E] text-sm">{o.customer_name}</p>
                      <p className="text-xs text-[#6B7280] font-medium mt-0.5">{o.phone}</p>
                      {o.customer_email && <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">{o.customer_email}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1A1A2E]">{o.city}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#6B7280]">{o.items?.length || 0} items</p>
                      <p className="text-xs text-[#9CA3AF] line-clamp-1 mt-0.5 font-medium">{o.items?.[0]?.name}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#6C3FC5] font-heading text-base">Rs. {o.total_pkr?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#6B7280]">
                        {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">
                        {new Date(o.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        className="bg-[#EDE6FA] text-[#6C3FC5] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#6C3FC5] hover:text-white transition active:scale-95"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-start justify-center pt-10 pb-10 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative animate-slideUp">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-heading font-black text-2xl text-[#6C3FC5]">{selectedOrder.order_number}</h2>
                <p className="text-sm text-[#6B7280] font-medium mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-full ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <button onClick={() => setSelectedOrder(null)} className="text-[#6B7280] hover:bg-[#F7F5FF] w-8 h-8 rounded-full flex items-center justify-center text-2xl font-light hover:text-[#1A1A2E] transition-colors">&times;</button>
              </div>
            </div>

            {/* STATUS MUTATION SUITE */}
            <div className="bg-[#F7F5FF] rounded-2xl p-5 mb-6 border border-[#E5E0F5]">
              <p className="font-mono text-[10px] font-bold tracking-widest text-[#6C3FC5] uppercase mb-4 opacity-80">Update Delivery Pipeline Status</p>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => updateOrderStatus(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                      selectedOrder.status === st 
                        ? 'bg-[#6C3FC5] text-white shadow-md'
                        : 'border border-[#E5E0F5] bg-white text-[#6B7280] hover:border-[#6C3FC5] hover:text-[#6C3FC5]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOMER META INFO */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F7F5FF] rounded-2xl p-5 border border-[#E5E0F5]">
                <p className="font-mono text-[10px] tracking-widest text-[#6B7280] font-bold uppercase mb-2">Customer Entity</p>
                <p className="font-bold text-[#1A1A2E] text-lg leading-tight mb-1">{selectedOrder.customer_name}</p>
                <p className="text-sm text-[#6B7280] font-medium font-mono">{selectedOrder.phone}</p>
                <p className="text-[13px] text-[#6B7280] font-mono mt-1 w-full truncate">{selectedOrder.customer_email || 'No email provided'}</p>
              </div>
              <div className="bg-[#F7F5FF] rounded-2xl p-5 border border-[#E5E0F5]">
                <p className="font-mono text-[10px] tracking-widest text-[#6B7280] font-bold uppercase mb-2">Delivery Geo</p>
                <p className="font-bold text-[#1A1A2E] text-base leading-snug mb-1">{selectedOrder.city}</p>
                <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3">{selectedOrder.address}</p>
              </div>
            </div>

            {/* CORE RECEIPT ITEMS */}
            <div className="mb-8">
              <h3 className="font-heading font-extrabold text-[#1A1A2E] text-lg mb-4 border-b border-[#E5E0F5] pb-3">Line Items Packed</h3>
              <div className="flex flex-col gap-3">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-[#E5E0F5] last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E]">{item.name}</p>
                      <p className="text-xs text-[#6B7280] font-medium mt-1 uppercase tracking-wider bg-[#EDE6FA] inline-block px-2 py-0.5 rounded-md text-[#6C3FC5]">QTY: {item.qty}</p>
                    </div>
                    <p className="font-bold text-[#6C3FC5] font-heading text-base">Rs. {(item.price_pkr * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-5 border-t-2 border-[#E5E0F5] px-2 bg-[#F7F5FF] rounded-xl p-4">
                <p className="font-heading font-bold text-[#1A1A2E] text-lg">Subtotal Revenue</p>
                <p className="font-heading font-black text-2xl text-[#6C3FC5]">Rs. {selectedOrder.total_pkr?.toLocaleString()}</p>
              </div>
            </div>

            {/* ORDER NOTES */}
            {selectedOrder.notes && (
              <div className="bg-[#FFFBEB] rounded-2xl p-5 border border-[#FDE68A] mb-8 shadow-sm">
                <p className="font-bold text-[#92400E] text-sm mb-1.5 flex items-center gap-2 tracking-wide uppercase">
                  <span className="text-lg">📝</span> Delivery Notes Bound
                </p>
                <p className="text-sm text-[#92400E]/90 leading-relaxed font-medium pl-6">{selectedOrder.notes}</p>
              </div>
            )}

            {/* OUTBOUND ACTION BUTTON */}
            <a 
              href={`https://wa.me/${selectedOrder.phone.replace(/^0/, '92')}?text=${wpText}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-[#4CAF7D] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 text-lg hover:bg-[#388E3C] transition-all shadow-md active:scale-95"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Contact Customer on WhatsApp
            </a>

          </div>
        </div>
      )}

    </div>
  )
}
