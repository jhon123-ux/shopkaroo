'use client'

import { useState } from 'react'
import {
  ShoppingCart, Clock, Mail, Phone,
  ChevronDown, ChevronUp, Package
} from 'lucide-react'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

type Draft = {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  cart_items: CartItem[]
  cart_total: number
  reached_step: 'cart' | 'checkout' | 'payment'
  last_activity_at: string
  created_at: string
}

const STEP_LABELS: Record<string, { label: string; color: string }> = {
  cart:     { label: 'Left at Cart',     color: 'bg-gray-100 text-gray-700' },
  checkout: { label: 'Left at Checkout', color: 'bg-yellow-100 text-yellow-800' },
  payment:  { label: 'Left at Payment',  color: 'bg-orange-100 text-orange-800' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `${days}d ago`
  if (hrs > 0) return `${hrs}h ago`
  return `${mins}m ago`
}

export default function DraftOrdersClient({ drafts }: { drafts: Draft[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalValue = drafts.reduce((sum, d) => sum + Number(d.cart_total), 0)
  const highIntentDrafts = drafts.filter(d => d.reached_step === 'checkout' || d.reached_step === 'payment')

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fadeIn">

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1C1410] font-heading flex items-center gap-3 uppercase tracking-widest">
          <ShoppingCart className="w-8 h-8 text-[#4A2C6E]" />
          Draft Orders
        </h1>
        <p className="text-[12px] text-[#6B6058] font-bold uppercase tracking-[2px] mt-2 opacity-60">
          Capture high-intent abandoned carts from logged-in users.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-[#E8E2D9] p-8 shadow-sm">
          <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[3px] mb-3 opacity-60">Total Drafts</p>
          <p className="text-4xl font-bold text-[#4A2C6E] font-heading">{drafts.length}</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] p-8 shadow-sm">
          <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[3px] mb-3 opacity-60">Potential Revenue</p>
          <p className="text-4xl font-bold text-[#4A2C6E] font-heading">Rs. {totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] p-8 shadow-sm">
          <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[3px] mb-3 opacity-60">High Intent</p>
          <p className="text-4xl font-bold text-orange-600 font-heading">{highIntentDrafts.length}</p>
          <p className="text-[11px] text-[#6B6058] font-bold mt-2 uppercase tracking-wider opacity-40">Reached checkout / payment</p>
        </div>
      </div>

      {/* Empty State */}
      {drafts.length === 0 && (
        <div className="text-center py-24 bg-white border border-[#E8E2D9] border-dashed">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-10 text-[#4A2C6E]" />
          <p className="text-[14px] font-bold text-[#1C1410] uppercase tracking-widest">No draft orders found</p>
          <p className="text-[12px] text-[#6B6058] mt-2 font-bold uppercase tracking-wider opacity-40">Users who abandon carts will appear here</p>
        </div>
      )}

      {/* Draft List */}
      <div className="space-y-4">
        {drafts.map((draft) => {
          const isExpanded = expandedId === draft.id
          const stepInfo = STEP_LABELS[draft.reached_step] ?? STEP_LABELS.cart

          return (
            <div
              key={draft.id}
              className={`bg-white border ${isExpanded ? 'border-[#4A2C6E]' : 'border-[#E8E2D9]'} shadow-sm overflow-hidden transition-all duration-300`}
            >
              {/* Row Header */}
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#FAF7F4] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : draft.id)}
              >
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#F0EBF8] flex items-center justify-center text-[#4A2C6E] font-bold text-lg border border-[#4A2C6E]/10">
                    {draft.customer_name?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-[#1C1410] text-[16px] font-heading tracking-wider uppercase">
                        {draft.customer_name || 'Anonymous User'}
                      </p>
                      <span className={`text-[9px] px-2 py-1 font-bold uppercase tracking-widest border border-current ${stepInfo.color}`}>
                        {stepInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-bold text-[#6B6058] flex items-center gap-1.5 uppercase tracking-wider opacity-60">
                        <Mail className="w-3 h-3" />{draft.customer_email}
                      </span>
                      {draft.customer_phone && (
                        <span className="text-[11px] font-bold text-[#6B6058] flex items-center gap-1.5 uppercase tracking-wider opacity-60">
                          <Phone className="w-3 h-3" />{draft.customer_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-bold text-[#4A2C6E] text-lg font-heading">Rs. {Number(draft.cart_total).toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-[#6B6058] uppercase tracking-widest opacity-40">
                      {draft.cart_items.length} item{draft.cart_items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[11px] font-bold text-[#6B6058] flex items-center gap-1.5 uppercase tracking-widest opacity-40">
                      <Clock className="w-3 h-3" />
                      {timeAgo(draft.last_activity_at)}
                    </p>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-[#4A2C6E]" />
                    : <ChevronDown className="w-5 h-5 text-[#6B6058] opacity-40" />
                  }
                </div>
              </div>

              {/* Expanded Cart Items */}
              {isExpanded && (
                <div className="border-t border-[#E8E2D9] p-8 bg-[#FAF7F4]/50 animate-slideDown">
                  <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[3px] mb-6 opacity-40">
                    Abandoned Cart Contents
                  </p>
                  <div className="grid gap-4">
                    {draft.cart_items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white p-5 border border-[#E8E2D9] hover:border-[#4A2C6E]/40 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-5">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover border border-[#E8E2D9]"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-[#FAF7F4] flex items-center justify-center border border-[#E8E2D9]">
                              <Package className="w-5 h-5 text-[#6B6058] opacity-30" />
                            </div>
                          )}
                          <div>
                            <p className="text-[14px] font-bold text-[#1C1410] uppercase tracking-wider font-heading">{item.name}</p>
                            <p className="text-[11px] font-bold text-[#6B6058] mt-1 uppercase tracking-widest opacity-60">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-[16px] font-bold text-[#1C1410]">
                          Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-8 pt-8 border-t border-[#E8E2D9]">
                    <p className="text-[14px] font-bold text-[#1C1410] uppercase tracking-widest">
                      Cart Total: <span className="text-[#4A2C6E] ml-2 text-xl font-heading">Rs. {Number(draft.cart_total).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
