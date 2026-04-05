'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pending: 0,
    banners: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
        const headers = { 'x-admin-auth': adminToken || '' }
        
        const [prodRes, orderRes, bannerRes] = await Promise.all([
          fetch(`${backendUrl}/api/products?all=true`, { headers }),
          fetch(`${backendUrl}/api/orders`, { headers }),
          fetch(`${backendUrl}/api/banners?all=true`, { headers })
        ])

        const prodData = prodRes.ok ? await prodRes.json() : { count: 0 }
        const orderData = orderRes.ok ? await orderRes.json() : { data: [] }
        const bannerData = bannerRes.ok ? await bannerRes.json() : { data: [] }

        const pendingOrders = (orderData.data || []).filter((o: any) => o.status === 'pending').length
        const activeBanners = (bannerData.data || []).filter((b: any) => b.is_active).length

        setStats({
          products: prodData.count || (prodData.data || []).length || 0,
          orders: orderData.count !== undefined ? orderData.count : (orderData.data || []).length,
          pending: pendingOrders,
          banners: activeBanners
        })

        setRecentOrders((orderData.data || []).slice(0, 5))
      } catch (err) {
        console.error('Admin Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return (
    <div className="font-body">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">📦</div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-2 opacity-60">Total Inventory</p>
          <p className="font-heading font-bold text-[48px] text-[#1C1410] leading-none">
            {loading ? '—' : stats.products}
          </p>
        </div>

        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">🛒</div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-2 opacity-60">Revenue Cycles</p>
          <p className="font-heading font-bold text-[48px] text-[#4A2C6E] leading-none">
            {loading ? '—' : stats.orders}
          </p>
        </div>

        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">⏳</div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-2 opacity-60">Active Queue</p>
          <p className="font-heading font-bold text-[48px] text-[orange] leading-none">
            {loading ? '—' : stats.pending}
          </p>
        </div>

        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">🖼️</div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] mb-2 opacity-60">Active Exhibits</p>
          <p className="font-heading font-bold text-[48px] text-[#2D6A4F] leading-none">
            {loading ? '—' : stats.banners}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="font-heading font-bold text-[22px] text-[#1C1410] uppercase tracking-widest leading-none">Latest Transactions</h2>
        <div className="h-px bg-[#E8E2D9] flex-1 mx-8 opacity-40"></div>
      </div>

      <div className="bg-white rounded-0 border border-[#E8E2D9] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#E8E2D9]">
            <tr>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Identifier</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Customer</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Location</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Valuation</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Status</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-[#6B6058] opacity-60 font-medium uppercase tracking-widest text-[11px]">Syncing live data...</td>
              </tr>
            ) : recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-[#6B6058] opacity-60 font-medium uppercase tracking-widest text-[11px]">No active transactions found.</td>
              </tr>
            ) : (
              recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-[#FAF7F4] last:border-0 hover:bg-[#FAF7F4]/50 transition-colors">
                  <td className="px-8 py-6 font-mono font-bold text-[13px] text-[#1C1410] tracking-widest">{o.order_number}</td>
                  <td className="px-8 py-6 text-[#6B6058] font-bold text-[13px]">{o.customer_name}</td>
                  <td className="px-8 py-6 text-[#6B6058] font-medium text-[12px] uppercase tracking-wider">{o.city}</td>
                  <td className="px-8 py-6 font-bold text-[#4A2C6E] font-heading text-[15px]">{o.total_pkr?.toLocaleString()} PKR</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-0 text-[9px] font-bold uppercase tracking-[2px] border ${
                      o.status === 'pending' ? 'bg-[#F0EBF8] text-[#4A2C6E] border-[rgba(74,44,110,0.1)]' : 'bg-white text-[#1C1410] border-[#E8E2D9]'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[#6B6058] text-[11px] font-bold uppercase tracking-widest opacity-40">
                    {new Date(o.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
