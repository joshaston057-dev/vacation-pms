'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
          <span className="text-amber-500">La Estancia</span> Vacation Homes
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-neutral-300">
          <Link href="/properties" className="hover:text-amber-500 transition-colors">
            Property Category
          </Link>

          <Link href="/services" className="hover:text-amber-500 transition-colors">
            Services
          </Link>

          <Link href="/blog" className="hover:text-amber-500 transition-colors">
            Blog
          </Link>

          <Link 
            href="/about" 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition shadow-md"
          >
            About Us
          </Link>
        </nav>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-neutral-300 hover:text-white p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-bold cursor-pointer"
        >
          {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>

      </div>

      {/* MOBILE DROPDOWN NAVIGATION */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-300 hover:text-amber-500 py-1"
          >
            Property Category
          </Link>

          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-300 hover:text-amber-500 py-1"
          >
            Services
          </Link>

          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-300 hover:text-amber-500 py-1"
          >
            Blog
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow-md"
          >
            About Us
          </Link>
        </div>
      )}
    </header>
  )
}