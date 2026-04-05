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
    <div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-[#E5E0F5] shadow-sm">
          <div className="text-3xl mb-3">📦</div>
          <p className="font-heading font-extrabold text-4xl text-[#6C3FC5]">
            {loading ? '-' : stats.products}
          </p>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Total Products</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E0F5] shadow-sm">
          <div className="text-3xl mb-3">🛒</div>
          <p className="font-heading font-extrabold text-4xl text-[#6C3FC5]">
            {loading ? '-' : stats.orders}
          </p>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E0F5] shadow-sm">
          <div className="text-3xl mb-3">⏳</div>
          <p className="font-heading font-extrabold text-4xl text-[#D97706]">
            {loading ? '-' : stats.pending}
          </p>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Pending Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E0F5] shadow-sm">
          <div className="text-3xl mb-3">🖼️</div>
          <p className="font-heading font-extrabold text-4xl text-[#4CAF7D]">
            {loading ? '-' : stats.banners}
          </p>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Active Banners</p>
        </div>
      </div>

      <h2 className="font-heading font-bold text-xl text-[#1A1A2E] mb-4">Recent Orders</h2>
      <div className="bg-white rounded-2xl border border-[#E5E0F5] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F5FF] border-b border-[#E5E0F5]">
            <tr>
              <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Order #</th>
              <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Customer</th>
              <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">City</th>
              <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Total</th>
              <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Status</th>
              <th className="px-6 py-4 text-left font-mono text-xs text-[#6C3FC5] uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-[#6B7280]">Loading orders...</td>
              </tr>
            ) : recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-[#6B7280]">No orders found.</td>
              </tr>
            ) : (
              recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-[#E5E0F5] last:border-0 hover:bg-[#F7F5FF] transition">
                  <td className="px-6 py-4 font-mono font-medium text-[#1A1A2E]">{o.order_number}</td>
                  <td className="px-6 py-4 text-[#6B7280]">{o.customer_name}</td>
                  <td className="px-6 py-4 text-[#6B7280]">{o.city}</td>
                  <td className="px-6 py-4 font-bold text-[#6C3FC5] Syne">Rs. {o.total_pkr?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      o.status === 'pending' ? 'bg-[#FFF9E6] text-[#D97706]' : 'bg-[#E5E0F5] text-[#1A1A2E]'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280] text-xs">
                    {new Date(o.created_at).toLocaleDateString()}
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
