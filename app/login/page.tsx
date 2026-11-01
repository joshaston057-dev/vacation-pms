'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else if (data?.session) {
      // Direct hard-redirect upon success to break any loop
      window.location.href = '/operations'
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-extrabold text-white">Host Login</h1>
              <p className="text-xs text-neutral-400">
                Sign in to manage your short-stay properties and reservations.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="host@laestancia.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 text-center font-bold">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In to Operations'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}