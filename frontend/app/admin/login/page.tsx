'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (email.trim().toLowerCase() === 'admin@shopkarro.com' && password.trim() === 'shopkarro2025') {
        localStorage.setItem('admin_token', 'shopkarro_admin_secure_v1_2025')
        document.cookie = "admin_auth=true; path=/;"
        router.push('/admin')
      } else {
        throw new Error('Credential mismatch detected.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center p-8 font-body text-left">
      <div className="max-w-md w-full relative z-10">
        
        {/* LOGO AREA */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-10 group">
            <span className="text-[42px] font-heading font-bold text-[#1C1410] uppercase tracking-[12px] transition-all group-hover:tracking-[16px]">SHOPKARRO</span>
          </Link>
          <div className="h-px bg-[#1C1410]/10 w-24 mx-auto mb-6" />
          <h1 className="text-[11px] font-bold text-[#6B6058] uppercase tracking-[5px] opacity-60">
            Admin Panel Access
          </h1>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-0 p-12 shadow-[0_40px_100px_rgba(28,20,16,0.08)] border border-[#E8E2D9]">
          <h2 className="text-[20px] font-bold text-[#1C1410] mb-12 font-heading uppercase tracking-[4px]">Sign In</h2>
          
          <form onSubmit={handleLogin} className="space-y-10">
            <div>
              <label className="block text-[10px] font-bold text-[#6B6058] mb-4 uppercase tracking-[2px] opacity-40">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopkarro.com"
                className="w-full border-b border-[#D4CCC2] bg-transparent rounded-0 px-0 py-4 text-[14px] focus:border-[#1C1410] outline-none transition-all placeholder:opacity-20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B6058] mb-4 uppercase tracking-[2px] opacity-40">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-[#D4CCC2] bg-transparent rounded-0 px-0 py-4 text-[14px] focus:border-[#1C1410] outline-none transition-all placeholder:opacity-20"
              />
            </div>

            {error && (
              <div className="bg-white text-[#DC2626] py-4 border-l-2 border-l-[#DC2626] px-4 text-[11px] font-bold uppercase tracking-[1px] flex items-center gap-3">
                <X className="w-4 h-4" /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1C1410] text-white py-5 rounded-0 font-bold uppercase tracking-[4px] text-[12px] hover:bg-[#33221b] transition-all shadow-2xl active:scale-95 disabled:opacity-30"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-[#FAF7F4] text-center">
             <p className="text-[#6B6058] text-[9px] font-bold uppercase tracking-[2px] opacity-30 leading-relaxed max-w-[240px] mx-auto">
               Authorized access only. Unauthorized attempts will be logged.
             </p>
          </div>
        </div>

        {/* FOOTER LINK */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-[10px] font-bold text-[#6B6058] uppercase tracking-[3px] opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Return to Store
          </Link>
        </div>

      </div>
    </div>
  )
}
