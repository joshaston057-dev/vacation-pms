'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isPrivateDashboard = pathname === '/operations'

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

        {/* Host Sign In / Log Out Button */}
        <div className="hidden md:flex items-center gap-3">
          {user && isPrivateDashboard ? (
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-400 hover:bg-rose-900/50 transition cursor-pointer"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-amber-500 hover:text-amber-400 transition"
            >
              Host Sign In
            </Link>
          )}
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
            {user && isPrivateDashboard ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left text-xs font-bold text-rose-400 py-1"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-amber-500 py-1"
              >
                Host Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}