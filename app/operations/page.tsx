'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function OperationsPMSPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Sample properties portfolio in Uganda
  const properties = [
    {
      id: '1',
      name: 'The Emin Pasha Luxury Villa',
      location: 'Kyanja, Kampala',
      status: 'Active',
      airbnbIcal: 'https://airbnb.com/calendar/ical/123456.ics?s=abcdef',
      bookingIcal: 'https://admin.booking.com/hotel/ical/123456.ics',
      estanciaFeed: 'https://vacation-pms.vercel.app/api/ical/emin-pasha.ics',
    },
    {
      id: '2',
      name: 'Kololo Heights Serviced Apartment',
      location: 'Kololo, Kampala',
      status: 'Active',
      airbnbIcal: 'https://airbnb.com/calendar/ical/789012.ics?s=ghijkl',
      bookingIcal: 'https://admin.booking.com/hotel/ical/789012.ics',
      estanciaFeed: 'https://vacation-pms.vercel.app/api/ical/kololo-heights.ics',
    },
  ]

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans flex flex-col justify-between">
      
      {/* Top PMS Navigation Bar */}
      <nav className="border-b border-gray-800 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center font-black text-black text-lg shadow-lg">
              OS
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-amber-200 bg-clip-text text-transparent">
                EstanciaOS
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-amber-400 font-medium">
                Internal PMS & Operations
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6 text-xs font-semibold text-gray-300">
            <Link href="/" className="hover:text-amber-300 transition">Public Website</Link>
            <Link href="/properties" className="hover:text-amber-300 transition">Properties</Link>
            <Link href="/operations" className="text-amber-400 font-bold border-b-2 border-amber-400 pb-1">iCal Sync & Ops</Link>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-4 py-2 rounded-xl">
            🟢 Supabase RLS Active
          </div>
        </div>
      </nav>

      {/* Main PMS Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10 w-full">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
              Channel Manager
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              iCal Synchronization & Calendar Feeds
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-md">
            Sync your EstanciaOS inventory with Airbnb, Booking.com, and direct WhatsApp reservations to prevent double-booking across platforms.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0e1626] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2">
            <span className="text-xs text-gray-400 font-medium">Active Channels Connected</span>
            <h3 className="text-3xl font-black text-amber-400">Airbnb & Booking.com</h3>
            <p className="text-[11px] text-emerald-400">● Real-time bi-directional sync enabled</p>
          </div>
          <div className="bg-[#0e1626] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2">
            <span className="text-xs text-gray-400 font-medium">Portfolio Properties</span>
            <h3 className="text-3xl font-black text-white">2 Managed Villas</h3>
            <p className="text-[11px] text-gray-400">Kampala & Entebbe region</p>
          </div>
          <div className="bg-[#0e1626] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2">
            <span className="text-xs text-gray-400 font-medium">WhatsApp Direct Sync</span>
            <h3 className="text-3xl font-black text-emerald-400">+256 757 386946</h3>
            <p className="text-[11px] text-gray-400">Instant manual block dispatch</p>
          </div>
        </div>

        {/* Property iCal Management Table */}
        <div className="bg-[#0e1626] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Property Feed Manager</h3>
              <p className="text-xs text-gray-400">Export your EstanciaOS `.ics` link to external OTAs or paste external calendars below.</p>
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow">
              + Add Property Feed
            </button>
          </div>

          <div className="space-y-6">
            {properties.map((prop) => (
              <div key={prop.id} className="bg-[#070b14] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{prop.name}</h4>
                    <span className="text-xs text-gray-400">{prop.location}</span>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full w-fit">
                    {prop.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  
                  {/* EstanciaOS Export Feed */}
                  <div className="space-y-1.5 bg-[#0e1626] p-3.5 rounded-xl border border-gray-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">EstanciaOS Export Link (.ics)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={prop.estanciaFeed}
                        className="w-full bg-black/50 border border-gray-700 text-gray-300 text-[11px] p-2 rounded-lg truncate"
                      />
                      <button
                        onClick={() => handleCopy(prop.estanciaFeed)}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition"
                      >
                        {copiedUrl === prop.estanciaFeed ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Airbnb iCal Import */}
                  <div className="space-y-1.5 bg-[#0e1626] p-3.5 rounded-xl border border-gray-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Airbnb Imported iCal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={prop.airbnbIcal}
                        className="w-full bg-black/50 border border-gray-700 text-gray-300 text-[11px] p-2 rounded-lg truncate"
                      />
                      <button className="bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition">
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Booking.com iCal Import */}
                  <div className="space-y-1.5 bg-[#0e1626] p-3.5 rounded-xl border border-gray-800">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Booking.com Imported iCal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={prop.bookingIcal}
                        className="w-full bg-black/50 border border-gray-700 text-gray-300 text-[11px] p-2 rounded-lg truncate"
                      />
                      <button className="bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition">
                        Update
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#070b14] py-8 text-center text-xs text-gray-500">
        <p>© 2026 EstanciaOS Property Management System. All rights reserved.</p>
      </footer>

    </div>
  )
}