'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState(false)
  const whatsappNumber = '256757386946'

  const handleHostLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === 'estancia2026') {
      window.location.href = '/operations'
    } else {
      setAuthError(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col justify-between">
      
      {/* HEADER / NAVIGATION */}
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            La Estancia <span className="text-amber-500 text-xs font-normal">Vacation Homes</span>
          </Link>

          <nav className="flex items-center gap-6 text-xs font-semibold text-gray-300">
            <Link href="/" className="hover:text-amber-400 transition">Home</Link>
            <Link href="/properties" className="hover:text-amber-400 transition">Stays</Link>
            <Link href="/services" className="hover:text-amber-400 transition">Concierge Services</Link>
            
            {/* Locked Host Portal Trigger */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-gray-800 hover:bg-gray-700 text-amber-400 px-3 py-1.5 rounded-lg border border-gray-700 transition flex items-center gap-1.5"
            >
              🔒 Host OS
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-16 w-full">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full border border-amber-500/20">
            Uganda Short-Stay & Co-Hosting Services
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Luxury Stays & Professional Property Management
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Experience hand-picked vacation rentals across Kampala or partner with us for full-service co-hosting and short-term rental management.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/properties"
              className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-3.5 rounded-xl text-xs transition shadow-lg"
            >
              Browse Stays
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello La Estancia! I would like to inquire about your property management and co-hosting services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs border border-gray-700 transition flex items-center gap-2"
            >
              💬 WhatsApp Concierge
            </a>
          </div>
        </div>

        {/* CORE SERVICES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="bg-gray-800/50 border border-gray-800 p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-bold text-amber-400">For Guests</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Book curated luxury apartments and standalone villas. Enjoy private airport pickups, flexible check-in times, and dedicated chef services.
            </p>
            <Link href="/properties" className="inline-block text-xs text-amber-400 font-bold hover:underline">
              View Available Stays →
            </Link>
          </div>

          <div className="bg-gray-800/50 border border-gray-800 p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-bold text-amber-400">For Property Owners</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Maximize your yield with our co-hosting expertise, multi-channel marketing, iCal calendar synchronization, and full turnover management.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs text-amber-400 font-bold hover:underline text-left block"
            >
              Access EstanciaOS Host Portal →
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-500">
        <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
      </footer>

      {/* HOST AUTH MODAL (Inline) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0e1626] border border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative space-y-6 text-white">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-sm font-bold w-8 h-8 rounded-full bg-gray-800/60 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-xl shadow-lg">
                OS
              </div>
              <h2 className="text-2xl font-black tracking-tight">EstanciaOS Host Portal</h2>
              <p className="text-xs text-gray-400">
                🔒 Restricted section. Enter your host passcode to access management operations.
              </p>
            </div>

            <form onSubmit={handleHostLogin} className="space-y-4">
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

              {authError && (
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
          </div>
        </div>
      )}

    </div>
  )
}