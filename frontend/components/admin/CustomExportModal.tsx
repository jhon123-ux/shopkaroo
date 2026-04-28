'use client'

import { useState, useEffect } from 'react'
import { X, FileSpreadsheet, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface CustomExportModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilters?: Record<string, any>
}

type DatePreset = 'today' | 'week' | 'month' | 'last_month' | 'last_3_months' | 'all'

const STATUS_OPTIONS = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled']

const getPresetDates = (preset: DatePreset): { start: string; end: string } => {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const today = fmt(now)

  switch (preset) {
    case 'today': {
      return { start: today, end: today }
    }
    case 'week': {
      const s = new Date(now)
      s.setDate(s.getDate() - 7)
      return { start: fmt(s), end: today }
    }
    case 'month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: fmt(s), end: today }
    }
    case 'last_month': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: fmt(s), end: fmt(e) }
    }
    case 'last_3_months': {
      const s = new Date(now)
      s.setMonth(s.getMonth() - 3)
      return { start: fmt(s), end: today }
    }
    case 'all':
    default:
      return { start: '', end: '' }
  }
}

export default function CustomExportModal({ isOpen, onClose, currentFilters }: CustomExportModalProps) {
  const [activePreset, setActivePreset] = useState<DatePreset>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([...STATUS_OPTIONS])
  const [includeOrders, setIncludeOrders] = useState(true)
  const [includeItems, setIncludeItems] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [optionalCols, setOptionalCols] = useState<string[]>(['Email', 'Internal Note', 'Order Source', 'Delivery Address'])
  const [colsExpanded, setColsExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setActivePreset('all')
      setStartDate('')
      setEndDate('')
      setSelectedStatuses([...STATUS_OPTIONS])
      setIncludeOrders(true)
      setIncludeItems(true)
      setIncludeSummary(true)
      setOptionalCols(['Email', 'Internal Note', 'Order Source', 'Delivery Address'])
      setColsExpanded(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePreset = (p: DatePreset) => {
    setActivePreset(p)
    const { start, end } = getPresetDates(p)
    setStartDate(start)
    setEndDate(end)
  }

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const toggleColumn = (col: string) => {
    setOptionalCols(prev =>
      prev.includes(col) ? prev.filter(x => x !== col) : [...prev, col]
    )
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()

      // Send statuses as comma-separated list
      if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_OPTIONS.length) {
        params.append('status', selectedStatuses.join(','))
      } else if (selectedStatuses.length === 0) {
        // Fallback or alert if nothing selected? Just skip filter for now.
      }

      if (startDate) params.append('startDate', startDate)
      if (endDate)   params.append('endDate', endDate)
      if (!includeItems)   params.append('includeItems', 'false')
      if (!includeSummary) params.append('includeSummary', 'false')
      
      if (optionalCols.length > 0) {
        params.append('columns', optionalCols.join(','))
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const adminToken = localStorage.getItem('admin_token') || ''

      const response = await fetch(
        `${backendUrl}/api/orders/admin/orders/export/excel?${params.toString()}`,
        { headers: { 'x-admin-auth': adminToken } }
      )

      if (!response.ok) throw new Error('Export failed')

      const disposition = response.headers.get('Content-Disposition')
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'shopkarro-orders.xlsx'
      const blob = await response.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      onClose()
    } catch (err) {
      console.error('Custom export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const presets: { key: DatePreset; label: string }[] = [
    { key: 'today',         label: 'Today' },
    { key: 'week',          label: 'This Week' },
    { key: 'month',         label: 'This Month' },
    { key: 'last_month',    label: 'Last Month' },
    { key: 'last_3_months', label: 'Last 3 Months' },
    { key: 'all',           label: 'All Time' },
  ]

  const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] font-medium text-[#1C1410]">{label}</span>
      <button
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-[#783A3A]' : 'bg-[#D4CCC2]'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-[4px] shadow-2xl border border-[#E8E2D9] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D9] bg-[#FAF7F4]">
          <div>
            <h2 className="font-heading font-bold text-[18px] text-[#1C1410] uppercase tracking-widest">
              Custom Export
            </h2>
            <p className="text-[11px] text-[#6B6058] mt-0.5 font-body">
              Choose what to include in your Excel export
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B6058] hover:text-[#1C1410] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Section 1: Date Range */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#6B6058] mb-3">Date Range</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full border transition-all ${
                    activePreset === p.key
                      ? 'bg-[#783A3A] text-white border-[#783A3A]'
                      : 'bg-white text-[#6B6058] border-[#D4CCC2] hover:border-[#783A3A]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#6B6058] uppercase tracking-wider block mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setActivePreset('all') }}
                  className="w-full border border-[#D4CCC2] rounded-[2px] px-3 py-2 text-[13px] text-[#1C1410] focus:border-[#783A3A] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6B6058] uppercase tracking-wider block mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setActivePreset('all') }}
                  className="w-full border border-[#D4CCC2] rounded-[2px] px-3 py-2 text-[13px] text-[#1C1410] focus:border-[#783A3A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Order Status */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#6B6058] mb-3">Order Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(s)}
                    onChange={() => toggleStatus(s)}
                    className="w-4 h-4 accent-[#783A3A] rounded-sm border-[#D4CCC2]"
                  />
                  <span className="text-[12px] text-[#1C1410] capitalize font-medium group-hover:text-[#783A3A] transition-colors">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Sheets to Include */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#6B6058] mb-1">Sheets to Include</p>
            <div className="border border-[#E8E2D9] rounded-[2px] px-4 divide-y divide-[#E8E2D9]">
              <Toggle on={includeOrders}  onToggle={() => setIncludeOrders(v => !v)}  label="Orders sheet" />
              <Toggle on={includeItems}   onToggle={() => setIncludeItems(v => !v)}   label="Order Items sheet" />
              <Toggle on={includeSummary} onToggle={() => setIncludeSummary(v => !v)} label="Summary sheet" />
            </div>
          </div>

          {/* Section 4: Collapsible Optional Columns */}
          <div>
            <button
              onClick={() => setColsExpanded(v => !v)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-[#6B6058] w-full"
            >
              Optional Columns
              {colsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {colsExpanded && (
              <div className="mt-3 grid grid-cols-2 gap-2 pl-1">
                {['Email', 'Internal Note', 'Order Source', 'Delivery Address'].map(col => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={optionalCols.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="w-4 h-4 accent-[#783A3A] rounded-sm border-[#D4CCC2]" 
                    />
                    <span className="text-[12px] text-[#1C1410] font-medium group-hover:text-[#783A3A] transition-colors">{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E2D9] bg-[#FAF7F4] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border border-[#D4CCC2] text-[#6B6058] rounded-[2px] hover:border-[#1C1410] hover:text-[#1C1410] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-[#783A3A] text-white rounded-[2px] hover:bg-[#632f2f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {exporting
              ? <><Loader2 size={13} className="animate-spin" /> Exporting...</>
              : <><FileSpreadsheet size={13} /> Export Excel</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
