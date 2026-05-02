'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

    try {
      const res = await fetch(`${backendUrl}/api/admin/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send reset link')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
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
          <h1 className="text-[32px] font-bold font-heading text-text mb-4">Check your email</h1>
          <p className="text-text-muted text-[15px] font-body mb-10 leading-relaxed">
            We've sent a password reset link to <span className="font-bold text-text">{email}</span>. Please check your inbox and follow the instructions.
          </p>
          <Link href="/admin/login" className="w-full bg-primary text-white py-5 rounded-[3px] text-[13px] font-bold uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-xl active:scale-95 flex items-center justify-center gap-3">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-border p-10 md:p-14 shadow-sm animate-fadeIn">
        
        <Link href="/admin/login" className="inline-flex items-center gap-2 text-text-muted text-[11px] font-bold uppercase tracking-[2px] hover:text-primary transition-colors mb-12">
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-[32px] font-bold font-heading text-text mb-2">Reset Password</h1>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[4px] opacity-60">
            Enter your admin email to proceed
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-[3px] flex gap-3 text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-[13px] font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px]">Admin Email</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text opacity-30">
                <Mail size={18} />
              </span>
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@shopkarro.com"
                className="w-full bg-surface border border-border-input rounded-[3px] pl-14 pr-5 py-4 text-[15px] outline-none focus:border-primary transition-all font-body text-text" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-[3px] text-[13px] font-bold uppercase tracking-[2px] transition-all hover:bg-primary-dark shadow-xl active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? 'Processing...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
