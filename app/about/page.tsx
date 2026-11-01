'use client'

import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO SECTION */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="text-amber-500 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              International Vacation Rentals & Co-Hosting
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Redefining Short-Stay Hospitality Worldwide
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Connecting international travelers, holidaymakers, and business executives with handpicked, luxury short-term accommodations and premium co-hosting services.
            </p>
          </div>
        </section>

        {/* BRAND MISSION & OVERVIEW */}
        <section className="max-w-5xl mx-auto p-6 sm:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Who We Are</h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                <strong>La Estancia Vacation Homes</strong> is a premier global property management and short-stay platform. We curate a diverse portfolio spanning fully furnished luxury apartments, standalone residences, spacious mansions, and beachfront villas.
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Whether you are a global digital nomad seeking an executive workspace, an expat family on holiday, or a property owner looking for hassle-free remote management, La Estancia delivers world-class service standards.
              </p>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-amber-500">Why Guests & Hosts Choose Us</h3>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">✓</span>
                  <span><strong>Global Quality Standards:</strong> Every property is verified for safety, high-speed WiFi, and hotel-grade cleanliness.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">✓</span>
                  <span><strong>Dedicated Co-Hosting:</strong> Comprehensive host management, dynamic channel pricing, and guest communication.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">✓</span>
                  <span><strong>Bespoke Concierge:</strong> Private airport transfers, personal chef services, and curated city tours.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* THREE PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-800">
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl space-y-2">
              <span className="text-2xl">🌍</span>
              <h4 className="font-bold text-white text-base">Global Reach</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Showcasing top-tier properties optimized for international tourists, business executives, and returning diaspora.
              </p>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl space-y-2">
              <span className="text-2xl">🔑</span>
              <h4 className="font-bold text-white text-base">Expert Co-Hosting</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Empowering real estate investors and Airbnb hosts with full operational support, housekeeping dispatch, and listing optimization.
              </p>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl space-y-2">
              <span className="text-2xl">✨</span>
              <h4 className="font-bold text-white text-base">Unmatched Comfort</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Seamless booking, flexible check-in options, and 24/7 dedicated host assistance for a memorable stay.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}