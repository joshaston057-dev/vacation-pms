'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function BrowseStaysPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<any>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Booking form state
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [adultCount, setAdultCount] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)
  const [guestMessage, setGuestMessage] = useState('')
  const [submittingInquiry, setSubmittingInquiry] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase.from('properties').select('*')
      if (error) throw error
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPropertyForBooking) return

    setSubmittingInquiry(true)

    let totalAmount = selectedPropertyForBooking.price_per_night || 0
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        totalAmount = diffDays * (selectedPropertyForBooking.price_per_night || 0)
      }
    }

    const occupantsText = `${adultCount} Adult(s), ${childrenCount} child(ren)`
    const compiledNotes = `Occupants: ${occupantsText}. Note: ${guestMessage || 'None'}`

    try {
      const { error } = await supabase.from('bookings').insert([
        {
          property_id: selectedPropertyForBooking.id,
          property_title: selectedPropertyForBooking.title,
          host_id: selectedPropertyForBooking.host_id || null,
          guest_name: guestName,
          phone: guestContact,
          guest_phone: guestContact,
          check_in: checkInDate,
          check_out: checkOutDate,
          total_price: totalAmount,
          total_amount: totalAmount,
          status: 'PENDING',
          guest_notes: compiledNotes,
          notes: compiledNotes,
        }
      ])

      if (error) {
        console.error('Supabase booking error:', error.message)
        alert('Booking error: ' + error.message)
      } else {
        setBookingSuccess(true)
      }
    } catch (err: any) {
      console.error('Unexpected booking error:', err)
      alert('Error: ' + (err.message || 'Unable to submit booking inquiry.'))
    } finally {
      setSubmittingInquiry(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
    {/* Top Utility & Host Navigation Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-3 flex justify-between items-center text-sm">
        <span className="font-semibold tracking-wider text-emerald-400">LA ESTANCIA</span>
        <a 
          href="/operations" 
          className="text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-md transition text-xs font-medium border border-neutral-700"
        >
          Host Sign In 🔑
        </a>
      </div>

      {/* Dynamic Upsells Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border-b border-emerald-900/40 py-3 px-4 text-center text-xs sm:text-sm text-emerald-300 font-medium animate-pulse">
        ✨ Special Offer: Book your stay today and add an airport pickup or private chef service at checkout! 🚗💨
      </div>
    <div className="bg-neutral-900 border-b border-neutral-800 py-6 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">La Estancia Vacation Homes</h1>
        <p className="text-neutral-400 mt-2">Explore our exclusive portfolio of stays and book your experience.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 w-full flex-grow">
        {loading ? (
          <div className="text-center text-neutral-400 py-20">Loading available stays...</div>
        ) : properties.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">No properties currently listed.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between">
                <div>
                  {property.image_url ? (
                    <img src={property.image_url} alt={property.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-neutral-800 flex items-center justify-center text-neutral-500">No Image</div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold">{property.title}</h2>
                    <p className="text-neutral-400 text-sm mt-1">{property.location}</p>
                    <p className="text-emerald-400 font-bold mt-4">${property.price_per_night} <span className="text-xs text-neutral-400 font-normal">/ night</span></p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setSelectedPropertyForBooking(property)
                      setBookingSuccess(false)
                      setShowBookingModal(true)
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBookingModal && selectedPropertyForBooking && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="text-emerald-400 text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold">Inquiry Sent Successfully!</h3>
                <p className="text-neutral-400 mt-2">Your booking inquiry has been received. Our team will review and contact you shortly.</p>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="mt-6 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookNowSubmit}>
                <h3 className="text-xl font-bold mb-1">Book: {selectedPropertyForBooking.title}</h3>
                <p className="text-sm text-neutral-400 mb-6">Fill in your stay details below.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Phone / WhatsApp Contact</label>
                    <input
                      type="text"
                      required
                      value={guestContact}
                      onChange={(e) => setGuestContact(e.target.value)}
                      placeholder="+256..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Adults</label>
                      <input
                        type="number"
                        min="1"
                        value={adultCount}
                        onChange={(e) => setAdultCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Children</label>
                      <input
                        type="number"
                        min="0"
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Special Requests / Notes</label>
                    <textarea
                      rows={3}
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      placeholder="Any special requests or details..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {submittingInquiry ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}