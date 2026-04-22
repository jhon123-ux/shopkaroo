'use client'

import { Repeat2 } from 'lucide-react'
import { CustomerOrderSummary } from '@/lib/recurring-customers'

type Props = {
  customer: CustomerOrderSummary
  onClick: (customer: CustomerOrderSummary) => void
}

export default function RecurringBadge({ customer, onClick }: Props) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick(customer)
      }}
      title={`Returning customer — ${customer.order_count} orders`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-0 text-[10px] font-bold uppercase tracking-widest bg-[#F0EBF8] text-[#4A2C6E] hover:bg-[#4A2C6E] hover:text-white transition-all cursor-pointer border border-[#4A2C6E]/20 shadow-sm grow-0 self-start mt-2"
    >
      <Repeat2 className="w-3 h-3" strokeWidth={2.5} />
      Returning · {customer.order_count}x
    </button>
  )
}
