'use client'

import { useState, useEffect } from 'react'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
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
  image_url?: string
  image_urls?: string[]
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: string]: number }>({})

  // Booking Modal States
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [adultsCount, setAdultsCount] = useState('1')
  const [childrenCount, setChildrenCount] = useState('0')
  const [guestMessage, setGuestMessage] = useState('')
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

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

  const setCardActiveImage = (propertyId: string, index: number) => {
    setActiveImageIndexes((prev) => ({ ...prev, [propertyId]: index }))
  }

  const handleOpenBookingModal = (property: Property) => {
    setSelectedPropertyForBooking(property)
    setBookingSuccess(false)
    setGuestName('')
    setGuestContact('')
    setCheckInDate('')
    setCheckOutDate('')
    setAdultsCount('1')
    setChildrenCount('0')
    setGuestMessage('')
  }

  const handleCloseBookingModal = () => {
    setSelectedPropertyForBooking(null)
    setBookingSuccess(false)
  }

  const handleBookNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPropertyForBooking) return

    setSubmittingInquiry(true)
    try {
      const pricePerNight = selectedPropertyForBooking.price_per_night || selectedPropertyForBooking.price || 0
      
      let totalAmount = pricePerNight
      if (checkInDate && checkOutDate) {
        const start = new Date(checkInDate)
        const end = new Date(checkOutDate)
        const diffTime = end.getTime() - start.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays > 0) {
          totalAmount = diffDays * pricePerNight
        }
      }

      const occupantsText = `${adultsCount} Adult(s), ${childrenCount} Child(ren)`

      const { error } = await supabase.from('bookings').insert([
        {
          property_title: selectedPropertyForBooking.title,
          guest_name: guestName,
          guest_phone: guestContact,
          check_in: checkInDate,
          check_out: checkOutDate,
          total_price: totalAmount,
          status: 'Pending Host Review',
          notes: `Occupants: ${occupantsText}. Note: ${guestMessage || 'None'}`,
        },
      ])

      if (error) {
        alert('Booking error: ' + error.message)
      } else {
        setBookingSuccess(true)
      }
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Unable to submit booking inquiry.'))
    } finally {
      setSubmittingInquiry(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* Hero Banner */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-10 sm:py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-3">
            <span className="text-amber-500 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              La Estancia Vacation Homes
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Exclusive Short-Stay Properties
            </h1>
            <p className="text-neutral-400 text-xs sm:text-base max-w-xl mx-auto">
              Furnished apartments, standalone houses, luxury mansions, and villas.
            </p>
          </div>
        </section>

        {/* Properties Section */}
        <section className="max-w-6xl mx-auto p-4 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-6">Featured Properties</h2>

          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-neutral-400">Loading listings...</p>
            </div>
          ) : properties.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">No properties available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => {
                const images = prop.image_urls && prop.image_urls.length > 0 
                  ? prop.image_urls 
                  : [prop.image_url || '/placeholder.jpg']
                
                const activeIdx = activeImageIndexes[prop.id] || 0
                const currentImg = images[activeIdx] || images[0]

                return (
                  <div
                    key={prop.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Viewport */}
                      <div className="relative h-60 bg-neutral-950 overflow-hidden">
                        <img
                          src={currentImg}
                          alt={prop.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        <span className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                          ${prop.price_per_night ?? prop.price ?? 0} / night
                        </span>
                      </div>

                      {/* Photo Thumbnail Strip */}
                      {images.length > 1 && (
                        <div className="flex items-center gap-1.5 p-2 bg-neutral-950/80 overflow-x-auto border-b border-neutral-800">
                          {images.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCardActiveImage(prop.id, idx)}
                              className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                                activeIdx === idx ? 'border-amber-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Details */}
                      <div className="p-4 space-y-2">
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">{prop.title}</h3>
                          <p className="text-xs text-neutral-400 capitalize mt-0.5">📍 {prop.location}</p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-300 py-1 border-y border-neutral-800/80">
                          <span>🛏️ {prop.bedrooms ?? 1} Bed</span>
                          <span>🚿 {prop.bathrooms ?? 1} Bath</span>
                          <span>👥 {prop.guests ?? 2} Guests</span>
                        </div>

                        {prop.description ? (
                          <p className="text-xs text-neutral-300 leading-snug line-clamp-2">
                            {prop.description}
                          </p>
                        ) : null}

                        {prop.amenities && prop.amenities.length > 0 && (
                          <div className="pt-1">
                            <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                              Included Amenities
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {prop.amenities.map((item, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-neutral-950 border border-neutral-800 text-amber-500 font-medium px-2 py-0.5 rounded-md"
                                >
                                  ✓ {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BOOK NOW PRIVACY BUTTON */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleOpenBookingModal(prop)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition"
                      >
                        ✨ Book Now / Reserve
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* GUEST PRIVACY BOOKING FORM MODAL */}
      {selectedPropertyForBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative my-8">
            
            <button
              onClick={handleCloseBookingModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 text-2xl rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">Booking Request Received!</h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
                  Your reservation request for <strong className="text-amber-500">{selectedPropertyForBooking.title}</strong> has been logged into host management.
                </p>
                <button
                  onClick={handleCloseBookingModal}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookNowSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Reserve Stay</span>
                  <h3 className="text-lg font-extrabold text-white">{selectedPropertyForBooking.title}</h3>
                  <p className="text-xs text-neutral-400">📍 {selectedPropertyForBooking.location} • ${selectedPropertyForBooking.price_per_night ?? selectedPropertyForBooking.price ?? 0} / night</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">Your Full Name</label>
                    <input
                      type="text" required placeholder="e.g. Alex Morgan"
                      value={guestName} onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">Email or Phone</label>
                    <input
                      type="text" required placeholder="Contact info"
                      value={guestContact} onChange={(e) => setGuestContact(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">Check-In Date</label>
                    <input
                      type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">Check-Out Date</label>
                    <input
                      type="date" required value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3 border border-neutral-800 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">Adult Occupants</label>
                    <select
                      value={adultsCount} onChange={(e) => setAdultsCount(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white text-xs outline-none focus:border-amber-500"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                      <option value="5+">5+ Adults</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">Children</label>
                    <select
                      value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white text-xs outline-none focus:border-amber-500"
                    >
                      <option value="0">0 Children</option>
                      <option value="1">1 Child</option>
                      <option value="2">2 Children</option>
                      <option value="3+">3+ Children</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">Message to Host (Optional)</label>
                  <textarea
                    rows={3} placeholder="Provide preferences or questions..."
                    value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit" disabled={submittingInquiry}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg"
                >
                  {submittingInquiry ? 'Submitting...' : 'Confirm & Submit Reservation Request'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}