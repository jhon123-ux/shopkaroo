'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 🔐 SECURE AUTHENTICATION: Using Supabase Auth instead of hardcoded strings
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (authError) throw authError

      // Verify the user is an admin (Optional but recommended: check metadata or email)
      // Since this is the admin login page, we can enforce a specific email here 
      // or rely on RLS/Backend checks. 
      const ADMIN_EMAIL = 'admin@shopkarro.com' 
      
      if (data.user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut()
        throw new Error('Access denied. This account does not have administrative privileges.')
      }

      // Store token securely. 
      // Note: Low Fix 8 recommends httpOnly cookies, which requires a custom API route.
      // For now, we use the Supabase session which is already managed securely by the client.
      const session = data.session
      if (session) {
        localStorage.setItem('admin_token', session.access_token)
        router.push('/admin')
      }
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
            <label className="block text-[11px] font-bold text-text mb-3 uppercase tracking-[2px]">Security Code</label>
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
        </div>
      </div>
    </div>
  )
}
