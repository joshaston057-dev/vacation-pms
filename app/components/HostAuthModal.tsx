'use client'

import { useState } from 'react'

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
    if (passcode === 'estancia2026') {
      setError(false)
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
      <div className="bg-[#0e1626] border border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative space-y-6 text-white">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white text-sm font-bold w-8 h-8 rounded-full bg-gray-800/60 flex items-center justify-center transition"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/20">
            OS
          </div>
          <h2 className="text-2xl font-black tracking-tight">EstanciaOS Host Portal</h2>
          <p className="text-xs text-gray-400">
            🔒 Restricted section. Please enter host credentials to access calendar syncs and PMS controls.
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
              Invalid host passcode. Access denied.
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
            ← Return to Public Website
          </button>
        </div>

      </div>
    </div>
  )
}