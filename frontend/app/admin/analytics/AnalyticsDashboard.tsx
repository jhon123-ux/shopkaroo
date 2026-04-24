'use client'
import Link from 'next/link'
import { AnalyticsData } from '@/lib/analytics'
import {
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Users, 
  Package,
  ShoppingCart as CartIcon, 
  Repeat2, 
  BarChart2, 
  AlertCircle, 
  Star,
  ChevronRight
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────
// MINI LINE CHART (SVG)
// ──────────────────────────────────────────────────────────────
function SparkLine({ data, color = '#4A2C6E' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (v / max) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="mt-4 pt-4 border-t border-[#FAF7F4]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-12 overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-40"
        />
      </svg>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// BAR CHART (SVG)
// ──────────────────────────────────────────────────────────────
function BarChart({ data, labelKey, valueKey, color = '#4A2C6E' }: {
  data: Record<string, any>[]
  labelKey: string
  valueKey: string
  color?: string
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className="flex items-end gap-2 h-40 w-full pt-8 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full relative flex items-end justify-center" style={{ height: 120 }}>
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1C1410] text-white text-[10px] font-bold px-2 py-1 rounded-[2px] whitespace-nowrap z-10 pointer-events-none">
              {d[valueKey].toLocaleString()}
            </div>
            <div
              className="w-full max-w-[12px] rounded-[2px] transition-all duration-500"
              style={{
                height: `${(d[valueKey] / max) * 120}px`,
                backgroundColor: color,
                opacity: 0.4 + (i / data.length) * 0.6,
              }}
            />
          </div>
          <span className="text-[9px] font-bold text-[#6B6058] uppercase tracking-wider opacity-40">
            {String(d[labelKey]).slice(5)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, trend, sparkData, icon: Icon, prefix = ''
}: {
  label: string
  value: string | number
  sub?: string
  trend?: number
  sparkData?: number[]
  icon: React.ElementType
  prefix?: string
}) {
  const isPositive = (trend ?? 0) >= 0
  return (
    <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm flex flex-col gap-4 group hover:border-[#4A2C6E]/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-0 bg-[#F0EBF8] flex items-center justify-center border border-[#4A2C6E]/5">
          <Icon className="w-5 h-5 text-[#4A2C6E]" />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-0 border transition-colors ${
            isPositive 
              ? 'bg-[#F3FAF7] text-[#03543F] border-[#DEF7EC]' 
              : 'bg-[#FDF2F2] text-[#9B1C1C] border-[#FBD5D5]'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[32px] font-bold text-[#1C1410] font-heading leading-tight italic tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] font-bold text-[#6B6058] uppercase tracking-[2px] mt-2 opacity-60">{label}</p>
        {sub && <p className="text-[10px] font-bold text-[#6B6058] mt-1 uppercase tracking-wider opacity-30">{sub}</p>}
      </div>
      {sparkData && <SparkLine data={sparkData} />}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// STATUS COLORS
// ──────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-100',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-100',
  processing: 'bg-purple-50 text-purple-700 border-purple-100',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-100',
  delivered:  'bg-green-50 text-green-700 border-green-100',
  cancelled:  'bg-red-50 text-red-600 border-red-100',
}

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const sparkRevenue = data.revenueByDay.map(d => d.revenue)
  const sparkOrders = data.revenueByDay.map(d => d.orders)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1410] font-heading flex items-center gap-3 uppercase tracking-widest">
            <BarChart2 className="w-8 h-8 text-[#4A2C6E]" />
            Business Analytics
          </h1>
          <p className="text-[12px] text-[#6B6058] font-bold uppercase tracking-[2px] mt-2 opacity-60">
            Performance metrics for ShopKarro Pakistan
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[9px] font-bold text-[#6B6058] uppercase tracking-[4px] opacity-30">Snapshot Period</p>
          <p className="text-[11px] font-bold text-[#1C1410] uppercase tracking-widest mt-1">Last 30 Days Activity</p>
        </div>
      </div>

      {/* KPI Cards - Row 1: Revenue + Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Lifetime Revenue"
          value={`Rs. ${data.totalRevenue.toLocaleString()}`}
          sub={`Rs. ${data.revenueThisMonth.toLocaleString()} this month`}
          trend={data.revenueGrowthPercent}
          sparkData={sparkRevenue}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Orders"
          value={data.totalOrders}
          sub={`${data.ordersThisMonth} this month`}
          trend={data.orderGrowthPercent}
          sparkData={sparkOrders}
          icon={ShoppingBag}
        />
        <StatCard
          label="Avg. Order Value"
          value={`Rs. ${data.avgOrderValue.toLocaleString()}`}
          sub={`Rs. ${data.avgOrderValueThisMonth.toLocaleString()} this month`}
          icon={Star}
        />
        <StatCard
          label="Total Customers"
          value={data.totalCustomers}
          sub={`${data.newCustomersThisMonth} new this month`}
          icon={Users}
        />
      </div>

      {/* KPI Cards - Row 2: Customer + Draft metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Recurring Customers"
          value={data.recurringCustomers}
          sub="Loyalty (Placed 2+ orders)"
          icon={Repeat2}
        />
        <StatCard
          label="Abandoned Drafts"
          value={data.totalDraftOrders}
          sub={`Rs. ${data.draftOrdersValue.toLocaleString()} Potential`}
          icon={CartIcon}
        />
        <StatCard
          label="Abandonment Rate"
          value={`${data.cartAbandonmentRate}%`}
          sub="Funnel drop-off"
          icon={AlertCircle}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Orders by Month */}
        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[12px] font-bold text-[#1C1410] uppercase tracking-[3px]">Monthly Volume</h2>
              <p className="text-[10px] font-bold text-[#6B6058] mt-1 uppercase tracking-wider opacity-30">Last 6 Months Order Frequency</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAF7F4] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#4A2C6E]/40" />
            </div>
          </div>
          <BarChart
            data={data.ordersByMonth}
            labelKey="month"
            valueKey="orders"
            color="#4A2C6E"
          />
        </div>

        {/* Revenue by Day */}
        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[12px] font-bold text-[#1C1410] uppercase tracking-[3px]">Revenue Trend</h2>
              <p className="text-[10px] font-bold text-[#6B6058] mt-1 uppercase tracking-wider opacity-30">Daily Financial Performance (30d)</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FAF7F4] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#4A2C6E]/40" />
            </div>
          </div>
          <div className="h-40 flex items-end">
             <SparkLine data={sparkRevenue} color="#4A2C6E" />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-[#6B6058] uppercase tracking-widest mt-4 opacity-40">
            <span>{data.revenueByDay[0]?.date}</span>
            <span>{data.revenueByDay[data.revenueByDay.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Order Status + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Orders by Status */}
        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm">
          <h2 className="text-[12px] font-bold text-[#1C1410] uppercase tracking-[3px] mb-8">Fulfillment Breakdown</h2>
          <div className="space-y-6">
            {data.ordersByStatus
              .sort((a, b) => b.count - a.count)
              .map(({ status, count }) => {
                const pct = Math.round((count / data.totalOrders) * 100)
                return (
                  <div key={status} className="flex items-center gap-4 group">
                    <span className={`text-[9px] px-3 py-1.5 font-bold uppercase tracking-widest border w-28 text-center transition-all group-hover:scale-105 ${STATUS_COLOR[status] ?? 'bg-gray-50 text-gray-700'}`}>
                      {status}
                    </span>
                    <div className="flex-1 bg-[#FAF7F4] h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-[#4A2C6E] transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-bold text-[#1C1410] font-heading w-8 text-right italic">{count}</span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="bg-white rounded-0 p-8 border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[12px] font-bold text-[#1C1410] uppercase tracking-[3px]">Top Performing Collections</h2>
            <Link href="/admin/products" className="text-[10px] font-bold text-[#4A2C6E] flex items-center gap-1 hover:underline">
               VIEW INVENTORY <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-6">
            {data.topProducts.map((p, i) => (
              <div key={p.product_id} className="flex items-center gap-5 group">
                <span className="text-2xl font-bold text-[#E8E2D9] font-heading w-6 group-hover:text-[#4A2C6E]/40 transition-colors">
                  {i + 1}
                </span>
                <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#E8E2D9] overflow-hidden">
                   {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover p-1"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-[#6B6058] opacity-10" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1C1410] uppercase tracking-wider font-heading truncate">{p.name}</p>
                  <p className="text-[10px] font-bold text-[#6B6058] uppercase tracking-widest opacity-40">{p.total_sold} UNITS SOLD</p>
                </div>
                <p className="text-[16px] font-bold text-[#4A2C6E] font-heading">
                  Rs. {p.total_revenue.toLocaleString()}
                </p>
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <div className="py-12 text-center">
                 <Package className="w-10 h-10 text-[#6B6058] opacity-5 mx-auto mb-4" />
                 <p className="text-[11px] font-bold text-[#6B6058] uppercase tracking-widest opacity-40">No transaction data recorded</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
