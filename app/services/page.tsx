'use client'

import Navbar from '@/components/Navbar'

export default function GuestServicesPage() {
  const whatsappNumber = '256757386946'

  const services = [
    {
      id: '1',
      title: 'Entebbe Airport Pickup / Dropoff',
      category: 'Transport',
      icon: '🚙',
      priceUsd: 40,
      priceUgx: '150,000',
      description: 'Private comfortable transport directly between Entebbe Airport and your villa or apartment.',
    },
    {
      id: '2',
      title: 'Early Check-In / Late Check-Out',
      category: 'Flexibility',
      icon: '⏰',
      priceUsd: 25,
      priceUgx: '95,000',
      description: 'Flexible timing to match your flight schedule (subject to property availability).',
    },
    {
      id: '3',
      title: 'In-House Private Chef Dining',
      category: 'Hospitality',
      icon: '👨‍🍳',
      priceUsd: 60,
      priceUgx: '225,000',
      description: 'Custom breakfast, BBQ, or gourmet dinners prepared live at your stay by verified local chefs.',
    },
    {
      id: '4',
      title: '4x4 SUV / Vehicle Rental',
      category: 'Rentals',
      icon: '🚘',
      priceUsd: 75,
      priceUgx: '280,000',
      description: 'Self-drive or chauffeured Land Cruiser / Prado rentals for Kampala city or safari tours.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
      
      {/* Shared Guest Header */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full space-y-10">
        
        {/* Title Section */}
        <div className="border-b border-gray-200 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2d5a27] bg-[#2d5a27]/10 px-3 py-1 rounded-md">
            Guest Concierge
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">
            Add-On Services & Experiences
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Enhance your stay with our curated guest concierge add-ons. Reserve instantly via WhatsApp with zero hassle.
          </p>
        </div>

        {/* Services Grid (Guest View) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                    {s.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-gray-900">${s.priceUsd}</span>
                  <span className="text-xs text-gray-500 font-semibold">~{s.priceUgx} UGX</span>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello La Estancia! I would like to book the add-on: ${s.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#2d5a27] hover:bg-[#23471f] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <span>💬</span> Book Add-On via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

      </main>

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-xs text-gray-500">
        <p>© 2026 La Estancia Vacation Homes. All rights reserved.</p>
      </footer>

    </div>
  )
}