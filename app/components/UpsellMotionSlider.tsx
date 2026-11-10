'use client'

import { useState, useEffect } from 'react'

const portalAds = [
  {
    id: 1,
    category: 'AIRPORT TRANSFERS',
    title: 'Airport Pickup Drivers',
    headline: 'Never lose a midnight guest transfer again.',
    description: 'Connect arriving guests directly with vetted airport cab drivers and earn instant commission per booking.',
    badge: '🚗 High Margin',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    category: 'LUXURY DINING',
    title: 'In-House Private Chefs',
    headline: 'Gourmet dining right inside your villas.',
    description: 'Dispatch professional private chefs to cook customized local and international menus directly in your property kitchen.',
    badge: '👨‍🍳 VIP Experience',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    category: 'FINANCE & BUDGETING',
    title: 'Financial Ledger & Budgeting',
    headline: 'Track net profits, gas, Wi-Fi & rent expenses.',
    description: 'Keep your property accounting spotless with automated expense tracking, revenue breakdowns, and host bill logs.',
    badge: '💰 Financial Control',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    category: 'STAFF DISPATCH',
    title: 'Automated Housekeeping',
    headline: 'Zero-stress turnover cleaning workflows.',
    description: 'Assign cleaning and maintenance tasks instantly to your team on WhatsApp as soon as check-out is confirmed.',
    
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    category: 'RESERVATIONS',
    title: 'Live Guest Bookings',
    headline: 'Centralized control for every property.',
    description: 'Track guest demographics, manage confirmed stays, and communicate with guests via direct WhatsApp links.',
    badge: '📊 Full PMS',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
  }
]

export default function UpsellMotionSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % portalAds.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-neutral-950 border-b border-neutral-800 py-8 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[11px] tracking-wider uppercase">
            Complete Hospitality Ecosystem
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            Are you in Hospitality & want total control? <br className="hidden sm:inline" />
            <span className="text-amber-400">Our Operations, Finance & Upsells got you.</span>
          </h2>
        </div>

        {/* MOTION SLIDER CONTAINER */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
          
          <div className="relative w-full">
            {portalAds.map((ad, idx) => {
              const isActive = idx === currentIndex

              return (
                <div
                  key={ad.id}
                  className={`transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center justify-between p-5 sm:p-8 gap-5 ${
                    isActive
                      ? 'opacity-100 relative translate-x-0 pointer-events-auto z-10'
                      : 'opacity-0 absolute inset-0 -translate-x-full pointer-events-none z-0'
                  }`}
                >
                  {/* TEXT CONTENT */}
                  <div className="space-y-3 w-full md:w-1/2 z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase bg-black/60 px-2.5 py-1 rounded-md border border-neutral-800">
                        {ad.category}
                      </span>
                      <span className="text-xs font-bold text-neutral-300">{ad.badge}</span>
                    </div>

                    <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      {ad.title}
                    </h3>

                    <p className="text-amber-300/90 font-bold text-xs sm:text-sm">
                      "{ad.headline}"
                    </p>

                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                      {ad.description}
                    </p>

                    <a
                      
                      className="inline-block py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer text-center"
                    >
                      Access Host Operations →
                    </a>
                  </div>

                  {/* SLIDING IMAGE */}
                  <div className="w-full md:w-1/2 h-44 sm:h-60 rounded-xl overflow-hidden border border-neutral-800 relative group shrink-0 shadow-inner">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* SLIDER DOTS / CONTROLS */}
        <div className="flex justify-center items-center gap-2 pt-1">
          {portalAds.map((_, idx) => (
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