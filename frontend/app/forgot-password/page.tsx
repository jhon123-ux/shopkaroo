'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email for a reset link'
      })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to send reset link'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-[#E5E0F5] shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#783A3A] font-extrabold text-2xl mb-2 font-heading">
            Shopkarro
          </p>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E] font-heading">
            Forgot password?
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`${
            message.type === 'success' ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
          } border text-sm rounded-xl p-4 mb-6 animate-slideUp flex items-center gap-2`}>
            {message.type === 'success' && <Mail className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-[#1A1A2E] mb-2">Email Address</label>
            <input 
              required
              type="email"
              placeholder="ahmed@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#E5E0F5] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#783A3A] outline-none transition-shadow"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#783A3A] text-white py-3.5 rounded-xl font-bold font-heading text-base hover:bg-[#5B2C2C] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-10">
          <Link href="/login" className="text-sm text-[#6B7280] hover:text-[#783A3A] transition-colors font-medium flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
