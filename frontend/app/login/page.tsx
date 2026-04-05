'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#4A2C6E] border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) throw signInError

      if (data.user) {
        const redirectTo = searchParams.get('redirect') || '/'
        router.push(redirectTo)
      }
    } catch (err: any) {
      setError('The email or password provided is incorrect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center px-6 py-20 font-body">
      <div className="bg-white rounded-0 p-10 md:p-14 max-w-lg w-full border border-[#E8E2D9] shadow-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold italic text-[#1C1410] font-heading block mb-8">
            Shopkaroo
          </Link>
          <h1 className="text-[32px] font-bold text-[#1C1410] font-heading mb-3">
            Welcome Back
          </h1>
          <p className="text-[#6B6058] text-[14px] uppercase tracking-[3px] font-semibold opacity-60">
            Access Your Collection
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FEF2F2] border border-red-100 text-[#DC2626] text-[12px] font-bold uppercase tracking-wide rounded-[2px] p-4 mb-8 animate-shake text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1410] mb-3 uppercase tracking-[2px] font-body text-left">Email Address</label>
            <input 
              required
              type="email"
              placeholder="e.g. jhon@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#4A2C6E] outline-none transition-all font-body placeholder:opacity-30"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[11px] font-bold text-[#1C1410] uppercase tracking-[2px] font-body">Password</label>
              <Link href="/forgot-password" title="Forgot Password" className="text-[#4A2C6E] text-[10px] font-bold uppercase tracking-widest border-b border-transparent hover:border-[#4A2C6E] transition-all">
                Reset?
              </Link>
            </div>
            <div className="relative">
              <input 
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full border border-[#D4CCC2] rounded-[3px] px-5 py-4 text-[15px] focus:border-[#4A2C6E] outline-none transition-all font-body placeholder:opacity-30 pr-12"
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

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4A2C6E] text-white py-5 rounded-[3px] font-bold font-body text-[14px] uppercase tracking-[2px] transition-all hover:bg-[#3A1F57] shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-12 bg-[#FAF7F4] p-4 rounded-[2px] border border-[#E8E2D9]">
          <p className="text-[12px] text-[#6B6058] font-bold uppercase tracking-wider">
            New to Shopkaroo?{' '}
            <Link href="/signup" className="text-[#4A2C6E] hover:underline ml-2">
              Create Account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
