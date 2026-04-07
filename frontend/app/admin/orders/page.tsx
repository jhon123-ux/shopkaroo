'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  Eye, 
  Check, 
  Truck, 
  Trash2, 
  X, 
  MessageCircle, 
  CheckCircle, 
  ChevronDown,
  Search,
  Calendar,
  Package
} from 'lucide-react'

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

  const [error, setError] = useState('')

  const fetchOrders = async () => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const headers = { 
      'x-admin-auth': adminToken || '',
      'Content-Type': 'application/json'
    }

    setLoading(true)
    setError('')
    try {
      console.log('Synchronizing Request from Registry:', backendUrl)
      const res = await fetch(`${backendUrl}/api/orders?all=true`, { 
        method: 'GET',
        headers,
        cache: 'no-store'
      })
      
      console.log('Administrative Response Status:', res.status)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Connection Failed')
      
      console.log('Transaction Data Desynchronized:', data)
      setOrders(data.data || [])
    } catch (err: any) {
      console.error('Critical Fetch Error — Registry Sync Failed:', err)
      setError(err.message)
      showToast('Data Synchronization Interrupted', 'error')
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
      
      setSelectedOrder(data)
      setOrders(orders.map(o => o.id === data.id ? data : o))
      showToast(`SUCCESS: Order status updated. Notifications despatched.`, 'success')
      
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
      case 'pending': return 'bg-[#F5E8E8] text-[#783A3A] border-[rgba(120,58,58,0.1)]'
      case 'confirmed': return 'bg-[#F5E8E8] text-[#783A3A] border-[rgba(120,58,58,0.1)]'
      case 'shipped': return 'bg-[#F5E8E8] text-[#783A3A] border-[rgba(120,58,58,0.1)]'
      case 'delivered': return 'bg-[#EBF7F0] text-[#2D6A4F] border-[rgba(45,106,79,0.1)]'
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-400 border-gray-100'
    }
  }

  // Generate WhatsApp routing parameter securely
  const wpText = selectedOrder ? encodeURIComponent(`Greetings ${selectedOrder.customer_name}, this is regarding your Shopkarro order ${selectedOrder.order_number}...`) : ''

  return (
    <div className="relative font-body">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 rounded-0 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}</span>
          {toast.message}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40 mb-1">Vault Registry</p>
          <h2 className="text-[28px] font-bold font-heading text-[#1C1410] leading-none uppercase tracking-widest">Transactions</h2>
        </div>
        <button className="border border-[#E8E2D9] bg-white text-[#1C1410] px-6 py-3 rounded-[2px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-[#FAF7F4] transition-all shadow-sm active:scale-95">
          <Download size={14} strokeWidth={2.5} />
          Master Export
        </button>
      </div>

      {/* TOP AGGREGATE STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border border-[#E8E2D9] rounded-0 p-8 shadow-sm group">
          <p className="text-[#6B6058] font-bold text-[10px] uppercase tracking-[2px] mb-2 opacity-40 group-hover:opacity-60 transition-opacity">Total Volume</p>
          <p className="font-heading font-bold text-[36px] text-[#1C1410] leading-none">{orders.length}</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-0 p-8 shadow-sm group">
          <p className="text-[#6B6058] font-bold text-[10px] uppercase tracking-[2px] mb-2 opacity-40 group-hover:opacity-60 transition-opacity">Awaiting Action</p>
          <p className="font-heading font-bold text-[36px] text-[orange] leading-none">{orders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-0 p-8 shadow-sm group">
          <p className="text-[#6B6058] font-bold text-[10px] uppercase tracking-[2px] mb-2 opacity-40 group-hover:opacity-60 transition-opacity">In Transit</p>
          <p className="font-heading font-bold text-[36px] text-[#783A3A] leading-none">{orders.filter(o => o.status === 'shipped').length}</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-0 p-8 shadow-sm group">
          <p className="text-[#6B6058] font-bold text-[10px] uppercase tracking-[2px] mb-2 opacity-40 group-hover:opacity-60 transition-opacity">Fulfilled</p>
          <p className="font-heading font-bold text-[36px] text-[#2D6A4F] leading-none">{orders.filter(o => o.status === 'delivered').length}</p>
        </div>
      </div>

      {/* DYNAMIC FILTER ROW */}
      <div className="flex gap-4 mb-10 flex-wrap">
        <div className="flex-1 min-w-[280px] relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search identifier or customer signature..."
            className="w-full border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[13px] focus:border-[#783A3A] outline-none shadow-sm font-body"
          />
        </div>
        <div className="relative min-w-[160px]">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[11px] font-bold uppercase tracking-[2px] appearance-none pr-10 cursor-pointer focus:border-[#783A3A] outline-none shadow-sm"
          >
            <option value="all">Pipeline Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronDown size={14} strokeWidth={2.5} />
          </div>
        </div>
        <div className="relative min-w-[160px]">
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[11px] font-bold uppercase tracking-[2px] appearance-none pr-10 cursor-pointer focus:border-[#783A3A] outline-none shadow-sm"
          >
            <option value="all">Territory</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Faisalabad">Faisalabad</option>
            <option value="Other">Other Territories</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronDown size={14} strokeWidth={2.5} />
          </div>
        </div>
        <div className="relative min-w-[160px]">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-[#D4CCC2] bg-white rounded-[2px] px-5 py-4 text-[11px] font-bold uppercase tracking-[2px] appearance-none pr-10 cursor-pointer focus:border-[#783A3A] outline-none shadow-sm"
          >
            <option value="all">Temporal Filter</option>
            <option value="today">Today</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronDown size={14} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* CORE DATA TABLE */}
      <div className="bg-white rounded-0 border border-[#E8E2D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F4] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Identifier</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Customer</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Geo</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Inventory</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Valuation</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Pipeline</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Chronology</th>
                <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Command</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[#FAF7F4] animate-pulse">
                    <td className="px-8 py-8"><div className="w-20 h-4 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-32 h-4 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-20 h-4 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-16 h-4 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-20 h-4 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-20 h-6 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-24 h-4 bg-gray-100 rounded-[2px]" /></td>
                    <td className="px-8 py-8"><div className="w-16 h-8 bg-gray-100 rounded-[2px]" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="text-4xl mb-6 opacity-10 flex justify-center">
                      <Package size={48} strokeWidth={1} />
                    </div>
                    <h3 className="font-heading font-bold text-[20px] text-[#1C1410] uppercase tracking-widest leading-none">Registry Empty</h3>
                    <p className="text-[#6B6058] mt-4 text-[13px] opacity-60">No transactions match your current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-[#FAF7F4] last:border-0 hover:bg-[#FAF7F4]/50 transition-colors">
                    <td className="px-8 py-6 font-mono font-bold text-[#783A3A] text-[13px] tracking-widest">{o.order_number}</td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-[#1C1410] text-[14px]">{o.customer_name}</p>
                      <p className="text-[11px] text-[#6B6058] font-bold opacity-40 mt-1 uppercase tracking-wider">{o.phone}</p>
                    </td>
                    <td className="px-8 py-6 text-[12px] font-bold text-[#1C1410] uppercase tracking-widest">{o.city}</td>
                    <td className="px-8 py-6">
                      <p className="text-[14px] font-bold text-[#6B6058]">{o.items?.length || 0} Units</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-[#783A3A] font-heading text-[16px]">{o.total_pkr?.toLocaleString()} PKR</td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] uppercase tracking-[2px] font-bold px-4 py-2 rounded-0 border ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] font-bold text-[#1C1410] uppercase tracking-widest">
                        {new Date(o.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-[#6B6058] mt-1 font-bold opacity-40 tracking-widest uppercase">
                        {new Date(o.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        className="bg-white border border-[#E8E2D9] text-[#1C1410] px-5 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1C1410] hover:text-white transition-all active:scale-95 shadow-sm flex items-center gap-2"
                      >
                        <Eye size={12} /> Details
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
        <div className="fixed inset-0 bg-[#1C1410]/60 z-50 overflow-y-auto flex items-start justify-center pt-12 pb-12 px-6 backdrop-blur-md">
          <div className="bg-white rounded-0 max-w-3xl w-full p-12 md:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative animate-slideUp">
            
            <div className="flex justify-between items-start mb-12">
              <div className="text-left">
                <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[3px] opacity-40 mb-2">Vault Manifest</p>
                <h2 className="font-heading font-bold text-[32px] text-[#1C1410] leading-none uppercase tracking-widest">{selectedOrder.order_number}</h2>
                <p className="text-[12px] text-[#6B6058] mt-4 opacity-80 font-bold uppercase tracking-widest">
                  Archived on {new Date(selectedOrder.created_at).toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-[10px] uppercase tracking-[2px] font-bold px-5 py-2.5 rounded-0 border ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <button onClick={() => setSelectedOrder(null)} className="text-[#1C1410] w-12 h-12 flex items-center justify-center hover:bg-[#FAF7F4] transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* STATUS MUTATION SUITE */}
            <div className="bg-[#FAF7F4] rounded-0 p-8 mb-10 border border-[#E8E2D9] text-left">
              <p className="text-[10px] font-bold tracking-[3px] text-[#783A3A] uppercase mb-6 opacity-60">Synchronize Protocol Status</p>
              <div className="flex gap-4 flex-wrap">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => updateOrderStatus(st)}
                    className={`px-6 py-3 rounded-0 text-[10px] font-bold uppercase tracking-[2px] transition-all border ${
                      selectedOrder.status === st 
                        ? 'bg-[#783A3A] text-white border-[#783A3A] shadow-lg scale-105'
                        : 'border-[#E8E2D9] bg-white text-[#6B6058] hover:border-[#1C1410] hover:text-[#1C1410]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOMER META INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 text-left">
              <div className="bg-[#FAF7F4] rounded-0 p-8 border border-[#E8E2D9]">
                <p className="text-[10px] tracking-[3px] text-[#6B6058] font-bold uppercase mb-4 opacity-40">Entity Signature</p>
                <p className="font-bold text-[#1C1410] text-[18px] leading-tight mb-2 font-heading tracking-widest uppercase">{selectedOrder.customer_name}</p>
                <p className="text-[13px] text-[#1C1410] font-bold opacity-60 tracking-[2px] mb-2">{selectedOrder.phone}</p>
                <p className="text-[12px] text-[#6B6058] font-bold opacity-40 underline underline-offset-4">{selectedOrder.customer_email || 'NO_IDENTIFIER'}</p>
              </div>
              <div className="bg-[#FAF7F4] rounded-0 p-8 border border-[#E8E2D9]">
                <p className="text-[10px] tracking-[3px] text-[#6B6058] font-bold uppercase mb-4 opacity-40">Dispatch Geo</p>
                <p className="font-bold text-[#1C1410] text-[14px] uppercase tracking-[2px] mb-3">{selectedOrder.city}</p>
                <p className="text-[13px] text-[#6B6058] leading-relaxed opacity-80">{selectedOrder.address}</p>
              </div>
            </div>

            {/* CORE RECEIPT ITEMS */}
            <div className="mb-12 text-left">
              <h3 className="font-heading font-bold text-[#1C1410] text-[18px] uppercase tracking-widest mb-8 border-b border-[#FAF7F4] pb-5">Manifest Contents</h3>
              <div className="space-y-6">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div>
                      <p className="text-[15px] font-bold text-[#1C1410] font-heading group-hover:text-[#783A3A] transition-colors">{item.name}</p>
                      <p className="text-[10px] text-[#6B6058] font-bold mt-2 uppercase tracking-[2px] opacity-40">Unit Count: {item.qty}</p>
                    </div>
                    <p className="font-bold text-[#783A3A] text-[15px]">{ (item.price_pkr * item.qty).toLocaleString() } PKR</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-12 bg-[#1C1410] p-8 rounded-0">
                <p className="font-bold text-white uppercase tracking-[4px] text-[11px] opacity-40">Cumulative Valuation</p>
                <p className="font-heading font-bold text-[28px] text-white leading-none">{selectedOrder.total_pkr?.toLocaleString()} <span className="text-[14px]">PKR</span></p>
              </div>
            </div>

            {/* ORDER NOTES */}
            {selectedOrder.notes && (
              <div className="bg-[#FFFBEB] rounded-0 p-8 border border-[#FDE68A] mb-12 text-left">
                <p className="text-[#92400E] text-[10px] font-bold tracking-[3px] uppercase mb-4 opacity-60">Field Intelligence</p>
                <p className="text-[14px] text-[#92400E] italic leading-relaxed pl-6 border-l-2 border-[#D97706]/20">{selectedOrder.notes}</p>
              </div>
            )}

            {/* OUTBOUND ACTION BUTTON */}
            <a 
              href={`https://wa.me/${selectedOrder.phone.replace(/^0/, '92')}?text=${wpText}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-[#1C1410] text-white py-6 rounded-0 font-bold uppercase tracking-[3px] text-[13px] flex items-center justify-center gap-4 hover:bg-[#33221b] transition-all shadow-xl active:scale-95"
            >
              <MessageCircle size={20} /> Initiate Customer Engagement
            </a>

          </div>
        </div>
      )}

    </div>
  )
}
