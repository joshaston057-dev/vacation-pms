'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GuestServicesPage() {
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

  const services = [
    {
      id: '1',
      title: 'Entebbe Airport Pickup / Dropoff',
      category: 'Transport',
      priceUSD: '$40',
      priceUGX: '~150,000 UGX',
      description: 'Private comfortable transport directly between Entebbe International Airport and your villa/apartment.',
    },
    {
      id: '2',
      title: 'Early Check-In / Late Check-Out',
      category: 'Flexibility',
      priceUSD: '$25',
      priceUGX: '~95,000 UGX',
      description: 'Flexible timing to match your flight schedule (subject to availability).',
    },
    {
      id: '3',
      title: 'In-House Private Chef Dining',
      category: 'Hospitality',
      priceUSD: '$60',
      priceUGX: '~225,000 UGX',
      description: 'Professional chef service for custom breakfast, lunch, or dinner prepared directly in your suite.',
    },
    {
      id: '4',
      title: '4x4 SUV / Vehicle Rental',
      category: 'Rentals',
      priceUSD: '$85',
      priceUGX: '~320,000 UGX',
      description: 'Reliable 4x4 SUV rental with optional dedicated driver for town trips or safari routes.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col justify-between">
      
      {/* Navigation */}
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            La Estancia <span className="text-amber-500 text-xs font-normal">Vacation Homes</span>
          </Link>

          <nav className="flex items-center gap-6 text-xs font-semibold text-gray-300">
            <Link href="/" className="hover:text-amber-400 transition">Home</Link>
            <Link href="/properties" className="hover:text-amber-400 transition">Stays</Link>
            <Link href="/services" className="hover:text-amber-400 transition">Concierge Services</Link>
            
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-gray-800 hover:bg-gray-700 text-amber-400 px-3 py-1.5 rounded-lg border border-gray-700 transition flex items-center gap-1.5"
            >
              🔒 Host OS
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full space-y-10">
        <div className="border-b border-gray-800 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md">
            Guest Experiences
          </span>
          <h1 className="text-3xl font-black mt-2">Concierge & Add-On Services</h1>
          <p className="text-sm text-gray-400 mt-1">
            Enhance your stay at La Estancia Vacation Homes with custom services tailored for comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div key={s.id} className="bg-gray-800/50 border border-gray-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {s.category}
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {s.priceUSD} <span className="text-xs text-gray-400 font-normal">({s.priceUGX})</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello La Estancia! I would like to book the add-on service: ${s.title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl text-xs text-center transition block shadow-lg"
              >
                Book via WhatsApp
              </a>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-500">
        <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
      </footer>

      {/* Host Auth Modal (Inline) */}
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