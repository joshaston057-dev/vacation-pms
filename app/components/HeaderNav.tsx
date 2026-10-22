'use client';

import Link from 'next/link';

export default function HeaderNav() {
  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 px-3 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Top Row: Logo + WhatsApp Direct Action */}
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center font-bold text-white text-sm tracking-wide shrink-0">
              LE
            </div>
            <div>
              <span className="font-bold text-base tracking-wide block leading-none text-white">
                La Estancia
              </span>
              <span className="text-[9px] text-amber-500 font-semibold tracking-widest block">
                VACATION HOMES
              </span>
            </div>
          </Link>

          <a
            href="https://wa.me/256757386946"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shrink-0"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Second Row: Full Visible Icon Navigation Row */}
        <nav className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-900 text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 text-slate-200 bg-slate-900 border border-slate-800 rounded-lg py-2 text-xs font-medium hover:bg-slate-800 transition"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>

          <Link
            href="/properties"
            className="flex items-center justify-center gap-1 text-slate-200 bg-slate-900 border border-slate-800 rounded-lg py-2 text-xs font-medium hover:bg-slate-800 transition"
          >
            <span>🏢</span>
            <span>Stays</span>
          </Link>

          <Link
            href="/bookings"
            className="flex items-center justify-center gap-1 text-slate-200 bg-slate-900 border border-slate-800 rounded-lg py-2 text-xs font-medium hover:bg-slate-800 transition"
          >
            <span>📅</span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-white bg-red-950 border border-red-800 rounded-lg py-2 text-xs font-semibold hover:bg-red-900 transition"
          >
            <span>🔑</span>
            <span>Portal</span>
          </Link>
        </nav>

      </div>
    </header>
  );
}