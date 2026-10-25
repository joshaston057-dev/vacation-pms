'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'rent' | 'cohost'>('rent')
  const [keyword, setKeyword] = useState('')
  const [propertyType, setPropertyType] = useState('All Types')
  const [maxPrice, setMaxPrice] = useState('Any Price')

  const whatsappNumber = '256757386946'

  const services = [
    {
      title: 'Verified Luxury Stays',
      badge: 'Guest Experience',
      description: 'Hand-picked serviced apartments and villas furnished to international standards with 24/7 guest support.',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      href: '/properties',
      isExternal: false,
    },
    {
      title: 'Direct WhatsApp Bookings',
      badge: 'Zero Commissions',
      description: 'Skip platform commissions and reserve instantly via WhatsApp with zero extra booking fees.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello La Estancia! I want to book a stay directly.')}`,
      isExternal: true,
    },
    {
      title: 'Co-Hosting & Management',
      badge: 'Owner Yields',
      description: 'Automated iCal channel syncing, cleaning operations logs, and financial yield optimization.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I am a property owner interested in co-hosting.')}`,
      isExternal: true,
    },
    {
      title: 'In-House Private Chef',
      badge: 'Gourmet Upsell',
      description: 'Custom organic breakfast, barbecue, and fine dining prepared live at your villa.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello La Estancia! I would like to book a Private Chef.')}`,
      isExternal: true,
    },
    {
      title: 'VIP Airport Chauffeur',
      badge: 'Luxury Transit',
      description: 'Entebbe Airport pickups and private SUV chauffeur hire throughout your stay.',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello La Estancia! I am interested in Airport Pick-up.')}`,
      isExternal: true,
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      
      {/* Continuous Marquee Animation Styles */}
      <style jsx global>{`
        @keyframes scrollCards {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-card-scroll {
          display: flex;
          width: max-content;
          animation: scrollCards 35s linear infinite;
        }
        .animate-card-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Top Header Navbar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2d5a27] flex items-center justify-center font-black text-white text-lg shadow-md">
              LE
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                LA ESTANCIA
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-[#2d5a27] font-bold">
                Vacation Homes
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link href="/" className="text-[#2d5a27] border-b-2 border-[#2d5a27] pb-1">Home</Link>
            <Link href="/properties" className="hover:text-[#2d5a27] transition">Stays & Rentals</Link>
            <Link href="/operations" className="hover:text-[#2d5a27] transition">Operations</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello La Estancia! I need assistance.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2d5a27] hover:bg-[#23471f] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <span>💬</span> WhatsApp Concierge
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[620px] bg-gray-900 flex flex-col justify-between">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Villa Background"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 text-center space-y-4 text-white z-10">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            ✨ Premium Serviced Apartments & Mansions across Uganda
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Luxury Staycation Homes <br className="hidden md:inline" />
            <span className="text-emerald-400">Made Effortless.</span>
          </h1>
          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto font-medium">
            Discover hand-picked short-stay homes with 5-star ratings, financial yield forecasting, and zero booking fees.
          </p>
        </div>

        {/* Property Search Filter Box */}
        <div className="relative max-w-5xl mx-auto w-full px-6 translate-y-12 z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex gap-2 border-b border-gray-100 pb-4">
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'rent' ? 'bg-[#2d5a27] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Short Stays
              </button>
              <button
                onClick={() => setActiveTab('cohost')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'cohost' ? 'bg-[#2d5a27] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Financial Planning & Co-Hosting
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Search Keywords</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Kyanja, Villa..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:border-[#2d5a27] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:border-[#2d5a27] focus:outline-none"
                >
                  <option>All Types</option>
                  <option>Serviced Apartment</option>
                  <option>Standalone House</option>
                  <option>Luxury Mansion</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Max Price / Night</label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:border-[#2d5a27] focus:outline-none"
                >
                  <option>Any Price</option>
                  <option>Under $100</option>
                  <option>$100 - $250</option>
                  <option>$250+</option>
                </select>
              </div>

              <div className="pt-5">
                <Link
                  href="/properties"
                  className="w-full bg-[#2d5a27] hover:bg-[#23471f] text-white font-extrabold p-3.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🔍</span> Search Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-28 md:h-20" />

      {/* CONTINUOUS MOVING CARDS TICKER SECTION */}
      <main className="max-w-full py-16 space-y-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2d5a27]">
            Interactive Showcase
          </span>
          <h2 className="text-3xl font-black text-gray-900">
            Our Services & Upsells in Continuous Motion
          </h2>
          <p className="text-xs text-gray-600 max-w-xl mx-auto">
            Hover over any card to pause the motion, or click to explore and connect directly via WhatsApp.
          </p>
        </div>

        {/* Moving Cards Row */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="animate-card-scroll flex gap-6 px-4">
            {[...services, ...services].map((item, idx) => (
              <div
                key={idx}
                className="w-[320px] sm:w-[360px] flex-shrink-0 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-52 w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-[#2d5a27] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
                      {item.badge}
                    </span>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#2d5a27] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-900 hover:bg-[#2d5a27] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <span>💬</span> Inquire via WhatsApp
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="w-full bg-gray-900 hover:bg-[#2d5a27] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <span>✨</span> Explore Stays
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white">Privacy Policy</Link>
            <Link href="/" className="hover:text-white">Terms of Service</Link>
            <Link href="/properties" className="hover:text-white">Portfolio</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}