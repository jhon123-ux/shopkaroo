'use client'

import { X, Package, Calendar, BadgeCheck, ShoppingBag } from 'lucide-react'
import { CustomerOrderSummary } from '@/lib/recurring-customers'

type Props = {
  customer: CustomerOrderSummary
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-[#FDF2F2] text-[#9B1C1C] border-[#FBD5D5]',
  confirmed: 'bg-[#EBF5FF] text-[#1E429F] border-[#D1E9FF]',
  processing: 'bg-[#F3F0FF] text-[#5521B5] border-[#E5DBFF]',
  shipped: 'bg-[#F0F5FF] text-[#1E429F] border-[#D1E9FF]',
  delivered: 'bg-[#F3FAF7] text-[#03543F] border-[#DEF7EC]',
  cancelled: 'bg-[#FAF5F5] text-[#9B1C1C] border-[#FBD5D5]',
}

export default function CustomerOrdersModal({ customer, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-0 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#E8E2D9] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-[#FAF7F4] bg-white">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-5 h-5 text-[#4A2C6E]" />
              <span className="text-[10px] font-bold text-[#4A2C6E] uppercase tracking-[3px]">
                Loyal Customer
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1C1410] font-heading tracking-widest uppercase">{customer.full_name}</h2>
            <p className="text-[12px] text-[#6B6058] font-bold opacity-60 mt-1 uppercase tracking-widest">
              {customer.email} · {customer.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#1C1410] hover:bg-[#FAF7F4] transition-colors p-3 rounded-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-px bg-[#E8E2D9] border-b border-[#E8E2D9]">
          <div className="bg-white px-8 py-6 text-center">
            <p className="text-[28px] font-bold text-[#4A2C6E] leading-none">{customer.order_count}</p>
            <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[2px] mt-2 opacity-60">Total Orders</p>
          </div>
          <div className="bg-white px-8 py-6 text-center">
            <p className="text-[28px] font-bold text-[#4A2C6E] leading-none">
              Rs. {customer.total_spent.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[2px] mt-2 opacity-60">Total Spent</p>
          </div>
          <div className="bg-white px-8 py-6 text-center">
            <p className="text-[28px] font-bold text-[#4A2C6E] leading-none">
              Rs. {Math.round(customer.total_spent / customer.order_count).toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[2px] mt-2 opacity-60">Avg. Order</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="overflow-y-auto flex-1 p-8 space-y-4 bg-[#FAF7F4]/30">
          <p className="text-[11px] font-bold text-[#6B6058] uppercase tracking-[3px] mb-6 opacity-40">Purchase History</p>
          {customer.orders.map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-6 bg-white border border-[#E8E2D9] hover:border-[#4A2C6E]/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-[#F0EBF8] flex items-center justify-center text-sm font-bold text-[#4A2C6E] rounded-0">
                  {index + 1}
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-bold text-[#1C1410] tracking-widest uppercase">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5 opacity-60">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6058] uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6058] uppercase tracking-wider">
                      <ShoppingBag className="w-3 h-3" />
                      {order.items_count} units
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-[9px] uppercase tracking-[2px] font-bold px-3 py-1.5 border ${STATUS_COLORS[order.status] ?? 'bg-white text-gray-500 border-gray-200'}`}>
                  {order.status}
                </span>
                <p className="text-[16px] font-bold text-[#1C1410] font-heading tracking-tight">
                  Rs. {order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
