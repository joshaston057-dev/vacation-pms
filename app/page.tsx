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
        <section className="relative py-16 sm:py-24 px-4 text-center overflow-hidden border-b border-neutral-800 bg-neutral-900/40">
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            
            {/* Clean Sub-title Badge */}
            <div className="inline-flex items-center justify-center px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider text-center leading-normal">
                Global Short-Stay & Co-Hosting Services
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Luxury Stays & Professional Property Management
            </h1>

            {/* Sub-headline */}
            <p className="text-neutral-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Experience hand-picked vacation rentals worldwide or partner with us for full-service co-hosting, listing optimization, and short-term rental management.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 max-w-md mx-auto">
              <Link
                href="/stays"
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition text-center"
              >
                Browse Stays
              </Link>

              <Link
                href="/operations"
                className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition text-center"
              >
                For Property Owners
              </Link>
            </div>

          </div>
        </section>

        {/* Services Overview Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Host & Book With La Estancia
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto">
              Delivering high-yield returns for hosts and premium experiences for vacation guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-neutral-700 transition">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl text-amber-500">
                🏡
              </div>
              <h3 className="font-bold text-white text-base">Curated Short Stays</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Explore fully furnished apartments, standalone private houses, villas, and luxury mansions with direct WhatsApp host booking.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-neutral-700 transition">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl text-amber-500">
                🔑
              </div>
              <h3 className="font-bold text-white text-base">Airbnb Co-Hosting</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We handle pricing strategy, guest communication, check-in operations, and housekeeping management for property owners.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-neutral-700 transition">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl text-amber-500">
                📈
              </div>
              <h3 className="font-bold text-white text-base">Property Marketing</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Custom web pages, high-converting property presentation, and targeted outreach to maximize occupancy and revenue.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-neutral-900 border-y border-neutral-800 py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-500">
              Ready to Explore Our Portfolio or Partner With Us?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Connect with our management team directly or browse available stays ready for instant inquiry.
            </p>
            <div className="pt-2">
              <Link
                href="/stays"
                className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl transition"
              >
                View Stays Catalogue
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}