'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import useAdminAuthStore from '@/lib/adminAuthStore'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAdmin = useAdminAuthStore(state => state.setAdmin)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') window.alert('--- ATTEMPTING LOGIN ---')
    console.log('--- LOGIN ATTEMPT START ---')
    setLoading(true)
    setError(null)

    // Failsafe: Ensure we use the production API URL if env var is missing on the live site
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && apiUrl.includes('localhost')) {
      apiUrl = 'https://shopkaroo-production.up.railway.app'
    }

    console.log('Calling API URL:', apiUrl)

    try {
      // 🔐 SECURE AUTHENTICATION: Using httpOnly cookie via Backend API
      const res = await fetch(`${apiUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        credentials: 'include'
      })

      console.log('Response Status:', res.status)

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Access denied. Please check your administrative credentials.')
      }

      console.log('Login Response:', data)
      // Store admin data in Zustand (The JWT is securely stored in httpOnly cookie by the browser)
      setAdmin(data.admin)
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-border p-10 md:p-14 shadow-sm animate-fadeIn">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-[32px] font-bold font-heading text-text mb-2">Internal Access</h1>
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-[4px] opacity-60">
            Administrative Registry
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-[3px] flex gap-3 text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-[13px] font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px]">Admin Identifier</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text opacity-30">
                <User size={18} />
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

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[11px] font-bold text-text uppercase tracking-[2px]">Security Code</label>
              <Link href="/admin/forgot-password" className="text-[11px] font-bold text-primary uppercase tracking-[1px] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text opacity-30">
                <Lock size={18} />
              </span>
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            {loading ? 'Validating Registry...' : (
              <>
                Unseal Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-border">
          <Link href="/" className="text-text-muted text-[12px] font-bold uppercase tracking-widest hover:text-primary transition-colors inline-flex items-center gap-2">
            Return to Storefront
          </Link>
          <p className="text-[10px] text-text opacity-20 mt-6 tracking-[2px] uppercase font-bold">System v1.0.5</p>
        </div>
      </div>
    </div>
  )
}
