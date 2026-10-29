'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  title: string
  location: string
  price_per_night?: number
  price?: number
  bedrooms?: number
  bathrooms?: number
  guests?: number
  property_type?: string
  whatsapp_number?: string
  image_url?: string
  image_urls?: string[]
}

export default function StaysPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // --- FILTER STATES ---
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('All')

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) console.error('Error loading properties:', error.message)
        else setProperties(data || [])
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // --- FILTER LOGIC ---
  const filteredProperties = properties.filter((property) => {
    // Filter by Property Type
    const matchesType =
      selectedType === 'All' ||
      (property.property_type && property.property_type.toLowerCase() === selectedType.toLowerCase())

    // Filter by Bedroom Size
    let matchesBedrooms = true
    const beds = property.bedrooms || 1

    if (selectedBedrooms === '1') matchesBedrooms = beds === 1
    else if (selectedBedrooms === '2') matchesBedrooms = beds === 2
    else if (selectedBedrooms === '3') matchesBedrooms = beds === 3
    else if (selectedBedrooms === '4+') matchesBedrooms = beds >= 4

    return matchesType && matchesBedrooms
  })

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* --- PAGE HEADER --- */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-12 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-amber-500 tracking-tight">
              Browse La Estancia Catalogue
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
              Explore our curated portfolio of furnished luxury apartments, standalone houses, serviced villas, and private mansions.
            </p>
          </div>
        </section>

        {/* --- CATEGORY FILTER BAR --- */}
        <section className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            
            {/* Property Type Filter */}
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Property Category / Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Apartment', 'House', 'Villa', 'Mansion'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedType === type
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedroom / Size Filter */}
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Size / Bedrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', '1', '2', '3', '4+'].map((beds) => (
                  <button
                    key={beds}
                    onClick={() => setSelectedBedrooms(beds)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedBedrooms === beds
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {beds === 'All' ? 'Any Size' : beds === '4+' ? '4+ Beds' : `${beds} Bed`}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* --- RESULTS GRID --- */}
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-neutral-400">Loading properties catalogue...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <p className="text-amber-500 font-bold text-lg mb-1">No Matching Properties Found</p>
              <p className="text-neutral-400 text-xs">Try clearing or adjusting your category filters above.</p>
              <button
                onClick={() => {
                  setSelectedType('All')
                  setSelectedBedrooms('All')
                }}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((prop) => {
                const whatsapp = prop.whatsapp_number || '+256757386946'
                const displayImg = prop.image_urls?.[0] || prop.image_url || '/placeholder.jpg'

                return (
                  <div
                    key={prop.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-neutral-950 overflow-hidden">
                        <img
                          src={displayImg}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 bg-amber-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-md">
                          ${prop.price_per_night ?? prop.price ?? 0} / night
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-white text-base leading-snug">{prop.title}</h3>
                        <p className="text-xs text-neutral-400">{prop.location}</p>

                        <div className="flex items-center gap-3 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                          <span>🛏️ {prop.bedrooms ?? 1} Bed</span>
                          <span>🚿 {prop.bathrooms ?? 1} Bath</span>
                          <span>👥 Up to {prop.guests ?? 2} Guests</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <a
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hi!%20I%20am%20interested%20in%20booking%20${encodeURIComponent(prop.title)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                      >
                        💬 Inquire / Book on WhatsApp
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