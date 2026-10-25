'use client'

import Link from 'next/link'

export default function HomePage() {
  const whatsappNumber = '256757386946'
  const directBookingMsg = encodeURIComponent(
    'Hello La Estancia! I am looking to book a short-stay property in Uganda. Please share available listings.'
  )

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
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

          {/* Nav Links */}
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

          {/* Direct Contact Button */}
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-20">
        
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

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-medium">
            Experience hand-picked short-stay apartments and standalone houses across Uganda. Reserve directly via WhatsApp with zero extra booking fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/properties"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-xl shadow-amber-500/20 text-center"
            >
              Explore Available Stays
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I am a property owner interested in listing my property with La Estancia Vacation Homes.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#131c2e] hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-8 py-3.5 rounded-xl text-sm transition text-center"
            >
              List Your Property With Us
            </a>
          </div>
        </div>

        {/* Feature Cards: What We Offer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          
          <div className="bg-[#0e1626] border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
              🏡
            </div>
            <h3 className="text-lg font-bold text-white">Verified Luxury Stays</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every home in our portfolio is fully serviced, furnished to high standard, and managed with strict quality checks.
            </p>
          </div>

          <div className="bg-[#0e1626] border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              💬
            </div>
            <h3 className="text-lg font-bold text-white">Direct Booking Savings</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Skip third-party service fees and enjoy instant confirmations straight to your WhatsApp with flexible stay options.
            </p>
          </div>

          <div className="bg-[#0e1626] border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-lg">
              🧹
            </div>
            <h3 className="text-lg font-bold text-white">Seamless Management</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Property owners get complete turnover oversight, automated calendar syncing, and maximized occupancy rates.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#070b14] py-8 text-center text-xs text-gray-500">
        <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
      </footer>

    </div>
  )
}