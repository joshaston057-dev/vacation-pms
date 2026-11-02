'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error.message)
    } else if (data) {
      setProperties(data)
    }
    setLoading(false)
  }

  const categories = ['All', 'Apartment', 'Standalone House', 'Mansion', 'Villa']

  const filteredProperties = selectedCategory === 'All'
    ? properties
    : properties.filter(p => p.category === selectedCategory || (p.title && p.title.toLowerCase().includes(selectedCategory.toLowerCase())))

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO HEADER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore <span className="text-amber-500">La Estancia</span> Stays
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Discover premium fully furnished apartments, standalone houses, mansions, and villas across Kampala & Entebbe.
          </p>

          {/* CATEGORY FILTER BUTTONS */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-lg scale-105'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* PROPERTIES GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="text-center py-20 text-neutral-500 text-sm font-bold animate-pulse">
              Loading available properties...
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-sm">No properties found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => {
                // Safely parse image array (handles stringified JSON, raw arrays, or fallback nulls)
                const imageList = typeof property.images === 'string'
                  ? JSON.parse(property.images)
                  : (Array.isArray(property.images) ? property.images : [])

                const mainImage = imageList.length > 0 ? imageList[0] : null
                const extraImages = imageList.slice(1, 5)

                return (
                  <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-neutral-700 transition">
                    <div>
                      {/* IMAGE CAROUSEL / GRID DISPLAY */}
                      {mainImage ? (
                        <div className="space-y-1">
                          <img
                            src={mainImage}
                            alt={property.title}
                            className="w-full h-56 object-cover"
                          />
                          {extraImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-1 px-1">
                              {extraImages.map((imgUrl: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={`${property.title} preview ${idx + 2}`}
                                  className="w-full h-16 object-cover rounded-md"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-56 bg-neutral-950 flex items-center justify-center text-neutral-600 text-xs font-bold">
                          📷 No Photos Available
                        </div>
                      )}

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h2 className="font-extrabold text-white text-base leading-snug">{property.title}</h2>
                          <span className="text-amber-400 font-extrabold text-sm px-2.5 py-1 bg-amber-500/10 rounded-lg whitespace-nowrap">
                            ${property.nightly_price || property.price_per_night || 0}/night
                          </span>
                        </div>

                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          📍 {property.location || 'Kampala, Uganda'}
                        </p>

                        {property.description && (
                          <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                            {property.description}
                          </p>
                        )}

                        {/* AMENITIES BADGES */}
                        {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {property.amenities.map((amenity: string, idx: number) => (
                              <span key={idx} className="text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DIRECT WHATSAPP INQUIRY ACTION */}
                    <div className="p-5 pt-0">
                      <a
                        href={`https://wa.me/256757386946?text=${encodeURIComponent(`Hello La Estancia, I am interested in booking: ${property.title} ($${property.nightly_price || 0}/night). Is it available?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                      >
                        💬 Inquire / Book via WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  )
}