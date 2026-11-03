'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function PublicPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Track expanded states per property ID
  const [unlockedAmenities, setUnlockedAmenities] = useState<{ [key: number]: boolean }>({})
  const [unlockedDescriptions, setUnlockedDescriptions] = useState<{ [key: number]: boolean }>({})

  // Booking Modal State
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [demographics, setDemographics] = useState('Couple with Kids')
  const [guestCount, setGuestCount] = useState('2')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data } = await supabase.from('properties').select('*').order('id', { ascending: false })
    if (data) setProperties(data)
    setLoading(false)
  }

  const toggleAmenitiesView = (id: number) => {
    setUnlockedAmenities(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleDescriptionView = (id: number) => {
    setUnlockedDescriptions(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProperty) return

    setLoading(true)

    const payload: any = {
      property_name: selectedProperty.title,
      guest_name: guestName,
      phone: guestContact,
      demographics: demographics,
      guest_count: parseInt(guestCount) || 1,
      check_in: checkIn,
      check_out: checkOut,
      special_requests: specialRequests,
      status: 'Pending Host Review'
    }

    let { error } = await supabase.from('bookings').insert([payload])

    if (error) {
      const basicPayload = {
        property_name: selectedProperty.title,
        guest_name: guestName,
        phone: guestContact,
        check_in: checkIn,
        check_out: checkOut,
        status: 'Pending Host Review'
      }
      const retry = await supabase.from('bookings').insert([basicPayload])
      error = retry.error
    }

    if (error) {
      alert('Error submitting reservation: ' + error.message)
    } else {
      setBookingSubmitted(true)
      setTimeout(() => {
        setSelectedProperty(null)
        setBookingSubmitted(false)
        setGuestName('')
        setGuestContact('')
        setCheckIn('')
        setCheckOut('')
        setSpecialRequests('')
      }, 2500)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Exclusive Short-Stay Properties in Uganda
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Apartments, standalone houses, mansions, and villas with private booking.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading && properties.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm font-bold animate-pulse">Loading properties...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => {
                let imageList: string[] = []
                let amenitiesList: string[] = []
                try { imageList = typeof property.images === 'string' ? JSON.parse(property.images) : (property.images || []) } catch (e) { imageList = [] }
                try { 
                  if (Array.isArray(property.amenities)) {
                    amenitiesList = property.amenities
                  } else if (typeof property.amenities === 'string') {
                    if (property.amenities.startsWith('{') && property.amenities.endsWith('}')) {
                      amenitiesList = property.amenities.slice(1, -1).split(',').map(s => s.replace(/^"(.*)"$/, '$1').trim()).filter(Boolean)
                    } else if (property.amenities.startsWith('[')) {
                      amenitiesList = JSON.parse(property.amenities)
                    } else {
                      amenitiesList = property.amenities.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  }
                } catch (e) { 
                  amenitiesList = [] 
                }

                const mainImage = imageList.length > 0 ? imageList[0] : null
                const displayPrice = property.price_per_night || property.nightly_price || property.price || 0
                const isAmenitiesUnlocked = unlockedAmenities[property.id] || false
                const isDescUnlocked = unlockedDescriptions[property.id] || false

                return (
                  <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="relative w-full bg-neutral-950 min-h-[224px]">
                        {mainImage ? (
                          <img src={mainImage} alt={property.title} className="w-full h-56 object-cover" />
                        ) : (
                          <div className="w-full h-56 bg-neutral-950 flex items-center justify-center text-neutral-600 text-xs font-bold">📷 No Photos</div>
                        )}
                        <div className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md">
                          ${displayPrice} / night
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-extrabold text-white text-base leading-snug">{property.title}</h3>
                        <p className="text-xs text-neutral-400">📍 {property.location || 'Kampala, Uganda'}</p>

                        {/* UNLOCK DESCRIPTION TOGGLE */}
                        {property.description && (
                          <div className="space-y-1.5 pt-1">
                            <button
                              onClick={() => toggleDescriptionView(property.id)}
                              className="w-full py-1.5 px-3 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold text-neutral-300 flex items-center justify-between transition cursor-pointer"
                            >
                              <span>📖 {isDescUnlocked ? 'Hide Description' : 'Unlock Description'}</span>
                              <span>{isDescUnlocked ? '▲' : '▼'}</span>
                            </button>

                            {isDescUnlocked && (
                              <div className="p-3 bg-neutral-950/90 border border-neutral-800 rounded-xl text-xs text-neutral-300 leading-relaxed animate-fadeIn">
                                {property.description}
                              </div>
                            )}
                          </div>
                        )}

                        {/* UNLOCK AMENITIES TOGGLE */}
                        {amenitiesList.length > 0 && (
                          <div className="space-y-1.5">
                            <button
                              onClick={() => toggleAmenitiesView(property.id)}
                              className="w-full py-1.5 px-3 bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 rounded-xl text-xs font-bold text-amber-400 flex items-center justify-between transition cursor-pointer"
                            >
                              <span>✨ {isAmenitiesUnlocked ? 'Hide Amenities' : `Unlock Amenities (${amenitiesList.length})`}</span>
                              <span>{isAmenitiesUnlocked ? '▲' : '▼'}</span>
                            </button>

                            {isAmenitiesUnlocked && (
                              <div className="grid grid-cols-2 gap-1.5 p-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl animate-fadeIn">
                                {amenitiesList.map((amenity, idx) => (
                                  <span key={idx} className="text-[10px] text-neutral-300 flex items-center gap-1">
                                    ✓ {amenity}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
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

        {/* BOOKING MODAL */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl">
              <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-white text-base">{selectedProperty.title}</h3>
                  <p className="text-xs text-amber-500 font-bold">📍 {selectedProperty.location || 'Kampala, Uganda'}</p>
                </div>
                <button onClick={() => setSelectedProperty(null)} className="text-neutral-400 hover:text-white font-bold text-base cursor-pointer">✕</button>
              </div>

              {bookingSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <span className="text-4xl">✅</span>
                  <h4 className="font-extrabold text-white text-base">Reservation Submitted!</h4>
                  <p className="text-xs text-neutral-400">Our host team will review your stay details and contact you via WhatsApp.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">YOUR FULL NAME</label>
                    <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Jane Doe" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">WHATSAPP NUMBER</label>
                    <input type="tel" required value={guestContact} onChange={e => setGuestContact(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-amber-400 font-extrabold block mb-1">GUEST DEMOGRAPHIC</label>
                      <select value={demographics} onChange={e => setDemographics(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 cursor-pointer">
                        <option value="Couple with Kids">👨‍👩‍👧‍👦 Couple with Kids</option>
                        <option value="Couple Only">👩‍❤️‍👨 Couple Only</option>
                        <option value="Solo Business Traveler">💼 Solo Business Traveler</option>
                        <option value="Group of Friends">🥳 Group of Friends</option>
                        <option value="Family Relocation">🏠 Family Relocation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">TOTAL GUESTS</label>
                      <input type="number" min="1" required value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="2" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">CHECK-IN DATE</label>
                      <input type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">CHECK-OUT DATE</label>
                      <input type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">SPECIAL REQUESTS / NOTES</label>
                    <textarea rows={2} value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="e.g. Need baby cot, airport pickup setup..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 resize-none" />
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer mt-2">
                    {loading ? 'Submitting Reservation...' : 'Submit Private Reservation Request'}
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