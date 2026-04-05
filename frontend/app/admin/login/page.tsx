'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      // We verify credentials against authorized admin accounts.
      // In a production Supabase setup, use authenticated signIn methods.
      
      if (email === 'admin@shopkaroo.com' && password === 'shopkaroo2025') {
        localStorage.setItem('admin_token', 'shopkaroo_admin_access_token_v1')
        document.cookie = "admin_auth=true; path=/;"
        router.push('/admin')
      } else {
        throw new Error('Invalid email or password')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* LOGO AREA */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl text-[#6C3FC5]">🛋️</span>
            <span className="text-3xl font-heading font-extrabold text-[#1A1A2E]">Shopkaroo</span>
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A2E] opacity-70 uppercase tracking-widest font-mono">
            Admin Portal
          </h1>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(108,63,197,0.1)] border border-[#E5E0F5]">
          <h2 className="text-2xl font-black text-[#1A1A2E] mb-8 font-heading">Sign In</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1A1A2E] mb-2 font-mono uppercase tracking-tight">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopkaroo.com"
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A2E] mb-2 font-mono uppercase tracking-tight">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FC5] outline-none transition-shadow"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#6C3FC5] text-white py-4 rounded-xl font-black text-lg hover:bg-[#5530A8] transition-all shadow-xl shadow-[#6C3FC5]/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>

          <p className="mt-8 text-center text-[#6B7280] text-xs font-medium">
            Restricted access. Use your authorized shop credentials.
          </p>
        </div>

      </div>
    </div>
  )
}
