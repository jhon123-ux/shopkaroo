'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Pencil, 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react'
import Link from 'next/link'

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Other'
]

export default function CreateOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false)
  const [lookupMessage, setLookupMessage] = useState<{ text: string, type: 'success' | 'info' | 'error' } | null>(null)
  
  // Warnings from Duplicate Flow
  const [warnings, setWarnings] = useState<string[]>([])

  // Section 1: Customer Details
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    city:PAKISTAN_CITIES[0],
    address: '',
    user_id: ''
  })

  // Section 2: Order Items
  const [items, setItems] = useState<any[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Section 3: Pricing & Delivery
  const [pricing, setPricing] = useState({
    discount_amount: 0,
    discount_percentage: 0,
    delivery_charge: 0,
    payment_method: 'COD'
  })

  // Section 4: Confirmation
  const [status, setStatus] = useState('pending')
  const [sendEmail, setSendEmail] = useState(false)
  const [internalNote, setInternalNote] = useState('')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('skr_admin_token') : ''

  // Pre-fill from Duplicate Draft
  useEffect(() => {
    const draftStr = sessionStorage.getItem('duplicate_order_draft')
    if (draftStr) {
      try {
        const { draft } = JSON.parse(draftStr)
        setCustomer(draft.customer)
        
        // Filter out deleted products for duplicate items
        const validItems = draft.items
          .filter((i: any) => i.product_exists)
          .map((i: any) => ({
            product_id: i.product_id,
            name: i.product_name,
            price: i.current_price, // Use current catalog price
            quantity: i.quantity,
            image_url: i.product_image,
            stock: i.stock_available,
            override_price: i.price_changed ? i.original_price : undefined // Keep original if admin wants to honor it
          }))
        
        setItems(validItems)
        setPricing(prev => ({
          ...prev,
          discount_amount: draft.pricing.discount_amount,
          delivery_charge: draft.pricing.delivery_charge,
          payment_method: draft.payment_method
        }))
        setWarnings(draft.warnings || [])
        sessionStorage.removeItem('duplicate_order_draft')
      } catch (e) {
        console.error('Failed to parse draft')
      }
    }
  }, [])

  // Live Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.override_price ?? item.price) * item.quantity, 0)
  
  // Sync Discount Amount/Percentage
  const updateDiscount = (val: number, type: 'amt' | 'pct') => {
    if (type === 'amt') {
      const pct = subtotal > 0 ? (val / subtotal) * 100 : 0
      setPricing(prev => ({ ...prev, discount_amount: val, discount_percentage: Number(pct.toFixed(2)) }))
    } else {
      const amt = (val / 100) * subtotal
      setPricing(prev => ({ ...prev, discount_percentage: val, discount_amount: Number(amt.toFixed(0)) }))
    }
  }

  const total = subtotal - pricing.discount_amount + pricing.delivery_charge

  // Customer Lookup
  const handleCustomerSearch = async () => {
    if (!customer.phone || customer.phone.length < 10) return
    setCustomerLookupLoading(true)
    setLookupMessage(null)
    try {
      const res = await fetch(`${apiUrl}/api/orders/admin/customers/search?phone=${customer.phone}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const data = await res.json()
      if (res.ok) {
        setCustomer({ ...data.customer, phone: customer.phone })
        setLookupMessage({ text: 'Customer Found — Record sync successful', type: 'success' })
      } else {
        setLookupMessage({ text: 'New Customer — Manual entry required', type: 'info' })
      }
    } catch (err) {
      setLookupMessage({ text: 'Lookup failed', type: 'error' })
    } finally {
      setCustomerLookupLoading(false)
    }
  }

  // Product Search (Debounced)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (productSearch.length < 2) {
      setSearchResults([])
      return
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`${apiUrl}/api/products?search=${productSearch}`)
        const data = await res.json()
        setSearchResults(data.data || [])
        setShowSearchResults(true)
      } catch (e) {
        console.error('Search error')
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }, [productSearch])

  const addProduct = (p: any) => {
    const existing = items.find(i => i.product_id === p.id)
    if (existing) {
      setItems(items.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setItems([...items, {
        product_id: p.id,
        name: p.name,
        price: p.price_pkr,
        quantity: 1,
        image_url: p.images?.[0] || null,
        stock: p.stock_qty || 0
      }])
    }
    setProductSearch('')
    setShowSearchResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return alert('Please add at least one item')
    
    setLoading(true)
    try {
      const payload = {
        customer,
        items,
        pricing,
        status,
        internal_note: internalNote,
        send_email: sendEmail,
        order_source: warnings.length > 0 ? "admin_duplicate" : "admin_manual"
      }

      const res = await fetch(`${apiUrl}/api/orders/admin/orders/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      router.push(`/admin/orders`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 font-body animate-fadeIn">
      
      {/* Warning Banners */}
      {warnings.length > 0 && (
        <div className="mb-8 space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="bg-amber-50 border-l-4 border-amber-400 p-4 flex items-center justify-between text-amber-800 text-[13px] font-bold uppercase tracking-widest leading-none">
              <span className="flex items-center gap-3">
                <AlertTriangle size={16} /> {w}
              </span>
              <button onClick={() => setWarnings(warnings.filter((_, idx) => idx !== i))}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link href="/admin/orders" className="w-12 h-12 flex items-center justify-center bg-white border border-border hover:bg-surface transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold font-heading text-text uppercase tracking-widest leading-none">Create New Order</h1>
            <p className="text-[11px] font-bold text-text-muted mt-2 uppercase tracking-[3px] opacity-40">Internal Transaction Registry</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Flow */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section 1: Customer */}
          <section className="bg-white border border-border p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3 mb-10 pb-5 border-b border-surface">
              <User size={18} className="text-primary" />
              <h2 className="text-[14px] font-bold uppercase tracking-[4px] text-text">Customer Provenance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Phone Identifier</label>
                <div className="flex gap-4">
                  <input 
                    required
                    type="text" 
                    value={customer.phone}
                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                    placeholder="03XXXXXXXXX"
                    className="flex-1 bg-surface border border-border-input px-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                  />
                  <button 
                    type="button"
                    onClick={handleCustomerSearch}
                    disabled={customerLookupLoading}
                    className="bg-primary text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {customerLookupLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} Search
                  </button>
                </div>
                {lookupMessage && (
                  <p className={`mt-3 text-[12px] font-bold italic ${lookupMessage.type === 'success' ? 'text-green-600' : lookupMessage.type === 'error' ? 'text-red-500' : 'text-text-muted opacity-60'}`}>
                    • {lookupMessage.text}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Full Legal Name</label>
                <input 
                  required
                  type="text" 
                  value={customer.name}
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                  className="w-full bg-surface border border-border-input px-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Email Manifest (Optional)</label>
                <input 
                  type="email" 
                  value={customer.email}
                  onChange={e => setCustomer({...customer, email: e.target.value})}
                  placeholder="customer@domain.com"
                  className="w-full bg-surface border border-border-input px-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Geographic Territory</label>
                <select 
                  value={customer.city}
                  onChange={e => setCustomer({...customer, city: e.target.value})}
                  className="w-full bg-surface border border-border-input px-5 py-4 text-[13px] font-bold uppercase tracking-[2px] outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Full Delivery Address</label>
                <textarea 
                  required
                  rows={3}
                  value={customer.address}
                  onChange={e => setCustomer({...customer, address: e.target.value})}
                  className="w-full bg-surface border border-border-input px-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Items */}
          <section className="bg-white border border-border p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-5 border-b border-surface">
              <ShoppingBag size={18} className="text-primary" />
              <h2 className="text-[14px] font-bold uppercase tracking-[4px] text-text">Inventory Allocation</h2>
            </div>

            {/* Product Search */}
            <div className="relative mb-10">
              <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Search Catalog</label>
              <div className="relative">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text opacity-20" />
                <input 
                  type="text" 
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Enter product title or SKU..."
                  className="w-full bg-surface border border-border-input rounded-0 pl-14 pr-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                />
                {searchLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-border shadow-2xl max-h-[400px] overflow-y-auto">
                  {searchResults.map(p => (
                    <button 
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-surface transition-colors border-b border-surface text-left"
                    >
                      <div className="w-12 h-12 bg-surface shrink-0 overflow-hidden">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-text uppercase tracking-wider">{p.name}</p>
                        <p className="text-[11px] text-text-muted mt-1 font-heading">Rs {p.price_pkr.toLocaleString()} • Stock: {p.stock_qty || 0}</p>
                      </div>
                      <div className="text-primary">
                        <Plus size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Items List */}
            <div className="space-y-6">
              {items.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-surface opacity-30">
                  <p className="text-[11px] font-bold uppercase tracking-[4px]">Registry Empty</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-6 p-6 border border-surface bg-bg-white relative group">
                    <div className="w-20 h-20 bg-surface shrink-0 overflow-hidden shadow-sm">
                      {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[14px] font-bold text-text uppercase font-heading tracking-widest">{item.name}</p>
                          <div className="flex items-center gap-3 mt-2">
                             {item.stock === 0 && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 font-bold uppercase tracking-widest">Low Stock</span>}
                             <p className="text-[11px] font-bold uppercase text-text-muted opacity-40">Stock: {item.stock || 0}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-8 pt-4 border-t border-surface/50">
                        {/* Quantity */}
                        <div className="flex items-center gap-4 bg-surface px-4 py-2">
                          <button type="button" onClick={() => setItems(items.map((it, i) => i === idx ? {...it, quantity: Math.max(1, it.quantity - 1)} : it))} className="hover:text-primary transition-colors"><Minus size={14} /></button>
                          <span className="text-[13px] font-bold w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => setItems(items.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it))} className="hover:text-primary transition-colors"><Plus size={14} /></button>
                        </div>

                        {/* Price Overrides */}
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40 mb-1">Unit Value</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-bold font-heading text-text">Rs {item.price.toLocaleString()}</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const val = prompt('Enter manual price override (Rs)', item.override_price ?? item.price)
                                    if (val !== null) {
                                      setItems(items.map((it, i) => i === idx ? {...it, override_price: Number(val)} : it))
                                    }
                                  }}
                                  className="text-primary hover:bg-primary/5 p-1 transition-all"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                           </div>

                           <div className="text-right border-l border-surface pl-8">
                             <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40 mb-1">Line Total</p>
                             <p className="text-[16px] font-bold font-heading text-primary">Rs {((item.override_price ?? item.price) * item.quantity).toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Calculations & Submit */}
        <div className="lg:col-span-1 space-y-10">
          
          {/* Section 3: Pricing */}
          <section className="bg-white border border-border p-10 shadow-sm relative sticky top-10">
            <div className="absolute top-0 right-0 w-full h-1 bg-primary" />
            
            <div className="flex items-center gap-3 mb-10">
              <CreditCard size={18} className="text-primary" />
              <h2 className="text-[14px] font-bold uppercase tracking-[4px] text-text">Fiscal Manifest</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Settlement Method</label>
                <select 
                  value={pricing.payment_method}
                  onChange={e => setPricing({...pricing, payment_method: e.target.value})}
                  className="w-full bg-surface border border-border-input px-5 py-4 text-[13px] font-bold uppercase tracking-[2px] outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="VALUATION_ONLY">Registry Valuation Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Logistics Surcharge (Rs)</label>
                <input 
                  type="number" 
                  value={pricing.delivery_charge}
                  onChange={e => setPricing({...pricing, delivery_charge: Number(e.target.value)})}
                  className="w-full bg-surface border border-border-input px-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Discount Concessions</label>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-text opacity-30 mb-2">Amount Rs</label>
                  <input 
                    type="number" 
                    value={pricing.discount_amount}
                    onChange={e => updateDiscount(Number(e.target.value), 'amt')}
                    className="w-full bg-surface border border-border-input px-4 py-3 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-text opacity-30 mb-2">Percentage %</label>
                  <input 
                    type="number" 
                    value={pricing.discount_percentage}
                    onChange={e => updateDiscount(Number(e.target.value), 'pct')}
                    className="w-full bg-surface border border-border-input px-4 py-3 text-[14px] outline-none focus:border-primary transition-all font-body text-text"
                  />
                </div>
              </div>

              {/* Live Summary */}
              <div className="pt-10 mt-10 border-t border-surface space-y-4">
                <div className="flex justify-between items-center text-[13px] text-text-muted uppercase tracking-widest font-bold">
                   <span>Gross Subtotal</span>
                   <span>Rs {subtotal.toLocaleString()}</span>
                </div>
                {pricing.discount_amount > 0 && (
                   <div className="flex justify-between items-center text-[13px] text-amber-600 uppercase tracking-widest font-bold">
                      <span>Inventory Discount</span>
                      <span>− Rs {pricing.discount_amount.toLocaleString()}</span>
                   </div>
                )}
                <div className="flex justify-between items-center text-[13px] text-text-muted uppercase tracking-widest font-bold">
                   <span>Logistics</span>
                   <span>+ Rs {pricing.delivery_charge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-surface text-text">
                   <span className="text-[12px] font-black uppercase tracking-[4px]">Final Settlement</span>
                   <span className="text-[28px] font-bold font-heading text-primary leading-none">Rs {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Confirmation Controls */}
              <div className="pt-10 space-y-8">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Registry Status</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-surface border border-border-input px-5 py-4 text-[13px] font-bold uppercase tracking-[2px] outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed / Processing</option>
                    <option value="shipped">Despatched</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pointer-events-auto">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-[2px] text-text">Email Notification</span>
                      <span className="text-[10px] text-text-muted opacity-40 uppercase tracking-widest mt-1">Status notification alert</span>
                   </div>
                   <button 
                     type="button" 
                     role="switch"
                     onClick={() => setSendEmail(!sendEmail)}
                     disabled={!customer.email}
                     className={`w-12 h-6 rounded-full relative transition-all duration-300 ${sendEmail ? 'bg-primary' : 'bg-surface border border-border-input'} ${!customer.email ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer animate-scaleIn'}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${sendEmail ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[2px] text-text-muted mb-3">Internal Memo</label>
                  <textarea 
                    rows={2}
                    value={internalNote}
                    onChange={e => setInternalNote(e.target.value)}
                    placeholder="Staff-only observations..."
                    className="w-full bg-surface border border-border-input px-5 py-4 text-[14px] outline-none focus:border-primary transition-all font-body text-text resize-none"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full bg-primary text-white py-6 rounded-0 text-[13px] font-bold uppercase tracking-[3px] shadow-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                   >
                     {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} 
                     Finalize Transaction
                   </button>
                   <Link 
                     href="/admin/orders"
                     className="w-full bg-white border border-border text-text-muted py-5 text-center text-[11px] font-bold uppercase tracking-[3px] hover:bg-surface transition-colors"
                   >
                     Discard Registry
                   </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
