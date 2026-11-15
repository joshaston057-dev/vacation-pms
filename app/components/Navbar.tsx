"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo & Company Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-neutral-950 text-base shadow">
            LE
          </div>
          <span className="font-bold text-white tracking-tight text-base sm:text-lg">
            La Estancia <span className="text-amber-500 font-normal">Vacation Homes</span>
          </span>
        </Link>

        {/* Hamburger Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Hamburger Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50">
              <Link
                href="/#about"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-neutral-300 hover:text-amber-400 hover:bg-neutral-900 transition"
              >
                About Us
              </Link>
              <Link
                href="/#contact"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-neutral-300 hover:text-amber-400 hover:bg-neutral-900 transition"
              >
                Contact Us
              </Link>
              <Link
                href="/#blog"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-neutral-300 hover:text-amber-400 hover:bg-neutral-900 transition"
              >
                Blog
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}