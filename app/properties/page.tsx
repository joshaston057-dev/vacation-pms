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
  
  // Structured Booking Modal State (Privacy-first)
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
      alert('Failed to submit booking request. Please try again.')
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

        {/* CLEAN PROPERTIES GRID */}
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
                // Safely parse images for Mobile & Desktop
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
                  <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                    <div>
                      {/* IMAGE CAROUSEL / DISPLAY */}
                      {mainImage ? (
                        <div className="space-y-1 w-full overflow-hidden bg-neutral-950">
                          <img
                            src={mainImage}
                            alt={property.title || 'Property photo'}
                            className="w-full h-56 object-cover"
                            loading="lazy"
                          />
                          {extraImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-1 px-1 pb-1">
                              {extraImages.map((imgUrl: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={`Thumbnail ${idx + 2}`}
                                  className="w-full h-16 object-cover rounded-md"
                                  loading="lazy"
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
                        {/* TITLE & UNTRUNCATED DYNAMIC PRICE HEADER */}
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="font-extrabold text-white text-base leading-snug flex-1">
                            {property.title}
                          </h2>
                          <span className="text-amber-400 font-extrabold text-xs sm:text-sm px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl whitespace-nowrap shrink-0">
                            ${property.nightly_price ?? property.price_per_night ?? property.price ?? 0}/night
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
                      </div>
                    </div>

                    {/* PRIVACY-FIRST STRUCTURED BOOKING ACTION */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                      >
                        Request Reservation
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* STRUCTURED BOOKING MODAL */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="font-extrabold text-white text-sm">Reserve {selectedProperty.title}</h3>
                <button onClick={() => setSelectedProperty(null)} className="text-neutral-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
              </div>

              {bookingSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <span className="text-3xl">✅</span>
                  <h4 className="font-extrabold text-white text-sm">Request Submitted!</h4>
                  <p className="text-xs text-neutral-400">Our host team at La Estancia will review your dates and confirm your stay shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Your Full Name</label>
                    <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Jane Doe" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Contact Phone / Email</label>
                    <input type="text" required value={guestContact} onChange={e => setGuestContact(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Check-In</label>
                      <input type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Check-Out</label>
                      <input type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer mt-2">
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