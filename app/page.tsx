'use client'

import Link from 'next/link'

export default function HomePage() {
  const whatsappNumber = '256757386946'
  const directBookingMsg = encodeURIComponent(
    'Hello La Estancia! I am looking to book a short-stay property in Uganda. Please share available listings.'
  )

  const services = [
    {
      title: 'Verified Luxury Stays',
      badge: 'Guest Experience',
      description: 'Hand-picked serviced apartments, villas, and mansions fully furnished to international standards with 24/7 support.',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      actionText: 'Browse Stays',
      href: '/properties',
    },
    {
      title: 'Direct WhatsApp Bookings',
      badge: 'Zero Platform Fees',
      description: 'Skip costly third-party commissions. Inquire directly with our team for instant availability and seamless reservations.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      actionText: 'Chat Concierge',
      href: `https://wa.me/${whatsappNumber}?text=${directBookingMsg}`,
      isExternal: true,
    },
    {
      title: 'Co-Hosting & Management',
      badge: 'Host Solutions',
      description: 'Full-service property management including automated iCal syncing, turnover logs, cleaning operations, and yield optimization.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      actionText: 'List Your Property',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I am a property owner interested in co-hosting with La Estancia.')}`,
      isExternal: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between font-sans">
      
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              LE
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-amber-200 bg-clip-text text-transparent">
                La Estancia
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400 font-medium">
                Vacation Homes
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300">
            <Link href="/" className="text-amber-400 font-bold border-b-2 border-amber-400 pb-1">
              Home
            </Link>
            <Link href="/properties" className="hover:text-amber-300 transition">
              Stays & Portfolio
            </Link>
            <Link href="/operations" className="hover:text-amber-300 transition">
              Operations
            </Link>
          </div>

          {/* WhatsApp Action */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${directBookingMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <span>💬</span> Direct WhatsApp
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-16">
        
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-amber-400 text-xs font-semibold tracking-wide">
            ✨ PREMIUM SERVICED APARTMENTS & MANSIONS
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
            Luxury Staycation Homes <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Made Effortless.
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience hand-picked short-stay homes across Uganda. Reserve directly via WhatsApp with zero extra booking fees, or co-host your property with us.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/properties"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-xl shadow-amber-500/20 text-center"
            >
              Explore Available Stays
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I am interested in co-hosting my property with La Estancia.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#131c2e] hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-8 py-3.5 rounded-xl text-sm transition text-center"
            >
              Partner With Us
            </a>
          </div>
        </div>

        {/* Visual Services Section */}
        <section className="space-y-8 pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/80 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                What We Offer
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                Our Core Services & Portfolio
              </h2>
            </div>
            <p className="text-xs text-gray-400 max-w-md">
              High-touch hospitality for guests and automated co-hosting operations for property owners.
            </p>
          </div>

          {/* Image-Based Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-[#0e1626] border border-gray-800 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/50 transition duration-500 flex flex-col justify-between"
              >
                {/* Image Container with Dark Overlay */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-[#0e1626]/40 to-transparent" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-md text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    {item.badge}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3 -mt-6 relative z-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Link Button */}
                  <div className="pt-4">
                    {item.isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition group-hover:translate-x-1 duration-300"
                      >
                        {item.actionText} <span>→</span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition group-hover:translate-x-1 duration-300"
                      >
                        {item.actionText} <span>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#070b14] py-8 text-center text-xs text-gray-500">
        <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
      </footer>

    </div>
  )
}