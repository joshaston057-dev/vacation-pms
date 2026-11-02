'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
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

        {/* HERO BANNER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Exclusive Short-Stay Properties in Uganda
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Apartments, standalone houses, mansions, and villas with premium guest concierge services.
          </p>

          {/* CATEGORY FILTERS */}
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

        {/* MAIN CATALOG GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Featured Properties</h2>
            <a href="/properties" className="text-xs text-amber-400 hover:text-amber-300 font-bold">
              Browse All Stays →
            </a>
          </div>

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
                // Parse photo array safely
                let imageList: string[] = []
                try {
                  if (typeof property.images === 'string') {
                    imageList = JSON.parse(property.images)
                  } else if (Array.isArray(property.images)) {
                    imageList = property.images
                  }
                } catch (e) {
                  imageList = []
                }

                const mainImage = imageList.length > 0 ? imageList[0] : null
                const extraImages = imageList.slice(1, 5)

                return (
                  <div key={property.id} className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div>
                      {/* FIXED CONTAINER HEIGHT PREVENTS COLLAPSE */}
                      <div className="relative w-full bg-neutral-950 min-h-[224px]">
                        {mainImage ? (
                          <div className="space-y-1">
                            <img
                              src={mainImage}
                              alt={property.title || 'Property photo'}
                              className="w-full h-56 object-cover"
                            />
                            {extraImages.length > 0 && (
                              <div className="grid grid-cols-4 gap-1 px-1">
                                {extraImages.map((imgUrl: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={imgUrl}
                                    alt={`Preview ${idx + 2}`}
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

                        {/* PRICE BADGE OVERLAY */}
                        <div className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md whitespace-nowrap z-20">
                          ${property.nightly_price ?? property.price_per_night ?? property.price ?? 0} / night
                        </div>

                        {/* PHOTO COUNT BADGE */}
                        {imageList.length > 0 && (
                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 z-20">
                            📷 {imageList.length} Photos
                          </div>
                        )}
                      </div>

                      {/* CARD DETAILS */}
                      <div className="p-5 space-y-3">
                        <h3 className="font-extrabold text-white text-base leading-snug">
                          {property.title}
                        </h3>

                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          📍 {property.location || 'Kampala, Uganda'}
                        </p>

                        {/* BED / BATH / GUESTS META */}
                        <div className="flex items-center gap-3 text-xs text-neutral-400 pt-1">
                          {property.bedrooms && <span>🛏️ {property.bedrooms} Bed</span>}
                          {property.bathrooms && <span>🚿 {property.bathrooms} Bath</span>}
                          {property.max_guests && <span>👥 {property.max_guests} Guests</span>}
                        </div>

                        {property.description && (
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed pt-1">
                            {property.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => {
                          const phone = property.whatsapp_contact || '+256757386946'
                          const msg = encodeURIComponent(`Hello La Estancia, I am interested in booking: ${property.title}`)
                          window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        View Gallery & Book Now
                      </button>
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