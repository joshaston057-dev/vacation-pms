'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number | string
  propertyTitle: string
  nightlyPrice: number
}

export default function BookingModal({ isOpen, onClose, propertyId, propertyTitle, nightlyPrice }: BookingModalProps) {
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [demographic, setDemographic] = useState('Solo Traveler')
  const [guestsCount, setGuestsCount] = useState(1)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('deposit')
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  if (!isOpen) return null

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return nightlyPrice
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)))
    return nights * nightlyPrice
  }

  const totalPrice = calculateTotalPrice()
  const depositAmount = Math.round(totalPrice * 0.3)
  const amountToPayNow = paymentOption === 'full' ? totalPrice : depositAmount

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Fetch the host_id belonging to the target property
      const { data: propertyData } = await supabase
        .from('properties')
        .select('host_id')
        .eq('id', propertyId)
        .maybeSingle()

      const assignedHostId = propertyData?.host_id || null

      // 2. Insert booking record WITH host_id attached
      const { error } = await supabase.from('bookings').insert([
        {
          property_title: propertyTitle,
          guest_name: guestName,
          phone: phone,
          demographic: demographic,
          guests: guestsCount,
          check_in: checkIn,
          check_out: checkOut,
          notes: notes,
          total_price: totalPrice,
          paid_amount: amountToPayNow,
          status: 'Pending',
          host_id: assignedHostId // 👈 ATTACHES BOOKING TO SPECIFIC HOST
        }
      ])

      if (error) throw error

      setBookingSuccess(true)
    } catch (err: any) {
      alert('Failed to submit booking: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-5">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 className="font-extrabold text-white text-lg">Reserve {propertyTitle}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
        </div>

        {bookingSuccess ? (
          <div className="py-8 text-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h4 className="text-xl font-bold text-white">Booking Request Received!</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Your reservation request for <strong className="text-white">{propertyTitle}</strong> has been sent. The host will approve your payment and send your 4-digit keyless access code via WhatsApp!
            </p>
            <button
              onClick={() => { setBookingSuccess(false); onClose() }}
              className="px-6 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Brian Smith"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+256 700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Demographic Group</label>
                <select
                  value={demographic}
                  onChange={(e) => setDemographic(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="Solo Traveler">Solo Traveler</option>
                  <option value="Couple">Couple</option>
                  <option value="Couple with Kids">Couple with Kids</option>
                  <option value="Business Group">Business Group</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Check-In Date</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">Check-Out Date</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1">Select Payment Option</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('deposit')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentOption === 'deposit' ? 'bg-amber-500/15 border-amber-500 text-amber-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="block text-xs font-extrabold">30% Deposit</span>
                  <span className="block text-sm font-black text-white mt-1">${depositAmount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentOption === 'full' ? 'bg-amber-500/15 border-amber-500 text-amber-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="block text-xs font-extrabold">100% Full Payment</span>
                  <span className="block text-sm font-black text-white mt-1">${totalPrice}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1">Special Notes / Requests</label>
              <textarea
                rows={2}
                placeholder="e.g. Arriving late evening, need quiet room..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs py-3.5 rounded-xl shadow-lg transition cursor-pointer"
            >
              {loading ? 'Submitting Reservation...' : `Confirm & Request Stay ($${amountToPayNow} Due)`}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}