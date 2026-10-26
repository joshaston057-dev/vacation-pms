'use client'

import { useState } from 'react'
import Link from 'next/link'
import HostAuthModal from './HostAuthModal'

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
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

      <HostAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false)
          window.location.href = '/operations'
        }}
      />
    </>
  )
}