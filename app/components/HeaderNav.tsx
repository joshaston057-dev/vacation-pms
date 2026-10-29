'use client'

import Link from 'next/link'

export default function HeaderNav() {
  return (
    <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="text-xl font-bold text-amber-500 tracking-tight">
          La Estancia <span className="text-xs text-neutral-400 font-normal">Vacation Homes</span>
        </Link>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-6 text-xs font-semibold">
          <Link href="/stays" className="text-neutral-300 hover:text-amber-500 transition">
            Browse Properties
          </Link>
          <Link href="/services" className="text-neutral-300 hover:text-amber-500 transition">
            Services
          </Link>
          <Link href="/blog" className="text-neutral-300 hover:text-amber-500 transition">
            Blog
          </Link>
          <Link href="/about" className="text-neutral-300 hover:text-amber-500 transition">
            About Us
          </Link>
          <Link
            href="/operations"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition"
          >
            🔒 Host OS
          </Link>
        </nav>

      </div>
    </header>
  )
}