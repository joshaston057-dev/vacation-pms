import './globals.css';
import HeaderNav from './components/HeaderNav';
import Link from 'next/link';

export const metadata = {
  title: 'La Estancia Vacation Homes | Luxury PMS',
  description: 'Premium serviced apartments and luxury mansions in Kampala and beyond.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950">
        <HeaderNav />

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-2">
              <span className="text-white font-extrabold text-lg tracking-tight block">
                La Estancia Vacation Homes
              </span>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Managing a premier portfolio of short-stay apartments, stand-alone houses, and luxury villas with zero extra booking fees.
              </p>
            </div>
            <div>
              <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Direct Contact</h4>
              <p className="text-xs text-slate-300">📞 +256 757 386 946</p>
              <p className="text-xs text-slate-300 mt-1">📞 +256 780 564 778</p>
            </div>
            <div>
              <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/properties" className="hover:text-amber-400 transition">Property Portfolio</Link></li>
                <li><Link href="/operations" className="hover:text-amber-400 transition">Operations Rota</Link></li>
                <li><Link href="/reports" className="hover:text-amber-400 transition">Financial Reports</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pb-12">
            <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
            <p className="text-slate-500 mt-2 sm:mt-0">Designed for Seamless Direct Bookings</p>
          </div>
        </footer>
      </body>
    </html>
  );
}