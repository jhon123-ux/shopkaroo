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
    <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-[#E5E0F5] shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#6C3FC5] font-extrabold text-2xl mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Shopkaroo
          </p>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Create your account
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Track orders and get delivery updates
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-xl p-3 mb-6 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Full Name</label>
            <input 
              required
              type="text"
              placeholder="Ahmed Khan"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none transition-shadow"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Email Address</label>
            <input 
              required
              type="email"
              placeholder="ahmed@gmail.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none transition-shadow"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Password</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none transition-shadow pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#6C3FC5] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.223 3.463.63m1.42 1.42a4.001 4.001 0 115.656 5.656l-9.192 9.192" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Confirm Password</label>
            <div className="relative">
              <input 
                required
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none transition-shadow pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#6C3FC5] transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.223 3.463.63m1.42 1.42a4.001 4.001 0 115.656 5.656l-9.192 9.192" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#6C3FC5] text-white py-3.5 rounded-xl font-bold font-heading text-base hover:bg-[#5530A8] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mt-6">
          <p className="text-[#166534] text-xs font-medium flex gap-2">
            <span className="text-sm">🔗</span>
            <span>
              <strong>Have existing orders?</strong> Sign up with the same email you used at checkout — your orders will appear automatically in My Orders.
            </span>
          </p>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-[#6B7280] mt-8 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6C3FC5] hover:underline font-bold">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
