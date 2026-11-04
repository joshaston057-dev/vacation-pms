'use client'

import { useState } from 'react'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
import BookingModal from './components/BookingModal'

const featuredProperties = [
  {
    id: 1,
    title: '2 bedroom fully furnished Airbnb apartment for rent in Ntinda',
    location: 'Ntinda, Kampala',
    price: 45,
    category: 'Apartment',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: '5 Bedroom Fully Furnished Mansion',
    location: 'Entebbe',
    price: 70,
    category: 'Mansion',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: '3 Bedroom Luxury Villa for Rent',
    location: 'Munyonyo',
    price: 70,
    category: 'Villa',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'Furnished Short-Stay Studio',
    location: 'Kisaasi, Kampala',
    price: 35,
    category: 'Studio',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
  }
]

export default function HomePage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            La Estancia Vacation Homes
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Book Furnished Short-Stay Stays in Uganda
          </h1>
          <p className="text-xs sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Transparent pricing, zero cleaning fees, instant WhatsApp host support, and flexible payments.
          </p>
        </section>

        {/* PROPERTY LISTINGS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-neutral-700 transition"
              >
                <div className="h-56 w-full relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border border-neutral-800">
                    {property.category}
                  </span>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                      {property.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">📍 {property.location}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                    <div>
                      <span className="text-xs text-neutral-400">Nightly Rate: </span>
                      <span className="font-black text-amber-400 text-base">${property.price} / night</span>
                    </div>

                    <button
                      onClick={() => setSelectedProperty(property)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RENDER BOOKING MODAL ON SELECTION */}
      {selectedProperty && (
        <BookingModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <Footer />
    </main>
  )
}