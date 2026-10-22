'use client';

import Link from 'next/link';

export default function HeaderNav() {
  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Top Row: Brand Logo & WhatsApp Action Button */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center font-bold text-white tracking-wide shrink-0">
              LE
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide block leading-none text-white">
                La Estancia
              </span>
              <span className="text-[10px] text-amber-500 font-semibold tracking-widest block">
                VACATION HOMES
              </span>
            </div>
          </Link>

          <a
            href="https://wa.me/256757386946"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Second Row: Navigation Icons & Links (Using the Open Space) */}
        <nav className="flex items-center justify-between gap-1 pt-2 border-t border-slate-900 text-xs">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-md font-medium transition"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>

          <Link
            href="/properties"
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-md font-medium transition"
          >
            <span>🏢</span>
            <span>Properties</span>
          </Link>

          <Link
            href="/bookings"
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-md font-medium transition"
          >
            <span>📅</span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1 text-white bg-red-950 hover:bg-red-900 border border-red-800 px-2 py-1 rounded-md font-semibold transition"
          >
            <span>🔑</span>
            <span>Host Portal</span>
          </Link>
        </nav>

      </div>
    </header>
  );
}