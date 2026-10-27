'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HeaderNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white">
              La Estancia <span className="text-amber-500 font-light text-sm hidden sm:inline">Vacation Homes</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <Link href="/" className="hover:text-amber-500 transition">Home</Link>
            <Link href="/properties" className="hover:text-amber-500 transition">Stays</Link>
            <Link href="/services" className="hover:text-amber-500 transition">Concierge Services</Link>
            <Link 
              href="/operations" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-amber-500 rounded-lg font-medium transition"
            >
              🔒 Host OS
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="p-2 text-neutral-400 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 pt-2 pb-6 space-y-3">
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-neutral-200 hover:text-amber-500 py-2 text-base font-medium border-b border-neutral-800/50"
          >
            Home
          </Link>
          <Link 
            href="/properties" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-neutral-200 hover:text-amber-500 py-2 text-base font-medium border-b border-neutral-800/50"
          >
            Stays
          </Link>
          <Link 
            href="/services" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-neutral-200 hover:text-amber-500 py-2 text-base font-medium border-b border-neutral-800/50"
          >
            Concierge Services
          </Link>
          <Link 
            href="/operations" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-amber-500 font-semibold py-2 text-base"
          >
            🔒 Host OS Operations
          </Link>
        </div>
      )}
    </header>
  )
}