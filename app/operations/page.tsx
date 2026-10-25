'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function OperationsPMSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === 'estancia2026') {
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // 🔒 HARD SECURITY GATE: IF NOT LOGGED IN, STOP EVERYTHING & SHOW LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-6 font-sans">
        <div className="bg-[#0e1626] border border-gray-800 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/20">
              OS
            </div>
            <h1 className="text-2xl font-black tracking-tight">EstanciaOS Login</h1>
            <p className="text-xs text-gray-400">
              🔒 Restricted access. Enter host passcode to access internal PMS, turnover logs, and iCal feeds.
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
                Incorrect passcode. Access denied.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3.5 rounded-xl text-xs transition shadow-lg"
            >
              Access EstanciaOS
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

  // 🔓 AUTHENTICATED HOST VIEW
  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans flex flex-col justify-between">
      <nav className="border-b border-gray-800 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-black text-lg">
              OS
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">EstanciaOS</span>
              <span className="block text-[9px] uppercase tracking-widest text-amber-400 font-medium">
                Host Operations Engine
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-500/20 transition"
          >
            🔒 Lock Operations
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10 w-full">
        <div className="border-b border-gray-800 pb-6 flex justify-between items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md">
              Secure Channel Manager
            </span>
            <h1 className="text-3xl font-black mt-2">iCal Calendar Feeds & Sync</h1>
          </div>
        </div>

        <div className="bg-[#0e1626] border border-gray-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="text-lg font-bold">Property Calendar Feeds</h3>
          <div className="space-y-4">
            <div className="bg-[#070b14] border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between">
                <h4 className="font-bold text-white">The Emin Pasha Luxury Villa</h4>
                <span className="text-xs text-emerald-400 font-bold">Active Sync</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0e1626] p-3.5 rounded-xl border border-gray-800 space-y-1">
                  <label className="text-[10px] font-bold text-amber-400 uppercase">EstanciaOS Export (.ics)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://vacation-pms.vercel.app/api/ical/emin-pasha.ics"
                      className="w-full bg-black/50 border border-gray-700 text-gray-300 text-[11px] p-2 rounded-lg"
                    />
                    <button
                      onClick={() => handleCopy('https://vacation-pms.vercel.app/api/ical/emin-pasha.ics')}
                      className="bg-gray-800 text-white text-[11px] px-3 rounded-lg hover:bg-gray-700"
                    >
                      {copiedUrl === 'https://vacation-pms.vercel.app/api/ical/emin-pasha.ics' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="bg-[#0e1626] p-3.5 rounded-xl border border-gray-800 space-y-1">
                  <label className="text-[10px] font-bold text-rose-400 uppercase">Airbnb iCal Link</label>
                  <input
                    type="text"
                    defaultValue="https://airbnb.com/calendar/ical/123456.ics"
                    className="w-full bg-black/50 border border-gray-700 text-gray-300 text-[11px] p-2 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-[#070b14] py-8 text-center text-xs text-gray-500">
        <p>© 2026 EstanciaOS. Private Host System.</p>
      </footer>
    </div>
  )
}