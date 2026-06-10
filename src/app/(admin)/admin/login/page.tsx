'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : authError.message)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f1813]">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-primary" aria-hidden="true">
              <path d="M12 2a9 9 0 11-4.5 16.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-semibold text-gray-900">Bright Smile Admin</h1>
          <p className="mt-1 font-body text-sm text-gray-500">Sign in to manage your clinic</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@brightsmile.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-heading text-xs font-semibold text-gray-700">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <p className="font-body text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Back to site */}
        <p className="mt-6 text-center font-body text-xs text-gray-400">
          <Link href="/" className="text-primary hover:underline underline-offset-2 font-medium">
            ← Back to Bright Smile website
          </Link>
        </p>

        <p className="mt-3 text-center font-body text-[0.6rem] text-gray-300">
          Admin access only · Bright Smile Dental Clinic
        </p>
      </div>
    </div>
  )
}
