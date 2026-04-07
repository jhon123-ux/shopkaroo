'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/lib/authStore'

export default function ProfilePage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile')
    }
  }, [user, loading, router])

  // Fetch current profile data
  useEffect(() => {
    if (!user) return
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setFormData({
          fullName: data.full_name || '',
          phone: data.phone || '',
          city: data.city || '',
          address: data.address || ''
        })
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, initialization happens on first save
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || ''
        }))
      }
    }
    
    fetchProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      
      setMessage({ type: 'success', text: 'SUCCESS: Profile updated successfully.' })
      
      // Also update auth metadata if name changed
      await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      })
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
      // Clear message after 5s
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#783A3A] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] py-16 md:py-24 font-body">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-[40px] font-bold text-[#1C1410] font-heading mb-4">
            My Account
          </h1>
          <p className="text-[#6B6058] text-[14px] uppercase tracking-[3px] font-semibold opacity-60">
            Personal Details & Shipping Defaults
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-0 border border-[#E8E2D9] p-10 md:p-14 shadow-sm relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            
            {/* Success/Error Message */}
            {message && (
              <div className={`${
                message.type === 'success' ? 'bg-[#EBF7F0] border-[rgba(45,106,79,0.1)] text-[#2D6A4F]' : 'bg-[#FEF2F2] border-red-100 text-[#DC2626]'
              } border text-[12px] font-bold uppercase tracking-wide rounded-[2px] p-5 animate-slideUp text-center`}>
                {message.text}
              </div>
            )}

            {/* Email (Read Only) */}
            <div className="bg-[#FAF7F4] rounded-0 p-5 border border-[#E8E2D9] text-left">
              <label className="block text-[10px] font-bold text-[#6B6058] uppercase tracking-[2px] mb-2 opacity-60">
                Registered Email
              </label>
              <p className="text-[15px] font-bold text-[#1C1410] font-heading">
                {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] text-left">Full Name</label>
                <input 
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] text-left">Phone Number</label>
                <input 
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body font-mono tracking-wider"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] text-left">Default Shipping City</label>
              <div className="relative">
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all bg-white appearance-none pr-12 cursor-pointer font-body"
                >
                  <option value="">Select city</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#1C1410] opacity-40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] text-left">Default Shipping Address</label>
              <textarea 
                rows={4}
                placeholder="Complete address (House, Street, Area...)"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#783A3A] text-white py-5 rounded-[3px] font-bold font-body text-[14px] uppercase tracking-[2px] transition-all hover:bg-[#5B2C2C] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Sychronizing...
                  </>
                ) : (
                  <>
                    <span>Update Collection Profile</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
