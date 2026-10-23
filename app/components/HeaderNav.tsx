'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand Title */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold tracking-tight text-white">
            La Estancia
          </span>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/properties" className="hover:text-white transition-colors">Stays</Link>
          <Link href="/services" className="hover:text-white transition-colors">Services & Upsells</Link>
          <Link href="/operations" className="hover:text-white transition-colors">Operations</Link>
          <Link href="/bookings" className="hover:text-white transition-colors">Bookings</Link>
        </nav>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-slate-300 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Vertical Menu (Fits 100% Mobile Viewport) */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1 text-sm text-slate-300">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="block py-2.5 px-3 rounded-md hover:bg-slate-900 hover:text-white font-medium"
          >
            🏠 Home
          </Link>
          <Link 
            href="/properties" 
            onClick={() => setIsOpen(false)}
            className="block py-2.5 px-3 rounded-md hover:bg-slate-900 hover:text-white font-medium"
          >
            🏢 Stays
          </Link>
          <Link 
            href="/services" 
            onClick={() => setIsOpen(false)}
            className="block py-2.5 px-3 rounded-md hover:bg-slate-900 hover:text-white font-medium"
          >
            ✨ Services & Upsells
          </Link>
          <Link 
            href="/operations" 
            onClick={() => setIsOpen(false)}
            className="block py-2.5 px-3 rounded-md hover:bg-slate-900 hover:text-white font-medium"
          >
            🧹 Operations
          </Link>
          <Link 
            href="/bookings" 
            onClick={() => setIsOpen(false)}
            className="block py-2.5 px-3 rounded-md hover:bg-slate-900 hover:text-white font-medium"
          >
            📅 Bookings
          </Link>
        </div>
      )}
    </header>
  );
}