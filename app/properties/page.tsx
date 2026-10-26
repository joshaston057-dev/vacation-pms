'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GuestPropertiesPage() {
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

  const properties = [
    {
      id: '1',
      name: 'The Executive Penthouse Apartment',
      location: 'Kampala, Uganda',
      price: '$120 / night',
      specs: '2 Bedrooms • 2 Bathrooms • City Skyline View • High-Speed Wi-Fi',
      imageBg: 'from-amber-600/20 to-gray-900',
      description: 'Luxurious modern apartment located in the prime center of Kampala, featuring premium furnishings and 24/7 security.',
    },
    {
      id: '2',
      name: 'La Estancia Garden Villa',
      location: 'Kampala Outskirts / Entebbe Road',
      price: '$250 / night',
      specs: '4 Bedrooms • Private Pool • Lush Garden • Dedicated Housekeeper',
      imageBg: 'from-emerald-600/20 to-gray-900',
      description: 'Spacious stand-alone villa with a private swimming pool, outdoor lounging terrace, and serene natural surroundings.',
    },
    {
      id: '3',
      name: 'The Skyline Luxury Suite',
      location: 'Kampala, Uganda',
      price: '$95 / night',
      specs: '1 Bedroom • Balcony • Workspace • Kitchenette',
      imageBg: 'from-blue-600/20 to-gray-900',
      description: 'An elegant, cozy suite tailored for business travelers and couples looking for a sophisticated short-stay experience.',
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
            <Link href="/properties" className="hover:text-amber-400 transition text-amber-400">Stays</Link>
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
            Portfolio
          </span>
          <h1 className="text-3xl font-black mt-2">Curated Vacation Stays</h1>
          <p className="text-sm text-gray-400 mt-1">
            Hand-picked apartments, houses, and villas managed by La Estancia Vacation Homes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.map((p) => (
            <div key={p.id} className="bg-gray-800/50 border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl">
              <div className={`p-8 bg-gradient-to-br ${p.imageBg} border-b border-gray-800/80 space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30">
                    {p.location}
                  </span>
                  <span className="text-sm font-black text-white">{p.price}</span>
                </div>
                <h3 className="text-xl font-black text-white">{p.name}</h3>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 leading-relaxed">{p.description}</p>
                  <p className="text-[11px] font-semibold text-amber-400/90">{p.specs}</p>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello La Estancia! I would like to inquire about booking: ${p.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3.5 rounded-xl text-xs text-center transition block shadow-lg mt-4"
                >
                  Book via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-500">
        <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
      </footer>

      {/* Host Auth Modal */}
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