'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HostAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function HostAuthModal({ isOpen, onClose, onSuccess }: HostAuthModalProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Secure host passcode check (can be wired to Supabase Auth)
    if (passcode === 'estancia2026') {
      setError(false)
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0e1626] border border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative space-y-6 text-white font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center transition"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/20">
            OS
          </div>
          <h2 className="text-2xl font-black tracking-tight">EstanciaOS Host Portal</h2>
          <p className="text-xs text-gray-400">
            Restricted section. Please sign in with your host passcode to manage property operations, calendars, and upsells.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Host Passcode / Key
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter host passcode"
              className="w-full bg-black/60 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold text-center">
              Invalid host passcode. Please try again.
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
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition"
          >
            ← Continue as Guest
          </button>
        </div>

      </div>
    </div>
  )
}