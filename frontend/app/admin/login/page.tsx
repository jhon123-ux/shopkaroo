'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import useAdminAuthStore from '@/lib/adminAuthStore'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAdmin = useAdminAuthStore(state => state.setAdmin)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('SUBMIT FIRED', email, password)
    setLoading(true)
    setError(null)

    const apiUrl = 'https://shopkaroo-production.up.railway.app'

    try {
      const res = await fetch(`${apiUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        credentials: 'include'
      })

      console.log('FETCH DONE', res.status)

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || data.error || 'Login failed')
        setLoading(false)
        return
      }

      localStorage.setItem('skr_admin_token', data.token)
      document.cookie = `skr_admin_token=${data.token}; path=/; max-age=28800; SameSite=Lax`
      setAdmin(data.admin, data.token)
      window.location.href = '/admin'

    } catch (err: any) {
      setError('Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 p-10 shadow-sm">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} className="text-purple-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-500 text-sm">Shopkaroo Admin Panel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex gap-3 text-red-600">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopkarro.com"
                className="w-full border border-gray-300 rounded pl-12 pr-4 py-3 text-sm outline-none focus:border-purple-700 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/admin/forgot-password" className="text-xs text-purple-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded pl-12 pr-4 py-3 text-sm outline-none focus:border-purple-700 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 text-white py-3 rounded text-sm font-semibold hover:bg-purple-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  )
}
