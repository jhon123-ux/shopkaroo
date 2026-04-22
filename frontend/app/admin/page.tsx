'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Package, ShoppingCart, Clock, ImageIcon, Star } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pending: 0,
    banners: 0,
    pendingReviews: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
        const headers = { 
          'x-admin-auth': adminToken || '',
          'Content-Type': 'application/json' 
        }
        
        console.log('Syncing dashboard...')

        const [prodRes, orderRes, bannerRes, revRes] = await Promise.all([
          fetch(`${backendUrl}/api/products?all=true`, { headers, cache: 'no-store' }),
          fetch(`${backendUrl}/api/orders?all=true`, { headers, cache: 'no-store' }),
          fetch(`${backendUrl}/api/banners?all=true`, { headers, cache: 'no-store' }),
          fetch(`${backendUrl}/api/reviews/admin`, { headers, cache: 'no-store' })
        ])

        const prodData = prodRes.ok ? await prodRes.json() : { count: 0, data: [] }
        const orderData = orderRes.ok ? await orderRes.json() : { data: [], count: 0 }
        const bannerData = bannerRes.ok ? await bannerRes.json() : { data: [] }
        const revData = revRes.ok ? await revRes.json() : { data: [] }

        console.log('Order sync report:', { count: orderData.count, length: orderData.data?.length })

        const pendingOrders = (orderData.data || []).filter((o: any) => o.status === 'pending').length
        const activeBanners = (bannerData.data || []).filter((b: any) => b.is_active).length
        const pendingReviewsCount = (revData.data || []).filter((r: any) => r.is_approved === null).length

        setStats({
          products: prodData.count || (prodData.data || []).length || 0,
          orders: orderData.count !== undefined ? orderData.count : (orderData.data || []).length,
          pending: pendingOrders,
          banners: activeBanners,
          pendingReviews: pendingReviewsCount
        })

        setRecentOrders((orderData.data || []).slice(0, 5))
      } catch (err) {
        console.error('Dashboard sync failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return (
    <div className="font-body">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-bg-white rounded-0 p-8 border border-border shadow-sm relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-text">
            <Package size={28} />
          </div>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[2px] mb-2">Total Products</p>
          <p className="font-heading font-bold text-[48px] text-text leading-none">
            {loading ? '—' : stats.products}
          </p>
        </div>

        <div className="bg-bg-white rounded-0 p-8 border border-border shadow-sm relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
            <ShoppingCart size={28} />
          </div>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[2px] mb-2">Total Orders</p>
          <p className="font-heading font-bold text-[48px] text-primary leading-none">
            {loading ? '—' : stats.orders}
          </p>
        </div>

        <div className="bg-bg-white rounded-0 p-8 border border-border shadow-sm relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
            <Clock size={28} />
          </div>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[2px] mb-2">Pending Orders</p>
          <p className="font-heading font-bold text-[48px] text-orange-500 leading-none">
            {loading ? '—' : stats.pending}
          </p>
        </div>

        <div className="bg-bg-white rounded-0 p-8 border border-border shadow-sm relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-600 dark:text-green-500">
            <ImageIcon size={28} />
          </div>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[2px] mb-2">Active Banners</p>
          <p className="font-heading font-bold text-[48px] text-green-600 dark:text-green-500 leading-none">
            {loading ? '—' : stats.banners}
          </p>
        </div>

        <div className="bg-[#FFFBEB] rounded-0 p-8 border border-[rgba(217,119,6,0.1)] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity text-[#D97706]">
            <Star size={28} />
          </div>
          <p className="text-[#D97706] text-[11px] font-bold uppercase tracking-[2px] mb-2">Reviews</p>
          <p className="font-heading font-bold text-[48px] text-[#D97706] leading-none">
            {loading ? '—' : stats.pendingReviews}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="font-heading font-bold text-[22px] text-text uppercase tracking-widest leading-none">Recent Orders</h2>
        <div className="h-px bg-border flex-1 mx-8 opacity-40"></div>
      </div>

      <div className="bg-bg-white rounded-0 border border-border overflow-hidden shadow-sm transition-colors">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-text uppercase tracking-[2px]">Order #</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-text uppercase tracking-[2px]">Customer</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-text uppercase tracking-[2px]">City</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-text uppercase tracking-[2px]">Total</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-text uppercase tracking-[2px]">Status</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-text uppercase tracking-[2px]">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-[#6B6058] opacity-60 font-medium uppercase tracking-widest text-[11px]">Loading orders...</td>
              </tr>
            ) : recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-[#6B6058] opacity-60 font-medium uppercase tracking-widest text-[11px]">No recent orders found.</td>
              </tr>
            ) : (
              recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-8 py-6 font-mono font-bold text-[13px] text-text tracking-widest">{o.order_number}</td>
                  <td className="px-8 py-6 text-text-muted font-bold text-[13px]">{o.customer_name}</td>
                  <td className="px-8 py-6 text-text-muted font-medium text-[12px] uppercase tracking-wider">{o.city}</td>
                  <td className="px-8 py-6 font-bold text-primary font-heading text-[15px]">{o.total_pkr?.toLocaleString()} PKR</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-0 text-[9px] font-bold uppercase tracking-[2px] border ${
                      o.status === 'pending' ? 'bg-primary-tint text-primary border-primary/10' : 'bg-surface text-text border-border'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-text-muted text-[11px] font-bold uppercase tracking-widest opacity-60">
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
