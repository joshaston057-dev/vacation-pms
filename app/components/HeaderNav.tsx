'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BarChart3, Settings, ShieldCheck } from 'lucide-react';

export default function HeaderNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Properties', href: '/properties', icon: Home },
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Operations', href: '/operations', icon: ShieldCheck },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 w-[1280px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-400 tracking-wide">
              La Estancia
            </span>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
              PMS
            </span>
          </Link>

          {/* Navigation Links & Icons (Always visible on all devices, no hidden classes) */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Portal Login Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Owner Portal
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}