'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
        {/* Brand & Rights */}
        <div className="flex items-center space-x-2 text-center sm:text-left">
          <span className="font-semibold text-white">La Estancia</span>
          <span>•</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>

        {/* Quick Compact Links */}
        <nav className="flex flex-wrap justify-center gap-4 text-slate-300">
          <Link href="/properties" className="hover:text-white transition-colors">
            Stays
          </Link>
          <Link href="/services" className="hover:text-white transition-colors">
            Services & Upsells
          </Link>
          <Link href="/operations" className="hover:text-white transition-colors">
            Operations
          </Link>
          <a
            href="https://wa.me/256757386946"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
          >
            WhatsApp Direct
          </a>
        </nav>
      </div>
    </footer>
  );
}