'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Property {
  id: string
  title: string
  category: 'Apartment' | 'Villa' | 'Mansion' | 'House'
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  image_url: string
  whatsapp: string
  desc: string
}

export default function PublicHome() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All Properties')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      const { data, error } = await supabase.from('properties').select('*')
      if (error) throw error
      if (data) setProperties(data)
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = selectedCategory === 'All Properties'
    ? properties
    : properties.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Custom Navigation Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="text-xl font-extrabold tracking-wider text-amber-400">
            LA ESTANCIA
          </Link>

          {/* Horizontal Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <Link href="#properties-section" className="hover:text-amber-400 transition-colors">Properties</Link>
            <Link href="#upsell-section" className="hover:text-amber-400 transition-colors">Upsell Services</Link>
          </nav>

          {/* Hamburger Menu Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-amber-400 focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Hamburger Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-20 right-6 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 z-50">
            <Link 
              href="/login" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-200 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
            >
              🔑 Log in as Host
            </Link>
            <Link 
              href="/about" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              ℹ️ About Us
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              📞 Contact Us
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          La Estancia Vacation Homes
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Global Short-Stay <span className="text-amber-400">Vacation Homes</span>
        </h1>
        
        <p className="text-neutral-400 text-lg max-w-2xl mb-10 leading-relaxed">
          Curated apartments, villas, mansions, and stand-alone houses available for international travelers.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['All Properties', 'Apartment', 'Villa', 'Mansion', 'House'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Property Listings Grid */}
      <section id="properties-section" className="px-6 pb-24 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🏡 {selectedCategory.toUpperCase()} ({filteredProperties.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-sm animate-pulse">
            Loading listings...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800/80">
            <p className="text-neutral-400 text-base font-medium">No properties found in this category.</p>
            <p className="text-neutral-600 text-sm mt-1">Check back soon or explore our other collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col transition-all hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div className="relative h-60 w-full bg-neutral-800 overflow-hidden">
                  <img 
                    src={property.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-400 border border-amber-500/20">
                    {property.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{property.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{property.location}</p>
                    <p className="text-xs text-neutral-300 mt-3 line-clamp-2 leading-relaxed">{property.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
  <span className="text-xs text-emerald-400 font-medium">✓ Verified Host</span>
  <Link
    href={`/book/${property.id}`}
    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2 rounded-lg transition"
  >
    Book Now
  </Link>
</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upsell Hospitality Services Section */}
      <section id="upsell-section" className="px-6 py-16 bg-neutral-900/40 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Exclusive Upsell Services</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-8">
            Enhance your stay with our curated hospitality add-ons, airport transfers, chef services, and guided tours.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
              <h3 className="font-bold text-amber-400 mb-2">🚗 Airport Transfers</h3>
              <p className="text-xs text-neutral-400">Seamless VIP pickup and drop-off directly to your vacation home.</p>
            </div>
            <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
              <h3 className="font-bold text-amber-400 mb-2">👨‍🍳 Private Chef</h3>
              <p className="text-xs text-neutral-400">Enjoy custom gourmet meals prepared right in your villa kitchen.</p>
            </div>
            <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
              <h3 className="font-bold text-amber-400 mb-2">🗺️ Guided Tours</h3>
              <p className="text-xs text-neutral-400">Explore local attractions with experienced professional guides.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 py-12 px-6 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} La Estancia Vacation Homes. All rights reserved.</p>
      </footer>
    </main>
  )
}