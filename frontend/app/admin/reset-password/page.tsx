'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const getStrength = (p: string) => {
    if (!p) return null
    if (p.length < 8) return { label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' }
    const hasUpper = /[A-Z]/.test(p)
    const hasNum = /[0-9]/.test(p)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p)
    if (hasUpper && hasNum && hasSpecial) return { label: 'Strong', color: 'text-green-600', bg: 'bg-green-600' }
    return { label: 'Fair', color: 'text-amber-500', bg: 'bg-amber-500' }
  }

  const strength = getStrength(password)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      
      if (updateError) {
        if (updateError.message.includes('expired') || updateError.message.includes('already used')) {
          throw new Error('This reset link has expired. Please request a new one.')
        }
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-border p-10 md:p-14 shadow-sm text-center animate-fadeIn">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-[32px] font-bold font-heading text-text mb-4">Password Updated</h1>
          <p className="text-text-muted text-[15px] font-body mb-4 leading-relaxed">
            Your security registry has been updated successfully.
          </p>
          <p className="text-primary text-[13px] font-bold uppercase tracking-widest animate-pulse">
            Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-border p-10 md:p-14 shadow-sm animate-fadeIn">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-[32px] font-bold font-heading text-text mb-2">Set New Password</h1>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[4px] opacity-60">
            Secure your administrative access
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-[3px] flex gap-3 text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            <div className="flex flex-col gap-2">
               <p className="text-[13px] font-medium leading-relaxed">{error}</p>
               {error.includes('expired') && (
                 <Link href="/admin/forgot-password" size="sm" className="text-[11px] font-bold uppercase underline">
                    Request new link
                 </Link>
               )}
            </div>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-8">
          <div>
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px]">New Password</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text opacity-30">
                <Lock size={18} />
              </span>
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border-input rounded-[3px] pl-14 pr-14 py-4 text-[15px] outline-none focus:border-primary transition-all font-body text-text" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-text opacity-40 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {strength && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${strength.bg} transition-all duration-500`} style={{ width: strength.label === 'Strong' ? '100%' : strength.label === 'Fair' ? '66%' : '33%' }} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px]">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text opacity-30">
                <Lock size={18} />
              </span>
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border-input rounded-[3px] pl-14 pr-5 py-4 text-[15px] outline-none focus:border-primary transition-all font-body text-text" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-[3px] text-[13px] font-bold uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-xl active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? 'Updating Registry...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
