'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
import UpsellMotionSlider from './components/UpsellMotionSlider'
import { supabase } from '@/lib/supabase'

export default function GuestHomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // GUEST BOOKING MODAL STATES
  const [selectedProp, setSelectedProp] = useState<any | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [demographic, setDemographic] = useState('Solo Traveler')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPublicProperties()
  }, [])

  const fetchPublicProperties = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      if (data) setProperties(data)
    } catch (err) {
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName || !guestPhone || !checkIn || !checkOut || !selectedProp) {
      alert('Please fill in all booking details.')
      return
    }

    setSubmitting(true)

    try {
      const totalPrice = selectedProp.price || 50
      const depositAmount = Math.round(totalPrice * 0.30)

      const newBooking = {
        property_id: selectedProp.id,
        host_id: selectedProp.host_id,
        guest_name: guestName,
        phone: guestPhone,
        demographic: demographic,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
        paid_amount: depositAmount,
        status: 'Pending'
      }

      const { error } = await supabase.from('bookings').insert([newBooking])
      if (error) throw error

      alert(`🎉 Reservation Request Sent! The host will contact you on WhatsApp (${guestPhone}) to confirm.`)
      setSelectedProp(null)
      setGuestName('')
      setGuestPhone('')
      setCheckIn('')
      setCheckOut('')
    } catch (err: any) {
      alert('Error submitting reservation: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO SECTION FOR GUESTS & PROPERTY OWNERS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 text-center space-y-4">
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
            La Estancia Vacation Homes
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Find & Book Your Next Stay
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Browse luxury vacation rentals, furnished apartments, and mansions. Or manage your own hospitality business with our operational PMS.
          </p>
        </section>

        {/* HOST MARKETING & UPSELL AD SLIDER (PUBLIC CONSUMERS) */}
        <UpsellMotionSlider />

        {/* PROPERTY CATALOG */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <div className="border-b border-neutral-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Available Stays</h2>
              <p className="text-xs text-neutral-400">Explore rates and amenities available for instant booking request.</p>
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-500 animate-pulse text-center py-10">Loading available properties...</p>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 text-xs font-bold">
              No properties currently listed for booking.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const gallery = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : [])

                return (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-neutral-700 transition flex flex-col justify-between">
                    <div>
                      {gallery.length > 0 && (
                        <img 
                          src={gallery[0]} 
                          alt={p.title} 
                          className="w-full h-48 object-cover border-b border-neutral-800"
                        />
                      )}

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            {p.category || 'Apartment'}
                          </span>
                          <span className="text-xs font-black text-amber-400">
                            ${p.price || 50} / night
                          </span>
                        </div>

                        <h3 className="font-black text-white text-lg">{p.title}</h3>
                        <p className="text-xs text-neutral-400">📍 {p.location}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedProp(p)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* GUEST BOOKING MODAL */}
      {selectedProp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Reserve Your Stay</h3>
                <p className="text-xs text-amber-400 font-bold">{selectedProp.title}</p>
              </div>
              <button
                onClick={() => setSelectedProp(null)}
                className="text-neutral-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +256700000000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Demographic / Stay Type</label>
                <select
                  value={demographic}
                  onChange={(e) => setDemographic(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Solo Traveler">Solo Traveler</option>
                  <option value="Couple Stay">Couple Stay</option>
                  <option value="Family Vacation">Family Vacation</option>
                  <option value="Business Trip">Business Trip</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Check-In</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProp(null)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-xl shadow cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}