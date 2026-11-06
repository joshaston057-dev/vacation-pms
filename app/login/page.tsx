'use client'

import { useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // RATE LIMITING STATE
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (isLockedOut) {
      setErrorMessage('⛔ Account temporarily locked due to multiple failed login attempts. Please reset your password or try again in 15 minutes.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Reset attempts on successful login
      setFailedAttempts(0)
      window.location.href = '/operations'
    } catch (err: any) {
      const newCount = failedAttempts + 1
      setFailedAttempts(newCount)

      if (newCount >= 5) {
        setIsLockedOut(true)
        setErrorMessage(
          '🚨 Too many invalid password attempts! For security, login is locked. Click "Forgot Password?" below to receive a secure recovery link.'
        )
      } else {
        setErrorMessage(
          `Invalid credentials. (${5 - newCount} attempt${5 - newCount === 1 ? '' : 's'} remaining before temporary security lock)`
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address in the field above first.')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setResetSent(true)
      alert(`🔑 Password reset instructions sent to ${email}. Check your inbox!`)
    } catch (err: any) {
      alert('Error sending password reset email: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <HeaderNav />

      <div className="max-w-md w-full mx-auto px-4 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white">Host Login</h1>
            <p className="text-xs text-neutral-400">
              Sign in to manage your short-stay properties and reservations.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-semibold leading-relaxed">
              {errorMessage}
            </div>
          )}

          {resetSent && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-900/60 rounded-xl text-emerald-300 text-xs font-semibold">
              ✓ Password reset link dispatched! Please check your email inbox.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-400">Email Address</label>
              <input
                type="email"
                required
                placeholder="host@laestancia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3.5 rounded-xl focus:border-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-neutral-400">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1"
                >
                  🔒 Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3.5 rounded-xl focus:border-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || isLockedOut}
              className={`w-full py-3.5 font-black text-xs rounded-xl shadow transition text-center cursor-pointer ${
                isLockedOut
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              {loading ? 'Authenticating...' : isLockedOut ? 'Account Locked (5/5 Failed)' : 'Sign In to Operations'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}