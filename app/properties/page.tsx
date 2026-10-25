'use client'

import Navbar from '@/components/Navbar'

export default function GuestPropertiesPage() {
  const whatsappNumber = '256757386946'

  const properties = [
    {
      id: '1',
      title: 'The Emin Pasha Luxury Villa',
      location: 'Kyanja, Kampala',
      type: 'Luxury Villa',
      pricePerNight: '$180',
      bedrooms: '4 Beds',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      description: 'Fully furnished private villa with garden, 24/7 security, high-speed Wi-Fi, and dedicated chef service available.',
    },
    {
      id: '2',
      title: 'Kololo Heights Serviced Apartment',
      location: 'Kololo, Kampala',
      type: 'Serviced Apartment',
      pricePerNight: '$110',
      bedrooms: '2 Beds',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      description: 'Modern luxury apartment located in the prime diplomatic zone with city skyline views and backup generator.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
      
      {/* Shared Guest Header */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full space-y-10">
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2d5a27] bg-[#2d5a27]/10 px-3 py-1 rounded-md">
            Portfolio
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">
            Available Stays & Rentals
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Browse our hand-picked collection of luxury serviced apartments and mansions across Uganda.
          </p>
        </div>

        {/* Properties Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="h-64 relative bg-gray-100">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  <span className="absolute top-4 left-4 bg-[#2d5a27] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
                    {p.type}
                  </span>
                  <span className="absolute bottom-4 right-4 bg-black/80 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl backdrop-blur-md">
                    {p.pricePerNight} <span className="text-[10px] font-normal text-gray-300">/ night</span>
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                    <span>📍 {p.location}</span>
                    <span>🛏️ {p.bedrooms}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello La Estancia! I am inquiring about booking ${p.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#2d5a27] hover:bg-[#23471f] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <span>💬</span> Reserve Direct via WhatsApp
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