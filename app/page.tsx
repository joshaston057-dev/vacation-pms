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

  // Privacy-first Structured Reservation Modal State
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProperty) return

    // Secure internal data capture
    const newBooking = {
      property_name: selectedProperty.title,
      guest_name: guestName,
      phone_number: guestContact,
      check_in: checkIn,
      check_out: checkOut,
      status: 'Pending Host Review'
    }

    const { error } = await supabase.from('bookings').insert([newBooking])

    if (error) {
      console.error('Booking submission error:', error.message)
      alert('Failed to submit reservation request. Please try again.')
    } else {
      setBookingSubmitted(true)
      setTimeout(() => {
        setSelectedProperty(null)
        setBookingSubmitted(false)
        setGuestName('')
        setGuestContact('')
        setCheckIn('')
        setCheckOut('')
      }, 2500)
    }
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

                // Dynamic pricing check based on column name in Supabase
                const displayPrice = property.price_per_night || property.nightly_price || property.price || 0

                return (
                  <div key={property.id} className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div>
                      {/* PHOTO DISPLAY CONTAINER */}
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

                        {/* DYNAMIC PRICE BADGE OVERLAY */}
                        <div className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md whitespace-nowrap z-20">
                          ${displayPrice} / night
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

                    {/* PRIVACY-FIRST INTERNAL RESERVATION MODAL TRIGGER */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedProperty(property)}
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

        {/* PRIVATE STRUCTURED RESERVATION MODAL */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="font-extrabold text-white text-sm">Reserve {selectedProperty.title}</h3>
                <button 
                  onClick={() => setSelectedProperty(null)} 
                  className="text-neutral-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {bookingSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <span className="text-3xl">✅</span>
                  <h4 className="font-extrabold text-white text-sm">Reservation Submitted!</h4>
                  <p className="text-xs text-neutral-400">Our host team at La Estancia will review your stay dates and contact you directly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Your Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={guestName} 
                      onChange={e => setGuestName(e.target.value)} 
                      placeholder="Jane Doe" 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Phone Number or Email</label>
                    <input 
                      type="text" 
                      required 
                      value={guestContact} 
                      onChange={e => setGuestContact(e.target.value)} 
                      placeholder="+256..." 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Check-In</label>
                      <input 
                        type="date" 
                        required 
                        value={checkIn} 
                        onChange={e => setCheckIn(e.target.value)} 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Check-Out</label>
                      <input 
                        type="date" 
                        required 
                        value={checkOut} 
                        onChange={e => setCheckOut(e.target.value)} 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer mt-2"
                  >
                    Submit Private Reservation Request
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  )
}