'use client';

import Link from 'next/link';

export default function HeaderNav() {
  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-3.5 space-y-3">
        
        {/* Top Row: Brand & WhatsApp */}
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
              LE
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide text-white leading-tight">
                La Estancia
              </span>
              <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">
                Vacation Homes
              </span>
            </div>
          </Link>

          <a
            href="https://wa.me/256757386946"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shrink-0"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Bottom Row: Full Mobile Navigation Bar */}
        <nav className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-900 w-full text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 text-slate-200 bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 text-xs font-semibold hover:bg-slate-800 transition"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>

          <Link
            href="/properties"
            className="flex items-center justify-center gap-1.5 text-slate-200 bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 text-xs font-semibold hover:bg-slate-800 transition"
          >
            <span>🏢</span>
            <span>Stays</span>
          </Link>

          <Link
            href="/bookings"
            className="flex items-center justify-center gap-1.5 text-slate-200 bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 text-xs font-semibold hover:bg-slate-800 transition"
          >
            <span>📅</span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-amber-400 bg-red-950/80 border border-red-800/80 rounded-xl py-2.5 text-xs font-bold hover:bg-red-900 transition"
          >
            <span>🔑</span>
            <span>Portal</span>
          </Link>
        </nav>

      </div>
    </header>
  );
}