'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/lib/authStore'
import Link from 'next/link'
import { Package, Check, X } from 'lucide-react'

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
  pending: 'text-[#783A3A] bg-[#F5E8E8] border-[rgba(120,58,58,0.1)]',
  confirmed: 'text-[#783A3A] bg-[#F5E8E8] border-[rgba(120,58,58,0.1)]',
  shipped: 'text-[#783A3A] bg-[#F5E8E8] border-[rgba(120,58,58,0.1)]',
  delivered: 'text-[#2D6A4F] bg-[#EBF7F0] border-[rgba(45,106,79,0.1)]',
  cancelled: 'text-[#DC2626] bg-[#FEF2F2] border-red-100'
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
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#783A3A] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] py-16 md:py-24 font-body">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-[40px] font-bold text-[#1C1410] font-heading mb-4">
            Order Collection
          </h1>
          <p className="text-[#6B6058] text-[14px] uppercase tracking-[3px] font-semibold opacity-60">
            {orders.length} ARCHIVED PURCHASES
          </p>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="bg-white rounded-0 border border-[#E8E2D9] p-20 text-center shadow-sm">
            <div className="flex justify-center mb-8 opacity-20"><Package size={48} strokeWidth={1.5} /></div>
            <h2 className="text-[24px] font-bold text-[#1C1410] mb-3 font-heading uppercase tracking-widest">
              No Orders Found
            </h2>
            <p className="text-[#6B6058] mb-10 font-body opacity-60">
              Your purchase history is currently empty.
            </p>
            <Link href="/"
              className="bg-[#783A3A] text-white px-10 py-4 rounded-[3px] font-bold uppercase tracking-[2px] text-[13px] hover:bg-[#5B2C2C] transition-all shadow-xl hover:-translate-y-1 active:scale-95 inline-block">
              Browse Collection
            </Link>
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-10">
          {orders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.status)
            const isCancelled = order.status === 'cancelled'

            return (
              <div key={order.id} className="bg-white rounded-0 border border-[#E8E2D9] p-8 md:p-10 shadow-sm transition-all hover:shadow-md">
                
                {/* Top row */}
                <div className="flex justify-between items-start mb-10 pb-6 border-b border-[#FAF7F4]">
                  <div>
                    <p className="font-bold text-[#1C1410] text-[18px] font-heading tracking-widest uppercase mb-1">
                      Order {order.order_number}
                    </p>
                    <p className="text-[12px] text-[#6B6058] uppercase tracking-widest opacity-60 font-bold">
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-[2px] border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-4 mb-10">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-[#1C1410] font-bold text-[15px] font-heading group-hover:text-[#783A3A] transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#6B6058] uppercase tracking-widest font-bold opacity-40 mt-1">Quantity: {item.qty}</span>
                      </div>
                      <span className="font-bold text-[#783A3A] text-[14px]">
                        { (item.price_pkr * item.qty).toLocaleString() } PKR
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total + Location */}
                <div className="flex justify-between items-center mb-12 bg-[#FAF7F4] p-6 rounded-0 border border-[#E8E2D9]">
                  <div className="flex flex-col">
                    <span className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-1">Destination</span>
                    <span className="text-[#1C1410] font-bold text-[13px] uppercase tracking-widest leading-none flex items-center gap-2">
                       {order.city}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6B6058] text-[10px] font-bold uppercase tracking-[2px] opacity-40 mb-1 block">Grand Total</span>
                    <p className="font-bold text-[#783A3A] text-[24px] font-heading leading-none">
                      {order.total_pkr.toLocaleString()} <span className="text-[14px]">PKR</span>
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled && (
                  <div className="pt-8 border-t border-[#FAF7F4]">
                    <div className="flex items-center justify-between px-2">
                      {STATUS_STEPS.map((step, i) => {
                        const isCompleted = i <= stepIndex
                        const isActive = i === stepIndex
                        
                        return (
                          <div key={step} className="flex flex-col items-center flex-1 relative">
                            {/* Connector Line */}
                            {i > 0 && (
                              <div className={`absolute right-1/2 top-[10px] w-full h-[1px] -translate-y-1/2 -z-10 ${i <= stepIndex ? 'bg-[#783A3A]' : 'bg-[#E8E2D9]'}`} />
                            )}
                            
                            {/* Dot */}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-700 z-10 ${
                              isCompleted ? 'bg-[#783A3A]' : 'bg-[#E8E2D9]'
                            } ${isActive ? 'ring-8 ring-[#F5E8E8] scale-110' : ''}`}>
                              {isCompleted && (
                                <Check size={12} className="text-white" strokeWidth={3} />
                              )}
                            </div>
                            
                            {/* Label */}
                            <p className={`text-[9px] font-bold mt-4 text-center transition-all duration-300 uppercase tracking-widest ${
                              isActive ? 'text-[#783A3A] scale-105' : isCompleted ? 'text-[#1C1410]' : 'text-[#6B6058] opacity-40'
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
                  <div className="bg-[#FEF2F2] rounded-0 p-6 text-center border border-red-100 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm"><X className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[#DC2626] text-[12px] font-bold uppercase tracking-widest">Transaction Deactivated</p>
                      <p className="text-[#DC2626]/60 text-[11px] mt-1 font-body">
                        Please contact Concierge via WhatsApp for clarification.
                      </p>
                    </div>
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
