'use client'

import { useState } from 'react'
import Link from 'next/link'
import HostAuthModal from './HostAuthModal'

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <HostAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false)
          window.location.href = '/operations'
        }}
      />

      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-xs font-sans">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2d5a27] flex items-center justify-center font-black text-white text-lg shadow-md">
              LE
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                LA ESTANCIA
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-[#2d5a27] font-bold">
                Vacation Homes
              </span>
            </div>
          </Link>

          {/* Public Guest Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-[#2d5a27] transition">Home</Link>
            <Link href="/properties" className="hover:text-[#2d5a27] transition">Stays & Rentals</Link>
            <Link href="/services" className="hover:text-[#2d5a27] transition">Add-Ons & Experiences</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/256757386946?text=Hello%20La%20Estancia!%20I%20have%20an%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2d5a27] hover:bg-[#23471f] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <span>💬</span> WhatsApp Concierge
            </a>

            {/* Discreet Host Entrance Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-gray-400 hover:text-gray-700 text-xs font-bold px-3 py-2 border border-gray-200 rounded-xl transition"
              title="Host Portal Login"
            >
              🔒 Host Login
            </button>
          </div>
        </div>
      </header>
    </>
  )
}