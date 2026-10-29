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
  description?: string
  amenities?: string[]
  whatsapp_number?: string
  image_url?: string
  image_urls?: string[]
}

export default function BrowseStaysPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: string]: number }>({})

  // Filter states
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

        if (error) console.error('Error fetching properties:', error.message)
        else setProperties(data || [])
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const filteredProperties = properties.filter((property) => {
    const matchesType =
      selectedType === 'All' ||
      (property.property_type && property.property_type.toLowerCase() === selectedType.toLowerCase())

    let matchesBedrooms = true
    const beds = property.bedrooms || 1

    if (selectedBedrooms === '1') matchesBedrooms = beds === 1
    else if (selectedBedrooms === '2') matchesBedrooms = beds === 2
    else if (selectedBedrooms === '3') matchesBedrooms = beds === 3
    else if (selectedBedrooms === '4+') matchesBedrooms = beds >= 4

    return matchesType && matchesBedrooms
  })

  const setCardActiveImage = (propertyId: string, index: number) => {
    setActiveImageIndexes((prev) => ({ ...prev, [propertyId]: index }))
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* Page Header */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-6 sm:py-8 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-1.5">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-amber-500 tracking-tight">
              Browse La Estancia Catalogue
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto">
              Filter through our furnished apartments, standalone houses, luxury mansions, and serviced villas.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="max-w-6xl mx-auto p-3 sm:p-6">
          <div className="bg-neutral-900 border border-neutral-800 p-3 sm:p-5 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            
            <div className="w-full sm:w-1/2">
              <label className="block text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Property Category
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {['All', 'Apartment', 'Standalone House', 'Villa', 'Mansion'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition ${
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

            <div className="w-full sm:w-1/2">
              <label className="block text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Size / Bedrooms
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {['All', '1', '2', '3', '4+'].map((beds) => (
                  <button
                    key={beds}
                    onClick={() => setSelectedBedrooms(beds)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition ${
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

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-neutral-400">Loading listings...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <p className="text-amber-500 font-bold text-base mb-1">No Matching Properties</p>
              <p className="text-neutral-400 text-xs mb-4">Try adjusting your search filters.</p>
              <button
                onClick={() => {
                  setSelectedType('All')
                  setSelectedBedrooms('All')
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProperties.map((prop) => {
                const whatsapp = prop.whatsapp_number || '+256757386946'
                const images = prop.image_urls && prop.image_urls.length > 0 
                  ? prop.image_urls 
                  : [prop.image_url || '/placeholder.jpg']
                
                const activeIdx = activeImageIndexes[prop.id] || 0
                const currentImg = images[activeIdx] || images[0]

                return (
                  <div
                    key={prop.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Main Active Photo Viewport */}
                      <div className="relative h-44 sm:h-64 lg:h-72 bg-neutral-950 overflow-hidden">
                        <img
                          src={currentImg}
                          alt={prop.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-black font-extrabold text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                          ${prop.price_per_night ?? prop.price ?? 0} / night
                        </span>
                      </div>

                      {/* Photo Thumbnail Navigation Strip for all 5 images */}
                      {images.length > 1 && (
                        <div className="flex items-center gap-1.5 p-2 bg-neutral-950/80 overflow-x-auto border-b border-neutral-800">
                          {images.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCardActiveImage(prop.id, idx)}
                              className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                                activeIdx === idx ? 'border-amber-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Content Details */}
                      <div className="p-2.5 sm:p-4 space-y-2">
                        <div>
                          <h3 className="font-bold text-white text-xs sm:text-base leading-tight line-clamp-2">{prop.title}</h3>
                          <p className="text-[10px] sm:text-xs text-neutral-400 capitalize mt-0.5">📍 {prop.location}</p>
                        </div>

                        {/* Room Badges Bar */}
                        <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-neutral-300 py-1 border-y border-neutral-800/80">
                          <span>🛏️ {prop.bedrooms ?? 1} Bed</span>
                          <span>🚿 {prop.bathrooms ?? 1} Bath</span>
                          <span>👥 {prop.guests ?? 2} Guests</span>
                        </div>

                        {/* Description */}
                        {prop.description ? (
                          <p className="text-[10px] sm:text-xs text-neutral-300 leading-snug line-clamp-2">
                            {prop.description}
                          </p>
                        ) : null}

                        {/* Amenities Badges Display */}
                        {prop.amenities && prop.amenities.length > 0 && (
                          <div className="pt-1">
                            <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                              Included Amenities
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {prop.amenities.map((item, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] sm:text-[10px] bg-neutral-950 border border-neutral-800 text-amber-500 font-medium px-2 py-0.5 rounded-md"
                                >
                                  ✓ {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-4 pt-0">
                      <a
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hi!%20I%20am%20interested%20in%20booking%20${encodeURIComponent(prop.title)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl transition"
                      >
                        💬 WhatsApp Inquire
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