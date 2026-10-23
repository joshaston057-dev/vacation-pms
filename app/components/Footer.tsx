'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-8 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">La Estancia</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Luxury staycation homes and serviced apartments made effortless.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Featured Stays
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Guest Upsells & Services
                </Link>
              </li>
              <li>
                <Link href="/operations" className="hover:text-white transition-colors">
                  Host & Operations Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Guest Services & Upsells */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Guest Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400">Airport Transfers</li>
              <li className="text-slate-400">Direct WhatsApp Concierge</li>
              <li className="text-slate-400">Co-Hosting & Property Marketing</li>
            </ul>
          </div>

          {/* Contact & Direct Booking */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Direct Inquiries
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Reserve directly with zero extra booking fees.
            </p>
            <a
              href="https://wa.me/256757386946"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-850 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} La Estancia Vacation Homes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}