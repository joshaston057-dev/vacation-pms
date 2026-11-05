'use client'

import { useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostSignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyLocation, setPropertyLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Sign up host using Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'host',
            primary_location: propertyLocation
          }
        }
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      alert('Signup failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <section className="max-w-md mx-auto px-4 py-16">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Become a Host
              </h1>
              <p className="text-xs text-neutral-400">
                Register globally to access your Host Operations Portal and manage your short-stay listings.
              </p>
            </div>

            {success ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold text-center space-y-2">
                <p>🎉 Registration Successful!</p>
                <p className="text-neutral-300 font-normal">
                  Please check your email to confirm your account, then access your operations portal.
                </p>
                <a
                  href="/operations"
                  className="inline-block mt-2 px-4 py-2 bg-amber-500 text-black font-extrabold rounded-xl"
                >
                  Go to Host Operations Portal →
                </a>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Joshua Owembabazi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="host@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+256 780 564 778"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Property Location / City, Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nairobi, Kenya or London, UK"
                    value={propertyLocation}
                    onChange={(e) => setPropertyLocation(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition cursor-pointer"
                >
                  {loading ? 'Registering Host Account...' : '⚡ Register as Global Host'}
                </button>
              </form>
            )}

          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}