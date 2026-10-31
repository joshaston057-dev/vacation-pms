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

interface UpsellService {
  id: string
  title: string
  category: string
  price_usd: number
  description: string
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [services, setServices] = useState<UpsellService[]>([])
  const [loading, setLoading] = useState(true)

  // Booking Modal & Motion Gallery States
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false)

  // Guest Form States
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
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: propsData } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        const { data: servsData } = await supabase
          .from('upsell_services')
          .select('*')
          .order('created_at', { ascending: false })

        setProperties(propsData || [])
        setServices(servsData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleOpenBookingModal = (property: Property) => {
    setSelectedPropertyForBooking(property)
    setActivePhotoIndex(0)
    setShowAmenitiesDropdown(false)
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
          total_amount: totalAmount,
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

        {/* HERO SECTION */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-12 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-3">
            <span className="text-amber-500 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              La Estancia Vacation Homes
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Exclusive Short-Stay Properties in Uganda
            </h1>
            <p className="text-neutral-400 text-xs sm:text-base max-w-xl mx-auto">
              Apartments, standalone houses, mansions, and villas with premium guest concierge services.
            </p>
          </div>
        </section>

        {/* MOVING / SLIDING UPSELL SERVICES TICKER */}
        {services.length > 0 && (
          <div className="bg-amber-500/10 border-y border-amber-500/20 py-2.5 overflow-hidden whitespace-nowrap">
            <div className="inline-flex space-x-8 animate-marquee text-xs font-semibold text-amber-400">
              {services.map((serv) => (
                <span key={serv.id} className="flex items-center gap-2">
                  ✨ <strong className="text-white">{serv.title}</strong> (${serv.price_usd}) — {serv.description}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STREAMLINED PROPERTY GRID */}
        <section className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Featured Properties</h2>
            <a href="/stays" className="text-xs text-amber-500 hover:underline font-semibold">Browse All Stays →</a>
          </div>

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

                return (
                  <div
                    key={prop.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      {/* Main Image Preview */}
                      <div className="relative h-56 bg-neutral-950 overflow-hidden group cursor-pointer" onClick={() => handleOpenBookingModal(prop)}>
                        <img
                          src={images[0]}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                          ${prop.price_per_night ?? prop.price ?? 0} / night
                        </span>
                        {images.length > 1 && (
                          <span className="absolute bottom-3 left-3 bg-black/70 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                            📷 {images.length} Photos
                          </span>
                        )}
                      </div>

                      {/* Property Info (No bulky amenities here anymore to save space) */}
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
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleOpenBookingModal(prop)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition"
                      >
                        ✨ View Gallery & Book Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* IMMERSIVE BOOKING & MOTION GALLERY MODAL */}
      {selectedPropertyForBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8">
            <button
              onClick={handleCloseBookingModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg font-bold z-10 bg-neutral-950 p-2 rounded-full border border-neutral-800"
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
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Property Showcase & Reservation</span>
                  <h3 className="text-xl font-extrabold text-white">{selectedPropertyForBooking.title}</h3>
                  <p className="text-xs text-neutral-400">📍 {selectedPropertyForBooking.location} • <strong className="text-amber-400">${selectedPropertyForBooking.price_per_night ?? selectedPropertyForBooking.price ?? 0} / night</strong></p>
                </div>

                {/* MOTION PHOTO GALLERY SLIDESHOW */}
                <div className="space-y-2">
                  {(() => {
                    const images = selectedPropertyForBooking.image_urls && selectedPropertyForBooking.image_urls.length > 0 
                      ? selectedPropertyForBooking.image_urls 
                      : [selectedPropertyForBooking.image_url || '/placeholder.jpg']

                    return (
                      <div>
                        <div className="relative h-72 bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-inner">
                          <img
                            src={images[activePhotoIndex] || images[0]}
                            alt="Property Slide"
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                          {images.length > 1 && (
                            <div className="absolute inset-x-0 bottom-3 flex justify-between px-4">
                              <button
                                onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                className="bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-700 backdrop-blur-sm transition"
                              >
                                ← Prev
                              </button>
                              <span className="bg-black/70 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-700 backdrop-blur-sm">
                                {activePhotoIndex + 1} / {images.length}
                              </span>
                              <button
                                onClick={() => setActivePhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                className="bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-700 backdrop-blur-sm transition"
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Thumbnail Selector */}
                        {images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pt-2">
                            {images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActivePhotoIndex(idx)}
                                className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                                  activePhotoIndex === idx ? 'border-amber-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* UNFOLDING AMENITIES SECTION */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
                    className="w-full flex justify-between items-center text-xs font-bold text-amber-400"
                  >
                    <span>✨ Included Amenities & Features ({selectedPropertyForBooking.amenities?.length || 0})</span>
                    <span>{showAmenitiesDropdown ? '▲ Hide' : '▼ Unfold Amenities'}</span>
                  </button>

                  {showAmenitiesDropdown && (
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-neutral-800">
                      {selectedPropertyForBooking.amenities && selectedPropertyForBooking.amenities.length > 0 ? (
                        selectedPropertyForBooking.amenities.map((item, i) => (
                          <span key={i} className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                            <span className="text-amber-500">✓</span> {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-neutral-500 italic">Standard luxury amenities included.</span>
                      )}
                    </div>
                  )}
                </div>

                {/* BOOKING FORM */}
                <form onSubmit={handleBookNowSubmit} className="space-y-4 pt-2 border-t border-neutral-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Submit Reservation Dates</h4>

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
                      <label className="block text-[11px] font-medium text-neutral-300 mb-1">Email or WhatsApp Phone</label>
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
                        type="date" required min={checkInDate} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
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
                        <option value="1">1 Adult</option><option value="2">2 Adults</option><option value="3">3 Adults</option><option value="4">4+ Adults</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">Children</label>
                      <select
                        value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white text-xs outline-none focus:border-amber-500"
                      >
                        <option value="0">0 Children</option><option value="1">1 Child</option><option value="2">2+ Children</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">Message to Host (Optional)</label>
                    <textarea
                      rows={2} placeholder="Ask about check-in time or special preferences..."
                      value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit" disabled={submittingInquiry}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg"
                  >
                    {submittingInquiry ? 'Submitting Reservation...' : 'Confirm & Submit Reservation Request'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}