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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="bg-bg-white rounded-2xl p-8 max-w-md w-full border border-border shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-primary font-extrabold text-2xl mb-2 font-heading">
            Shopkarro
          </p>
          <h1 className="text-2xl font-extrabold text-text font-heading">
            Forgot password?
          </h1>
          <p className="text-text-muted text-sm mt-1">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'
          } border text-sm rounded-xl p-4 mb-6 animate-slideUp flex items-center gap-2 transition-colors`}>
            {message.type === 'success' && <Mail className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-text mb-2">Email Address</label>
            <input 
              required
              type="email"
              placeholder="ahmed@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-border-input rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-text"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold font-heading text-base hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
          <Link href="/login" className="text-sm text-text-muted hover:text-primary transition-colors font-medium flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
