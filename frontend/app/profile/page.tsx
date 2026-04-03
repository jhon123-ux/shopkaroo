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
      
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' })
      
      // Also update auth metadata if name changed
      await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      })
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#6C3FC5] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF] py-12">
      <div className="max-w-2xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E]" style={{fontFamily:'Syne,sans-serif'}}>
            My Profile
          </h1>
          <p className="text-[#6B7280] mt-2">
            Manage your personal information and default shipping details
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-3xl border border-[#E5E0F5] p-8 md:p-10 shadow-xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C3FC5]/5 rounded-bl-full -z-0"></div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* Success/Error Message */}
            {message && (
              <div className={`${
                message.type === 'success' ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
              } border text-sm font-bold rounded-2xl p-5 animate-slideUp`}>
                {message.text}
              </div>
            )}

            {/* Email (Read Only) */}
            <div className="bg-[#F7F5FF] rounded-2xl p-4 border border-[#E5E0F5]/50">
              <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">
                Account Email
              </label>
              <p className="text-base font-bold text-[#1A1A2E]">
                {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Full Name</label>
                <input 
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full border border-[#E5E0F5] rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#6C3FC5]/10 focus:border-[#6C3FC5] outline-none transition-all font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Phone Number</label>
                <input 
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-[#E5E0F5] rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#6C3FC5]/10 focus:border-[#6C3FC5] outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Default City</label>
              <div className="relative">
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full border border-[#E5E0F5] rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#6C3FC5]/10 focus:border-[#6C3FC5] outline-none transition-all font-bold appearance-none bg-white pr-12 cursor-pointer"
                >
                  <option value="">Select your city</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6C3FC5]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Default Shipping Address</label>
              <textarea 
                rows={3}
                placeholder="House No, Street, Area..."
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full border border-[#E5E0F5] rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#6C3FC5]/10 focus:border-[#6C3FC5] outline-none transition-all font-medium resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#6C3FC5] text-white py-4 rounded-2xl font-bold font-heading text-lg hover:bg-[#5530A8] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-[#6C3FC5]/20 group"
              >
                {saving ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span>Save Profile</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
