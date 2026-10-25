'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BookingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === 'estancia2026') {
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  // 🔒 HARD SECURITY GATE FOR BOOKINGS
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-6 font-sans">
        <div className="bg-[#0e1626] border border-gray-800 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/20">
              OS
            </div>
            <h1 className="text-2xl font-black tracking-tight">EstanciaOS Host Portal</h1>
            <p className="text-xs text-gray-400">
              🔒 Restricted access. Please enter your host passcode to manage property bookings and reservations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Host Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-black/60 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-semibold text-center">
                Incorrect host passcode. Access denied.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3.5 rounded-xl text-xs transition shadow-lg"
            >
              Authenticate Host
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-white transition">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 🔓 LOGGED IN VIEW: HOST RESERVATIONS MANAGEMENT
  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans p-8 space-y-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Management Portal</span>
          <h1 className="text-3xl font-black mt-1">Reservations & Bookings</h1>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-4 py-2 rounded-xl text-xs font-bold"
        >
          🔒 Lock Bookings
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-[#0e1626] border border-gray-800 rounded-3xl p-6">
        <p className="text-xs text-gray-400">Host access granted. Managing reservations table...</p>
      </div>
    </div>
  )
}