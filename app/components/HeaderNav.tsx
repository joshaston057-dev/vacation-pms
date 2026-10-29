'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center">
          <div className="flex flex-col justify-center">
            <span className="text-amber-500 font-extrabold text-base tracking-tight leading-tight">
              La Estancia
            </span>
            <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-medium leading-none">
              VACATION HOMES
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-neutral-300">
          <Link href="/stays" className="hover:text-amber-500 transition">
            Browse Properties
          </Link>
          <Link href="/services" className="hover:text-amber-500 transition">
            Services
          </Link>
          <Link href="/blog" className="hover:text-amber-500 transition">
            Blog
          </Link>
          <Link href="/about" className="hover:text-amber-500 transition">
            About Us
          </Link>
        </nav>

        {/* Host Portal Link Button */}
        <div className="hidden md:block">
          <Link
            href="/operations"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition"
          >
            Host Portal
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-neutral-300 hover:text-white focus:outline-none flex items-center justify-center"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-t border-neutral-800 px-5 py-4 space-y-3">
          <Link
            href="/stays"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-200 hover:text-amber-500 py-1"
          >
            Browse Properties
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-200 hover:text-amber-500 py-1"
          >
            Services
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-200 hover:text-amber-500 py-1"
          >
            Blog
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-neutral-200 hover:text-amber-500 py-1"
          >
            About Us
          </Link>
          <div className="pt-2 border-t border-neutral-800">
            <Link
              href="/operations"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow-md"
            >
              Host Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}