'use client'

import { useState, useEffect } from 'react'

const upsellAds = [
  {
    id: 1,
    category: 'AIRPORT TRANSFERS',
    title: 'Airport Pickup Drivers',
    headline: 'Never lose a midnight guest transfer again.',
    description: 'Connect guests directly with vetted airport drivers through your portal and earn instant commission per booking.',
    badge: '🚗 High Margin',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    color: 'from-amber-500/20 to-neutral-900'
  },
  {
    id: 2,
    category: 'LUXURY DINING',
    title: 'In-House Private Chefs',
    headline: 'Turn stays into gourmet experiences.',
    description: 'Offer guests private culinary dining experiences right inside your apartments and villas with custom local menus.',
    badge: '👨‍🍳 Premium Upsell',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    color: 'from-yellow-500/20 to-neutral-900'
  },
  {
    id: 3,
    category: 'STAFF DISPATCH',
    title: 'Automated Housekeeping',
    headline: 'Dispatch cleaning tasks with zero stress.',
    description: 'Assign turnover cleaning and maintenance directly to your team on WhatsApp as soon as check-out is confirmed.',
    badge: '🧹 Operations',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    color: 'from-amber-600/20 to-neutral-900'
  }
]

export default function UpsellMotionSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play / slide off every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % upsellAds.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-neutral-950 border-b border-neutral-800 py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[11px] tracking-wider uppercase">
            Hospitality Revenue Boosters
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Are you in Hospitality & want to be seen? <br className="hidden sm:inline" />
            <span className="text-amber-400">Our Upsell Services got you.</span>
          </h2>
        </div>

        {/* MOTION SLIDER CONTAINER */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl min-h-[360px] sm:min-h-[320px] flex items-center">
          
          {upsellAds.map((ad, idx) => {
            const isActive = idx === currentIndex

            return (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6 ${
                  isActive
                    ? 'opacity-100 translate-x-0 pointer-events-auto z-10'
                    : 'opacity-0 -translate-x-full pointer-events-none z-0'
                }`}
              >
                {/* TEXT CONTENT */}
                <div className="space-y-4 max-w-lg z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase bg-black/60 px-2.5 py-1 rounded-md border border-neutral-800">
                      {ad.category}
                    </span>
                    <span className="text-xs font-bold text-neutral-300">{ad.badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {ad.title}
                  </h3>

                  <p className="text-amber-300/90 font-bold text-xs sm:text-sm">
                    "{ad.headline}"
                  </p>

                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                    {ad.description}
                  </p>

                  <button className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer">
                    Enable Upsell on Dashboard →
                  </button>
                </div>

                {/* SLIDING IMAGE */}
                <div className="w-full md:w-1/2 h-48 sm:h-64 rounded-xl overflow-hidden border border-neutral-800 relative group shrink-0">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              </div>
            )
          })}

        </div>

        {/* SLIDER DOTS / CONTROLS */}
        <div className="flex justify-center items-center gap-2 pt-2">
          {upsellAds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-8 bg-amber-500' : 'w-2.5 bg-neutral-700 hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}