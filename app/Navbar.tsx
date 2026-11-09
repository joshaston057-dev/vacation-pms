'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-neutral-900/90 border-b border-neutral-800 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <span className="font-bold text-sm text-white tracking-tight">La Estancia</span>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-neutral-400 hover:text-white transition">Home</Link>
          <Link href="/stays" className="text-neutral-400 hover:text-white transition">Properties</Link>
          <Link href="/about" className="text-neutral-400 hover:text-white transition">About Us</Link>
          <Link href="/blogs" className="text-neutral-400 hover:text-white transition">Blogs</Link>
          <Link href="/operations" className="text-emerald-400 hover:text-emerald-300 transition">Operations Hub</Link>
        </div>
      </div>
    </nav>
  )
}