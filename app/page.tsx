'use client'

import Link from 'next/link'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 text-center max-w-5xl mx-auto">
          <div className="inline-block mb-4">
            <span className="text-xs uppercase tracking-widest font-semibold px-3.5 py-1.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
              GLOBAL SHORT-STAY & CO-HOSTING SERVICES
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Luxury Stays & Professional Property Management
          </h1>

          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience hand-picked vacation rentals worldwide or partner with us for full-service co-hosting, listing optimization, and short-term rental management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properties"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg transition duration-200 text-center"
            >
              Browse Stays
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 font-semibold rounded-xl transition duration-200 text-center"
            >
              For Property Owners
            </Link>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-neutral-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900/50 border border-neutral-800/80 p-8 rounded-2xl">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-white mb-2">Global Marketplace</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Standardized USD pricing, direct instant bookings, and seamless global guest support across prime destinations.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800/80 p-8 rounded-2xl">
              <div className="text-3xl mb-4">🔑</div>
              <h3 className="text-xl font-bold text-white mb-2">Turnkey Co-Hosting</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Full-service property management: automated guest communications, dynamic pricing, and maintenance coordination.
              </p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800/80 p-8 rounded-2xl">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-2">iCal Multi-Channel Sync</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Real-time calendar synchronization across Airbnb, Booking.com, and direct booking channels to eliminate double bookings.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}