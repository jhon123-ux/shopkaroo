'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Successful signup
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center px-6 py-20 font-body">
      <div className="bg-white rounded-0 p-10 md:p-14 max-w-xl w-full border border-[#E8E2D9] shadow-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold italic text-[#1C1410] font-heading block mb-8">
            Shopkarro
          </Link>
          <h1 className="text-[32px] font-bold text-[#1C1410] font-heading mb-3">
            Join the Collection
          </h1>
          <p className="text-[#6B6058] text-[14px] uppercase tracking-[3px] font-semibold opacity-60">
            Create Your Account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FEF2F2] border border-red-100 text-[#DC2626] text-[12px] font-bold uppercase tracking-wide rounded-[2px] p-4 mb-8 animate-shake text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Full Name</label>
            <input 
              required
              type="text"
              placeholder="e.g. Ali Ahmed"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body placeholder:opacity-30"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Email Address</label>
            <input 
              required
              type="email"
              placeholder="ali@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body placeholder:opacity-30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8+ characters"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body placeholder:opacity-30 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6058] opacity-40 hover:opacity-100 transition-all"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.223 3.463.63m1.42 1.42a4.001 4.001 0 115.656 5.656l-9.192 9.192" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body">Confirm</label>
              <div className="relative">
                <input 
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat code"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#783A3A] outline-none transition-all font-body placeholder:opacity-30 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6058] opacity-40 hover:opacity-100 transition-all"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.223 3.463.63m1.42 1.42a4.001 4.001 0 115.656 5.656l-9.192 9.192" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#783A3A] text-white py-5 rounded-[3px] font-bold font-body text-[14px] uppercase tracking-[2px] transition-all hover:bg-[#5B2C2C] shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="bg-[#FAF7F4] border border-[#E8E2D9] rounded-[2px] p-6 mt-10">
          <p className="text-[#6B6058] text-[13px] font-body flex gap-4 leading-relaxed">
            <span className="text-lg opacity-40">🔗</span>
            <span>
              <strong className="text-[#1C1410] block mb-1 uppercase tracking-wider text-[11px]">Sync Your Orders</strong> 
              Sign up with the email used during checkout to automatically sync your order history with this account.
            </span>
          </p>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-12 pt-8 border-t border-[#FAF7F4]">
          <p className="text-[12px] text-[#6B6058] font-bold uppercase tracking-wider">
            Already have an account?{' '}
            <Link href="/login" className="text-[#783A3A] hover:underline ml-2">
              Sign In →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
