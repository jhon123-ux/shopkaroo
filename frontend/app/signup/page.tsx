'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ArrowRight, Link2 } from 'lucide-react'

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
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20 font-body transition-colors duration-300">
      <div className="bg-bg-white rounded-0 p-10 md:p-14 max-w-xl w-full border border-border shadow-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold text-text font-heading block mb-8">
            Shopkarro
          </Link>
          <h1 className="text-[32px] font-bold text-text font-heading mb-3">
            Join the Collection
          </h1>
          <p className="text-text-muted text-[14px] uppercase tracking-[3px] font-semibold opacity-60">
            Create Your Account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-bold uppercase tracking-wide rounded-[2px] p-4 mb-8 animate-shake text-center transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] font-body">Full Name</label>
            <input 
              required
              type="text"
              placeholder="e.g. Ali Ahmed"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body text-text placeholder:opacity-30"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] font-body">Email Address</label>
            <input 
              required
              type="email"
              placeholder="ali@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body text-text placeholder:opacity-30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] font-body">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8+ characters"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body text-text placeholder:opacity-30 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 hover:opacity-100 transition-all"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px] font-body">Confirm</label>
              <div className="relative">
                <input 
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat code"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-surface border border-border-input rounded-[3px] px-5 py-4 text-[15px] focus:border-primary outline-none transition-all font-body text-text placeholder:opacity-30 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 hover:opacity-100 transition-all"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-[3px] font-bold font-body text-[14px] uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
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
        <div className="bg-surface border border-border rounded-[2px] p-6 mt-10 transition-colors">
          <p className="text-text-muted text-[13px] font-body flex gap-4 leading-relaxed">
            <Link2 className="w-5 h-5 opacity-40 shrink-0 mt-0.5" />
            <span>
              <strong className="text-text block mb-1 uppercase tracking-wider text-[11px]">Sync Your Orders</strong> 
              Sign up with the email used during checkout to automatically sync your order history with this account.
            </span>
          </p>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-12 pt-8 border-t border-border transition-colors">
          <p className="text-[12px] text-text-muted font-bold uppercase tracking-wider">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline ml-2 inline-flex items-center gap-1">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
