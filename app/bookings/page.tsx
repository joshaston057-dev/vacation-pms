'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'

export default function BookingsAuthPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    // Set your admin passcode here (change '1234' to whatever passcode you prefer)
    if (passcode === '1234' || passcode === 'admin') {
      // Successfully authenticated -> Redirect straight to your 5-tab Operations Hub
      window.location.href = '/operations'
    } else {
      setError(true)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        <div className="max-w-md mx-auto px-4 py-24">
          <div className="bg-neutral-9{-} border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-3xl">🔒</span>
              <h1 className="text-xl font-extrabold text-white">Host Portal Access</h1>
              <p className="text-xs text-neutral-400">
                Enter your administrative passcode to unlock your unified Host Operations Hub.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={e => {
                    setPasscode(e.target.value)
                    setError(false)
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white text-center tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center font-bold">
                  Incorrect passcode. Please try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow cursor-pointer"
              >
                Unlock Portal
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}