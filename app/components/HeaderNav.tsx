'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'Reservations', path: '/bookings' },
    { name: 'Operations', path: '/operations' },
    { name: 'Services', path: '/services' },
    { name: 'Financials', path: '/reports' },
    { name: 'Welcome Guide', path: '/welcome' },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/20">
              LE
            </div>
            <div>
              <span className="text-white font-extrabold text-base tracking-tight block leading-none">
                La Estancia
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Vacation Homes
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <a
              href="https://wa.me/256757386946"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <span>💬</span>
              <span className="hidden sm:inline">WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}