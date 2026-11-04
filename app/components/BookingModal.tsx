'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookingModal({ property, onClose }: { property: any; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Step 1: Dates
  const [checkIn, setCheckIn] = useState('2026-11-12')
  const [checkOut, setCheckOut] = useState('2026-11-15')
  const [nights, setNights] = useState(3)

  // Step 2: Demographics
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(1)
  const [childAges, setChildAges] = useState('3 yrs')
  const [nationality, setNationality] = useState('Ugandan')
  const [purpose, setPurpose] = useState('Business') // 'Business' | 'Leisure' | 'Party'
  const [source, setSource] = useState('TikTok')
  const [notes, setNotes] = useState('Need early check-in & airport pickup')

  // Step 3: Payment Type
  const [paymentOption, setPaymentOption] = useState<'full' | 'split'>('full')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pricing Logic (NO CLEANING FEE)
  const nightlyPrice = property?.price || 45
  const staySubtotal = nights * nightlyPrice
  const securityDeposit = purpose === 'Party' ? 50 : 0 // Deposit applied ONLY if Party/Event
  const totalAmount = staySubtotal + securityDeposit
  
  const paymentDueNow = paymentOption === 'full' ? totalAmount : Math.round(totalAmount * 0.30)

  const handleCreateBooking = async () => {
    setIsSubmitting(true)

    // 1. Structure the demographic & notes payload
    const demographicInfo = `${adults} Adults, ${children} Child (${childAges}), ${nationality}`
    const combinedNotes = `Purpose: ${purpose} | Source: ${source} | Notes: ${notes}`

    // 2. Insert into Supabase Bookings Table
    const { data, error } = await supabase.from('bookings').insert([
      {
        property_title: property?.title || 'Uganda Short-Stay Property',
        guest_name: guestName,
        phone: phone,
        demographic: demographicInfo,
        guests: adults + children,
        check_in: checkIn,
        check_out: checkOut,
        notes: combinedNotes,
        total_price: totalAmount,
        paid_amount: paymentDueNow,
        status: 'PAID'
      }
    ]).select()

    if (!error) {
      // 3. Auto-Create Housekeeping & Prep Tasks for Host Operations Portal
      await supabase.from('tasks').insert([
        {
          title: `Clean Turnover - ${property?.title || 'Unit'}`,
          priority: 'High',
          status: 'Pending',
          assigned_to: 'Housekeeping',
          due_date: checkOut
        }
      ])

      // 4. Trigger Direct WhatsApp Confirmation Link
      const message = encodeURIComponent(
        `Confirmed ${guestName}!\n` +
        `Stay: ${property?.title || 'La Estancia Property'}\n` +
        `Details: ${demographicInfo}\n` +
        `Dates: ${checkIn} → ${checkOut}\n` +
        `Paid: $${paymentDueNow} (${paymentOption === 'full' ? '100% Paid' : '30% Deposit'})\n` +
        `Guest Code: ${Math.floor(1000 + Math.random() * 9000)} (Active 2pm on Check-in)`
      )
      
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
      onClose()
    } else {
      alert('Error creating booking. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-6 text-white shadow-2xl relative">
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <h3 className="font-black text-lg text-amber-400">
            {step === 1 && 'Step 1: Choose Stay Dates'}
            {step === 2 && 'Step 2: Guest Demographics'}
            {step === 3 && 'Step 3: Payment & Reservation'}
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white font-bold">✕</button>
        </div>

        {/* STEP 1: DATES & AVAILABILITY */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
              <span>Nightly Rate (All-Inclusive):</span>
              <span className="font-extrabold text-amber-400">${nightlyPrice} / night</span>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition cursor-pointer text-sm"
            >
              Check Availability & Continue →
            </button>
          </div>
        )}

        {/* STEP 2: DEMOGRAPHICS & GUEST DETAILS */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-400 font-bold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Davis Owembabazi"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-bold mb-1">WhatsApp Phone Number</label>
              <input
                type="text"
                placeholder="+256726797237"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Adults</label>
                <input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Children</label>
                <input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Child Ages</label>
                <input
                  type="text"
                  placeholder="3yrs"
                  value={childAges}
                  onChange={(e) => setChildAges(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Stay Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white"
                >
                  <option value="Business">Business / Work</option>
                  <option value="Leisure">Vacation / Leisure</option>
                  <option value="Party">Party / Event (Requires Deposit)</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 font-bold mb-1">How did you find us?</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-white"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Friend Referral">Friend Referral</option>
                  <option value="Google Search">Google Search</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-bold mb-1">Special Requests / Upsell Notes</label>
              <textarea
                placeholder="e.g. Need airport pickup, extra mattress, or early check-in"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-white h-16"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold rounded-xl"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & CONFIRMATION */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>{nights} Nights x ${nightlyPrice}</span>
                <span className="font-bold text-white">${staySubtotal}</span>
              </div>
              
              <div className="flex justify-between text-neutral-400">
                <span>Cleaning Fee:</span>
                <span className="font-bold text-emerald-400">$0 (Free / Included)</span>
              </div>

              {securityDeposit > 0 && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Party Security Deposit:</span>
                  <span>+${securityDeposit}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-neutral-800 pt-2 font-black text-sm text-white">
                <span>Total Amount:</span>
                <span className="text-amber-400">${totalAmount}</span>
              </div>
            </div>

            {/* PAYMENT CHOICE */}
            <div className="space-y-2">
              <label className="block text-neutral-400 font-bold">Select Payment Schedule:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentOption === 'full'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <p className="font-extrabold text-sm">Pay 100% Full</p>
                  <p className="text-[10px] mt-1">${totalAmount} now</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('split')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    paymentOption === 'split'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <p className="font-extrabold text-sm">Pay 30% Deposit</p>
                  <p className="text-[10px] mt-1">${paymentDueNow} now (Balance 24h prior)</p>
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateBooking}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer"
            >
              {isSubmitting ? 'Processing Payment...' : `Confirm & Pay $${paymentDueNow} (MoMo / Card)`}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}