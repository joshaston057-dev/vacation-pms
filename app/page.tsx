'use client'

import { useState } from 'react'

export default function PublicHome() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Your property portfolio data
  const properties = [
    {
      id: 1,
      name: 'Entebbe Lakeside Villa',
      category: 'Villa',
      location: 'Entebbe Road',
      price: '$250 / night',
      image: '/properties/villa.jpg', // or placeholder
      desc: 'Stunning luxury villa overlooking the lake with a private pool and secure compound.',
      whatsapp: '+256757386946'
    },
    {
      id: 2,
      name: 'Kisaasi Executive Suite',
      category: 'Apartment',
      location: 'Kisaasi',
      price: '$80 / night',
      image: '/properties/apartment.jpg',
      desc: 'Modern, secure 1-bedroom apartment in a prime neighborhood with fast Wi-Fi.',
      whatsapp: '+256780564778'
    }
  ];

  const filteredProperties = selectedCategory === 'All' 
    ? properties 
    : properties.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Public Header */}
      <header className="border-b border-neutral-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-neutral-950/80 backdrop-blur z-50">
        <div className="text-xl font-bold tracking-tight text-emerald-400">La Estancia</div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="#properties" className="hover:text-white transition">Properties</a>
          <a href="#about" className="hover:text-white transition">About Us</a>
          <a href="#blogs" className="hover:text-white transition">Blogs</a>
        </nav>
        <a 
          href="/signin" 
          className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          Host Sign In
        </a>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-16 max-w-7xl mx-auto text-center">
        <span className="text-xs uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
          La Estancia Vacation Homes
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight mt-4">Global Short-Stay Vacation Homes</h1>
        <p className="text-neutral-400 max-w-xl mx-auto mt-2 text-sm">
          Curated apartments, villas, mansions, and stand-alone houses available for international travelers.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['All', 'Apartment', 'Villa', 'Mansion', 'House'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat 
                  ? 'bg-amber-500 text-neutral-950 font-bold' 
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {cat === 'All' ? '✨ All Properties' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Property Listings Grid */}
      <section id="properties" className="px-8 pb-20 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          🏠 Available Stays ({filteredProperties.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group hover:border-amber-500/50 transition">
              <div className="h-48 bg-neutral-800 relative flex items-center justify-center text-neutral-500">
                [Property Image]
                <span className="absolute top-3 left-3 bg-neutral-950/80 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-semibold border border-neutral-700">
                  {property.category}
                </span>
                <span className="absolute bottom-3 right-3 bg-neutral-950/90 text-amber-400 text-sm px-3 py-1 rounded-md font-bold border border-amber-500/30">
                  {property.price}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold group-hover:text-amber-400 transition">{property.name}</h3>
                <p className="text-xs text-neutral-400 mt-1">{property.location}</p>
                <p className="text-xs text-neutral-300 mt-3 line-clamp-2">{property.desc}</p>
                
                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">● Verified Host</span>
                  <a
                    href={`https://wa.me/${property.whatsapp.replace('+', '')}?text=Hello,%20I%20would%20like%20to%20inquire%20about%20booking%20${encodeURIComponent(property.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                  >
                    Inquire on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}