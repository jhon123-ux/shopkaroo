'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/lib/authStore'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  items: any[]
  total_pkr: number
  status: string
  city: string
  address: string
  created_at: string
}

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]',
  confirmed: 'text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]',
  shipped: 'text-[#0284C7] bg-[#F0F9FF] border-[#BAE6FD]',
  delivered: 'text-[#4CAF7D] bg-[#F0FDF4] border-[#BBF7D0]',
  cancelled: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]'
}

export default function MyOrdersPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/my-orders')
    }
  }, [user, loading, router])

  // Fetch orders by user_id
  useEffect(() => {
    if (!user) return
    
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order('created_at', { ascending: false })
      
      setOrders(data || [])
      setFetching(false)
    }
    
    fetchOrders()
  }, [user])

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#6C3FC5] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF] py-10">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1A1A2E]" style={{fontFamily:'Syne,sans-serif'}}>
            My Orders
          </h1>
          <p className="text-[#6B7280] mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E0F5] p-16 text-center shadow-lg">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2" style={{fontFamily:'Syne,sans-serif'}}>
              No orders yet
            </h2>
            <p className="text-[#6B7280] mb-8">
              Start shopping to see your orders here
            </p>
            <Link href="/"
              className="bg-[#6C3FC5] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5530A8] transition inline-block shadow-md shadow-[#6C3FC5]/20"
              style={{fontFamily:'Syne,sans-serif'}}>
              Shop Now
            </Link>
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.status)
            const isCancelled = order.status === 'cancelled'

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E5E0F5] p-6 shadow-md hover:shadow-lg transition-shadow">
                
                {/* Top row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-[#6C3FC5] text-lg" style={{fontFamily:'Syne,sans-serif'}}>
                      {order.order_number}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="border-t border-[#E5E0F5] pt-4 mb-4">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 px-1 rounded-lg hover:bg-[#F7F5FF] transition-colors">
                      <span className="text-[#1A1A2E] font-medium">
                        {item.name} <span className="text-[#6B7280] ml-1">× {item.qty}</span>
                      </span>
                      <span className="font-bold text-[#6C3FC5]">
                        Rs. {(item.price_pkr * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total + Place */}
                <div className="flex justify-between items-center mb-8 bg-[#F7F5FF] p-3 rounded-xl border border-[#E5E0F5]/50">
                  <span className="text-[#6B7280] text-xs font-bold">
                    📍 {order.city}
                  </span>
                  <p className="font-black text-[#1A1A2E] text-lg" style={{fontFamily:'Syne,sans-serif'}}>
                    Total: <span className="text-[#6C3FC5]">Rs. {order.total_pkr.toLocaleString()}</span>
                  </p>
                </div>

                {/* Status Timeline */}
                {!isCancelled && (
                  <div className="pt-4 border-t border-[#E5E0F5]">
                    <div className="flex items-center justify-between px-2">
                      {STATUS_STEPS.map((step, i) => {
                        const isCompleted = i <= stepIndex
                        const isActive = i === stepIndex
                        
                        return (
                          <div key={step} className="flex flex-col items-center flex-1 relative">
                            {/* Connector Line */}
                            {i > 0 && (
                              <div className={`absolute right-1/2 top-[13.5px] w-full h-[3px] -translate-y-1/2 -z-10 ${i <= stepIndex ? 'bg-[#6C3FC5]' : 'bg-[#E5E0F5]'}`} />
                            )}
                            
                            {/* Circle */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 z-10 shadow-sm ${
                              isCompleted ? 'bg-[#6C3FC5] text-white' : 'bg-[#E5E0F5] text-[#9CA3AF]'
                            } ${isActive ? 'ring-4 ring-[#EDE6FA] scale-110' : ''}`}>
                              {isCompleted ? '✓' : i + 1}
                            </div>
                            
                            {/* Label */}
                            <p className={`text-[10px] font-bold mt-2.5 text-center transition-colors duration-300 ${
                              isActive ? 'text-[#6C3FC5]' : isCompleted ? 'text-[#1A1A2E]' : 'text-[#9CA3AF]'
                            }`}>
                              {STATUS_LABELS[step]}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled state */}
                {isCancelled && (
                  <div className="bg-[#FEF2F2] rounded-xl p-4 text-center border border-[#FECACA] animate-pulse">
                    <p className="text-[#DC2626] text-sm font-bold flex items-center justify-center gap-2">
                      <span>❌</span> This order was cancelled
                    </p>
                    <p className="text-[#DC2626]/70 text-xs mt-1">
                      Contact us on WhatsApp if you have questions regarding this order.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
