'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function PublicPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Booking Modal State
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  // Amenities Toggle State (Tracks which property has its amenities expanded)
  const [expandedAmenities, setExpandedAmenities] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchPublicProperties()
  }, [])

  const fetchPublicProperties = async () => {
    const { data } = await supabase.from('properties').select('*')
    
    if (data && data.length > 0) {
      const processed = data.map((item: any) => {
        let imgs: string[] = []
        if (Array.isArray(item.images)) {
          imgs = item.images
        } else if (typeof item.images === 'string' && item.images.trim().startsWith('[')) {
          try { imgs = JSON.parse(item.images) } catch (e) { imgs = [item.images] }
        } else if (typeof item.images === 'string' && item.images.trim().length > 0) {
          imgs = [item.images]
        }
        return { ...item, parsedImages: imgs }
      })
      setProperties(processed)
    } else {
      setProperties([])
    }
    setLoading(false)
  }

  const toggleAmenitiesModal = (id: string) => {
    setExpandedAmenities(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProperty) return

    const newBooking = {
      id: Date.now().toString(),
      property_name: selectedProperty.title,
      guest_name: guestName,
      email: guestEmail,
      check_in: checkInDate,
      check_out: checkOutDate,
      total_price: selectedProperty.price_per_night,
      status: 'Pending Review'
    }

    await supabase.from('bookings').insert([newBooking])
    setBookingSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-amber-500 font-extrabold text-xs tracking-widest uppercase">LA ESTANCIA VACATION HOMES</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Exclusive Short-Stay Stays in Uganda</h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Browse fully furnished apartments, standalone houses, mansions, and villas with secure private booking.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-neutral-500 font-bold text-sm">
              Loading available properties...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const imgList: string[] = p.parsedImages || []
                const isAmenitiesOpen = expandedAmenities[p.id] || false

                return (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition">
                    
                    {/* COVER IMAGE */}
                    <div className="relative w-full h-56 bg-neutral-950 flex items-center justify-center overflow-hidden">
                      {imgList.length > 0 ? (
                        <img src={imgList[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-3xl">🏠</span>
                          <p className="text-[10px] text-neutral-500 mt-1">La Estancia Managed Property</p>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow">
                        ${p.price_per_night} / night
                      </div>

                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${p.is_occupied ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                          {p.is_occupied ? 'Occupied' : 'Available Now'}
                        </span>
                      </div>
                    </div>

                    {/* CARD DETAILS */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">📍 {p.location || 'Kampala'}</span>
                        <h3 className="font-extrabold text-white text-sm line-clamp-2">{p.title}</h3>
                        
                        {p.description && (
                          <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                            {p.description}
                          </p>
                        )}
                      </div>

                      {/* AMENITIES TOGGLE BUTTON (CLEAN & MINIMALIST) */}
                      {p.amenities && p.amenities.length > 0 && (
                        <div className="pt-2">
                          <button 
                            onClick={() => toggleAmenitiesModal(p.id)}
                            className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl w-full justify-between"
                          >
                            <span>✨ Property Amenities ({p.amenities.length})</span>
                            <span>{isAmenitiesOpen ? '▲ Hide' : '▼ View'}</span>
                          </button>

                          {/* EXPANDABLE AMENITIES LIST */}
                          {isAmenitiesOpen && (
                            <div className="flex flex-wrap gap-1 mt-2 p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl max-h-32 overflow-y-auto">
                              {p.amenities.map((amenity: string, idx: number) => (
                                <span key={idx} className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md font-medium">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* PHOTO THUMBNAILS */}
                      {imgList.length > 1 && (
                        <div className="flex gap-1.5 overflow-x-auto pt-1">
                          {imgList.slice(0, 5).map((imgUrl: string, idx: number) => (
                            <img key={idx} src={imgUrl} className="w-10 h-10 object-cover rounded-lg border border-neutral-800" alt="Thumbnail" />
                          ))}
                        </div>
                      )}

                      {/* SECURE INQUIRY BUTTON (ZERO EXTERNAL WHATSAPP LINKS) */}
                      <div className="pt-3 border-t border-neutral-800">
                        <button
                          onClick={() => {
                            setSelectedProperty(p)
                            setBookingSubmitted(false)
                          }}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          🔒 Check Availability & Reserve Securely
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECURE BOOKING MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-extrabold text-amber-500 text-sm">Secure Reservation Request</h3>
                <p className="text-[10px] text-neutral-400">{selectedProperty.title}</p>
              </div>
              <button onClick={() => setSelectedProperty(null)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            {bookingSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-3xl">✅</span>
                <h4 className="font-bold text-white text-sm">Inquiry Received Securely</h4>
                <p className="text-xs text-neutral-400">Your reservation details have been logged privately into the host dashboard. We will review and contact you shortly.</p>
                <button onClick={() => setSelectedProperty(null)} className="mt-4 px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl cursor-pointer">Close</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Your Full Name</label>
                  <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Email Address</label>
                  <input type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Check-in Date</label>
                    <input type="date" required value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Check-out Date</label>
                    <input type="date" required value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 italic">Encrypted and transmitted privately to the host PMS dashboard. No external links or numbers are exposed.</p>
                <div className="pt-2 flex gap-2">
                  <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">
                    Submit Reservation Request
                  </button>
                  <button type="button" onClick={() => setSelectedProperty(null)} className="py-2.5 px-4 bg-neutral-800 text-neutral-300 font-extrabold text-xs rounded-xl cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}