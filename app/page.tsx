'use client'

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UpsellMotionsSlider from '../components/UpsellMotionsSlider'
import { supabase } from '../lib/supabase'

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
    : properties.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Navigation Header */}
      <Navbar />

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
      <section className="px-6 pb-24 max-w-7xl mx-auto w-full flex-1">
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
                    <span className="text-xs text-emerald-400 font-medium">✔ Verified Host</span>
                    <a
                      href={`https://wa.me/${property.whatsapp?.replace('+', '')}?text=Hello,%20I%20would%20like%20to%20inquire%20about%20${encodeURIComponent(property.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      Inquire on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add-on Hospitality Services Slider */}
      <UpsellMotionsSlider />

      {/* Footer */}
      <Footer />
    </main>
  )
}