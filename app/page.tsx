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

  // MODAL & MULTI-STEP CHECKOUT STATE
  const [selectedProp, setSelectedProp] = useState<any | null>(null)
  const [bookingStep, setBookingStep] = useState(1)

  // FORM INPUTS
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [adults, setAdults] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)
  const [childAges, setChildAges] = useState('')
  const [nationality, setNationality] = useState('')
  const [purpose, setPurpose] = useState('Leisure')
  const [source, setSource] = useState('TikTok')
  const [guestNotes, setGuestNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      if (data) setProperties(data)
    } catch (err) {
      console.error('Error fetching public properties:', err)
    } finally {
      setLoading(false)
    }
  }

  // PRICING CALCULATIONS
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
    return diff > 0 ? diff : 1
  }

  const nights = calculateNights()
  const baseRate = selectedProp ? (selectedProp.price || 50) : 50
  const cleaningFee = selectedProp?.cleaning_fee || 15
  const partyDeposit = purpose === 'Party' ? (selectedProp?.party_security_deposit || 50) : 0
  const grandTotal = (nights * baseRate) + cleaningFee + partyDeposit

  // AUTOMATED PAYMENT & WORKFLOW DISPATCH
  const handleFinalPaymentExecution = async (paymentOption: '100%' | '30% Deposit') => {
    setSubmitting(true)

    try {
      const doorCode = Math.floor(1000 + Math.random() * 9000).toString()
      const paidNow = paymentOption === '100%' ? grandTotal : Math.round(grandTotal * 0.30)

      // 1. Save Booking with Demographic Insights
      const { data: booking, error: bErr } = await supabase.from('bookings').insert([{
        property_id: selectedProp.id,
        host_id: selectedProp.host_id,
        guest_name: guestName,
        phone: guestPhone,
        adults: adults,
        children: childrenCount,
        child_ages: childAges,
        nationality: nationality,
        purpose: purpose,
        booking_source: source,
        guest_notes: guestNotes,
        check_in: checkIn,
        check_out: checkOut,
        total_price: grandTotal,
        paid_amount: paidNow,
        security_deposit_paid: partyDeposit,
        payment_type: paymentOption,
        door_code: doorCode,
        status: 'PAID'
      }]).select().single()

      if (bErr) throw bErr

      // 2. Auto-Generate Work Orders for Staff
      const tasksToInsert = [
        {
          property_id: selectedProp.id,
          booking_id: booking.id,
          title: `Cleaning & Turnover (${selectedProp.title})`,
          task_type: 'Cleaning',
          assignedTo: 'Aisha (Head Cleaner)',
          status: 'OPEN',
          due_date: checkOut
        }
      ]

      if (childrenCount > 0) {
        tasksToInsert.push({
          property_id: selectedProp.id,
          booking_id: booking.id,
          title: `Setup Extra Bedding / Crib (${childrenCount} Child)`,
          task_type: 'Extra Prep',
          assignedTo: 'Aisha (Head Cleaner)',
          status: 'OPEN',
          due_date: checkIn
        })
      }

      if (purpose === 'Party') {
        tasksToInsert.push({
          property_id: selectedProp.id,
          booking_id: booking.id,
          title: `Pre & Post Party Damage Inspection`,
          task_type: 'Security Check',
          assignedTo: 'Host Duty Manager',
          status: 'OPEN',
          due_date: checkOut
        })
      }

      await supabase.from('tasks').insert(tasksToInsert)

      // 3. Dispatch Automated Guest WhatsApp Confirmation
      const whatsappText = encodeURIComponent(
        `Confirmed ${guestName}!\n\n` +
        `🏡 Stay: ${selectedProp.title}\n` +
        `👥 Guests: ${adults} Adults, ${childrenCount} Children\n` +
        `📅 Dates: ${checkIn} to ${checkOut}\n` +
        `💰 Amount Paid: $${paidNow} (${paymentOption})\n` +
        `🔑 Door Access Code: ${doorCode} (Active 2:00 PM on ${checkIn})\n\n` +
        `Guest Guidebook Link: https://vacation-pms.vercel.app/guidebook`
      )

      window.open(`https://api.whatsapp.com/send?phone=${guestPhone.replace(/[^0-9]/g, '')}&text=${whatsappText}`, '_blank')

      // Reset Modal
      setSelectedProp(null)
      setBookingStep(1)
      alert('🎉 Reservation Confirmed! Direct WhatsApp instructions have been sent.')

    } catch (err: any) {
      alert('Error finalizing reservation: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            La Estancia Vacation Homes
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Book Short-Stay Vacation Homes
          </h1>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto">
            Explore curated apartments, villas, and stand-alone houses available for daily booking.
          </p>
        </section>

        {/* PROPERTY CATALOG */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              <span className="text-amber-400">🏡</span> Featured Properties ({properties.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-500 animate-pulse text-center py-12">Loading properties...</p>
          ) : properties.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
              No properties listed right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p) => {
                const gallery = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : [])

                return (
                  <div 
                    key={p.id} 
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden shadow-2xl transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden">
                        {gallery.length > 0 ? (
                          <img 
                            src={gallery[0]} 
                            alt={p.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">
                            No Photo Available
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {p.category || 'Apartment'}
                          </span>
                        </div>

                        {gallery.length > 1 && (
                          <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-neutral-700">
                            📷 {gallery.length} Photos
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className="font-black text-white text-base leading-tight truncate">{p.title}</h3>
                          <div className="text-right shrink-0">
                            <span className="text-amber-400 font-black text-base">${p.price || 50}</span>
                            <span className="text-[10px] text-neutral-400 font-medium"> /night</span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          <span>📍</span> {p.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => { setSelectedProp(p); setBookingStep(1); }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition duration-200 cursor-pointer active:scale-[0.98]"
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

        {/* HOST MARKETING & UPSELL SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6 border-t border-neutral-900 mt-6">
          <div className="text-center pb-3">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Hospitality & Property Owner Services
            </span>
          </div>
          <UpsellMotionSlider />
        </section>
      </div>

      {/* 3-STEP AUTOMATED GUEST CHECKOUT MODAL */}
      {selectedProp && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Step {bookingStep} of 3</span>
                <h3 className="text-lg font-black text-white">{selectedProp.title}</h3>
              </div>
              <button 
                onClick={() => { setSelectedProp(null); setBookingStep(1); }} 
                className="text-neutral-400 hover:text-white font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: DATES */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-300">1. Select Reservation Dates</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Check-In</label>
                    <input 
                      type="date" 
                      value={checkIn} 
                      onChange={(e) => setCheckIn(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Check-Out</label>
                    <input 
                      type="date" 
                      value={checkOut} 
                      onChange={(e) => setCheckOut(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setBookingStep(2)}
                  disabled={!checkIn || !checkOut}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  Continue to Guest Details →
                </button>
              </div>
            )}

            {/* STEP 2: DEMOGRAPHICS */}
            {bookingStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setBookingStep(3); }} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-neutral-300">2. Guest Demographics & Purpose</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" required placeholder="Full Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl" />
                  <input type="tel" required placeholder="WhatsApp Number (+256...)" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Adults</label>
                    <input type="number" min="1" value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Children</label>
                    <input type="number" min="0" value={childrenCount} onChange={(e) => setChildrenCount(parseInt(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Child Ages</label>
                    <input type="text" placeholder="e.g. 3, 7" value={childAges} onChange={(e) => setChildAges(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Nationality</label>
                    <input type="text" placeholder="e.g. Ugandan / Expat" value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Purpose of Stay</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold">
                      <option value="Leisure">Leisure / Vacation</option>
                      <option value="Business">Business Trip</option>
                      <option value="Party">Party / Event (Security Deposit Applies)</option>
                      <option value="Relocation">Relocation Stay</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">How did you find us?</label>
                    <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold">
                      <option value="TikTok">TikTok</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Direct Referral">Direct Referral</option>
                      <option value="Google Search">Google Search</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Special Note</label>
                    <input type="text" placeholder="e.g. Early check-in requested" value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setBookingStep(1)} className="w-1/3 py-3 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl">← Back</button>
                  <button type="submit" className="w-2/3 py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow">Proceed to Payment →</button>
                </div>
              </form>
            )}

            {/* STEP 3: PAYMENT */}
            {bookingStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-300">3. Price Summary & Instant Payment</h4>
                
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Nights Stay ({nights} night(s) @ ${baseRate})</span>
                    <span>${nights * baseRate}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Cleaning Fee</span>
                    <span>${cleaningFee}</span>
                  </div>
                  {purpose === 'Party' && (
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>Party Security Deposit</span>
                      <span>+${partyDeposit}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-800 pt-2 flex justify-between font-black text-sm text-white">
                    <span>Grand Total</span>
                    <span className="text-amber-400">${grandTotal}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFinalPaymentExecution('100%')}
                    disabled={submitting}
                    className="p-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-xl shadow cursor-pointer text-center"
                  >
                    {submitting ? 'Processing...' : `Pay 100% ($${grandTotal})`}
                  </button>
                  <button
                    onClick={() => handleFinalPaymentExecution('30% Deposit')}
                    disabled={submitting}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 border border-amber-500/40 text-amber-400 text-xs font-extrabold rounded-xl shadow cursor-pointer text-center"
                  >
                    {submitting ? 'Processing...' : `Pay 30% ($${Math.round(grandTotal * 0.30)})`}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}