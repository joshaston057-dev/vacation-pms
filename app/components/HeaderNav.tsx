'use client';

import Link from 'next/link';

export default function HeaderNav() {
  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 px-4 py-3 min-w-[1280px]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Branding */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center font-bold text-white tracking-wide">
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

        {/* Global Navigation Links & Action Icons */}
        <nav className="flex items-center gap-6 shrink-0">
          <Link
            href="/"
            className="text-slate-300 hover:text-white text-sm font-medium transition flex items-center gap-1.5"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>
          <Link
            href="/properties"
            className="text-slate-300 hover:text-white text-sm font-medium transition flex items-center gap-1.5"
          >
            <span>🏢</span>
            <span>Properties</span>
          </Link>
          <Link
            href="/bookings"
            className="text-slate-300 hover:text-white text-sm font-medium transition flex items-center gap-1.5"
          >
            <span>📅</span>
            <span>Bookings</span>
          </Link>
          <a
            href="https://wa.me/256757386946"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>💬</span>
            <span>WhatsApp Booking</span>
          </a>
          <Link
            href="/login"
            className="bg-red-950 hover:bg-red-900 border border-red-800 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>🔑</span>
            <span>Host Portal</span>
          </Link>
        </nav>

      </div>
    </header>
  );
}