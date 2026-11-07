'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'upsells' | 'ledger'>('bookings')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Manual Booking Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [manualBooking, setManualBooking] = useState({
    property_id: '',
    guest_name: '',
    phone: '',
    purpose: 'Direct Walk-in',
    check_in: '',
    check_out: '',
    total_price: '',
    guest_notes: ''
  })

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch host-scoped records with fallback for legacy entries + global upsell catalog
      const [propsRes, bookRes, taskRes, upsellRes] = await Promise.all([
        supabase.from('properties').select('*').or(user ? `host_id.eq.${user.id},host_id.is.null` : 'host_id.is.null').order('id', { ascending: false }),
        supabase.from('bookings').select('*').or(user ? `host_id.eq.${user.id},host_id.is.null` : 'host_id.is.null').order('id', { ascending: false }),
        supabase.from('tasks').select('*').or(user ? `host_id.eq.${user.id},host_id.is.null` : 'host_id.is.null').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').order('id', { ascending: true })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
    } catch (err) {
      console.error('Error fetching operations data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Manual Reservation & Automated Actions
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const selectedProp = properties.find((p) => String(p.id) === String(manualBooking.property_id))

      // 1. Create Confirmed Booking (Locks iCal Export Feed)
      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert([
          {
            host_id: user?.id || null,
            property_id: manualBooking.property_id,
            property_title: selectedProp?.title || 'Direct Host Booking',
            guest_name: manualBooking.guest_name,
            phone: manualBooking.phone,
            purpose: manualBooking.purpose,
            check_in: manualBooking.check_in,
            check_out: manualBooking.check_out,
            total_price: parseFloat(manualBooking.total_price) || 0,
            guest_notes: manualBooking.guest_notes || 'Manual direct booking',
            status: 'CONFIRMED'
          }
        ])

      if (bookingErr) throw bookingErr

      // 2. Mark Property Status as OCCUPIED
      await supabase
        .from('properties')
        .update({ status: 'OCCUPIED' })
        .eq('id', manualBooking.property_id)

      // 3. Automated Housekeeping Tasks Creation
      await supabase.from('tasks').insert([
        {
          host_id: user?.id || null,
          title: `Pre-Arrival Prep: ${selectedProp?.title || 'Property'}`,
          description: `Prepare listing for guest ${manualBooking.guest_name}. Check-in: ${manualBooking.check_in}`,
          status: 'PENDING'
        },
        {
          host_id: user?.id || null,
          title: `Turnover Checkout: ${selectedProp?.title || 'Property'}`,
          description: `Housekeeping required after departure on ${manualBooking.check_out}`,
          status: 'PENDING'
        }
      ])

      alert('✅ Booking confirmed! Property tagged OCCUPIED, calendar locked, and housekeeping scheduled.')
      setShowAddModal(false)
      setManualBooking({
        property_id: '',
        guest_name: '',
        phone: '',
        purpose: 'Direct Walk-in',
        check_in: '',
        check_out: '',
        total_price: '',
        guest_notes: ''
      })
      fetchHostData()
    } catch (err: any) {
      alert('Error creating booking: ' + err.message)
    }
  }

  const openBookingModalForProperty = (propertyId: string | number) => {
    setManualBooking({
      property_id: String(propertyId),
      guest_name: '',
      phone: '',
      purpose: 'Direct Walk-in',
      check_in: '',
      check_out: '',
      total_price: '',
      guest_notes: ''
    })
    setShowAddModal(true)
  }

  const handleApproveBooking = async (booking: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED' })
        .eq('id', booking.id)

      if (error) throw error

      if (booking.property_id) {
        await supabase
          .from('properties')
          .update({ status: 'OCCUPIED' })
          .eq('id', booking.property_id)
      }

      fetchHostData()
      alert('✅ Booking approved, property tagged Occupied, and OTA calendars synced!')
    } catch (err: any) {
      alert('Error approving booking: ' + err.message)
    }
  }

  const handleDeleteBooking = async (bookingId: string | number) => {
    if (!confirm('Are you sure you want to delete this booking record?')) return
    try {
      await supabase.from('bookings').delete().eq('id', bookingId)
      fetchHostData()
    } catch (err: any) {
      alert('Error deleting booking: ' + err.message)
    }
  }

  const cleanGuestName = (rawName: string) => {
    if (!rawName) return 'Valued Guest'
    if (rawName.includes('|')) {
      const parts = rawName.split('|')
      for (let part of parts) {
        if (part.includes('Guest:')) return part.replace('Guest:', '').trim()
      }
      return parts[0].replace(/Prop:/i, '').replace(/\[/g, '').replace(/\]/g, '').trim()
    }
    return rawName.trim()
  }

  const cleanPhone = (b: any) => {
    if (b.phone && b.phone.trim()) return b.phone.trim()
    if (b.guest_name && b.guest_name.includes('Ph:')) {
      const match = b.guest_name.match(/Ph:\s*([^\s|]+)/)
      if (match && match[1]) return match[1]
    }
    return '+256757386946'
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* TAB NAVIGATION */}
          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              📅 Bookings & Inquiries ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🏠 Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🧹 Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('upsells')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'upsells' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              ✨ Upsells ({upsells.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              💰 Ledger
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">
              Loading operations hub...
            </div>
          ) : (
            <>
              {/* TAB 1: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white">Guest Reservations & Inquiries</h3>
                      <span className="text-xs text-neutral-400 font-bold">{bookings.length} Total</span>
                    </div>

                    <button
                      onClick={() => {
                        setManualBooking({ property_id: '', guest_name: '', phone: '', purpose: 'Direct Walk-in', check_in: '', check_out: '', total_price: '', guest_notes: '' })
                        setShowAddModal(true)
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-2"
                    >
                      <span>➕</span> Manual Booking & Calendar Lock
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
                      No active bookings found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {bookings.map((b) => {
                        const totalStay = b.total_price || 150
                        const depositDue = Math.round(totalStay * 0.3)
                        const isConfirmed = b.status === 'CONFIRMED'
                        const guestName = cleanGuestName(b.guest_name)
                        const phoneNum = cleanPhone(b)
                        const checkInDate = b.check_in || b.checkIn || 'N/A'
                        const checkOutDate = b.check_out || b.checkOut || 'N/A'
                        const specialNotes = b.guest_notes || b.notes || 'No special requests'

                        const paymentWhatsAppText = encodeURIComponent(
                          `Hello ${guestName}! 👋 Thank you for your inquiry for *${b.property_title || 'La Estancia Vacation Home'}*.\n\n` +
                          `📅 *Stay Dates:* ${checkInDate} → ${checkOutDate}\n` +
                          `💰 *Total Stay:* $${totalStay}\n` +
                          `🔐 *30% Deposit Required:* $${depositDue}\n\n` +
                          `Please complete your deposit payment via Mobile Money or Card. Reply with your payment code once sent!`
                        )

                        return (
                          <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-3">
                                <h4 className="font-black text-white text-sm leading-snug">{b.property_title || 'Vacation Stay'}</h4>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
                                  isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {b.status || 'PENDING'}
                                </span>
                              </div>

                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs">
                                <div className="flex items-center gap-2.5 text-neutral-300">
                                  <span className="text-neutral-400">👤 Guest:</span>
                                  <span className="font-extrabold text-white">{guestName}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-neutral-300">
                                  <span className="text-neutral-400">💬 WhatsApp:</span>
                                  <span className="font-extrabold text-emerald-400">{phoneNum}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-neutral-300">
                                  <span className="text-neutral-400">📅 Dates:</span>
                                  <span className="font-extrabold text-white">{checkInDate} → {checkOutDate}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">Total Stay:</span>
                                    <span className="text-amber-400 font-black text-sm">${totalStay}</span>
                                  </div>
                                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">30% Deposit:</span>
                                    <span className="text-emerald-400 font-black text-sm">${depositDue}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-0.5">Guest Notes:</span>
                                <p className="text-xs text-neutral-300">{specialNotes}</p>
                              </div>
                            </div>

                            <div className="space-y-2 pt-1">
                              {!isConfirmed && (
                                <button
                                  onClick={() => handleApproveBooking(b)}
                                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition text-center"
                                >
                                  ⚡ Approve Cash/MoMo & Sync iCal
                                </button>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${phoneNum.replace(/[^0-9]/g, '')}&text=${paymentWhatsAppText}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                                >
                                  💬 WhatsApp
                                </a>
                                <button
                                  onClick={() => handleDeleteBooking(b.id)}
                                  className="py-3 bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-400 font-black text-xs rounded-xl shadow transition cursor-pointer text-center"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROPERTIES */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Managed Listings & Direct Booking</h3>
                    <span className="text-xs text-neutral-400 font-bold">{properties.length} Listings</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {properties.map((p) => {
                      const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
                      const isOccupied = p.status === 'OCCUPIED'

                      return (
                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                          <div className="relative aspect-[16/10] bg-neutral-950">
                            {gallery.length > 0 ? (
                              <img src={gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                                {p.category || 'Apartment'}
                              </span>
                              {isOccupied && (
                                <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase shadow-lg">
                                  🔴 OCCUPIED
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-black text-white text-base truncate">{p.title}</h4>
                              <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                            </div>
                            <p className="text-xs text-neutral-400">📍 {p.location}</p>

                            <button
                              onClick={() => openBookingModalForProperty(p.id)}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition shadow cursor-pointer text-center"
                            >
                              ⚡ Book Property & Lock Calendars
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Housekeeping & Operations Tasks</h3>
                  {tasks.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
                      No housekeeping tasks pending.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map((t) => (
                        <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-white text-sm">{t.title}</h4>
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                              {t.status || 'PENDING'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: UPSELLS */}
              {activeTab === 'upsells' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Platform Add-On Services Catalog</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upsells.map((u) => (
                      <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 shadow-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl">{u.icon || '✨'}</span>
                          <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">+${u.price}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{u.title}</h4>
                        <p className="text-xs text-neutral-400">{u.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MANUAL BOOKING & CALENDAR LOCK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white">Direct Booking & OTA Calendar Lock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Select Property</label>
                <select
                  required
                  value={manualBooking.property_id}
                  onChange={(e) => setManualBooking({ ...manualBooking, property_id: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Listing --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (${p.price}/night)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={manualBooking.guest_name}
                    onChange={(e) => setManualBooking({ ...manualBooking, guest_name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+256..."
                    value={manualBooking.phone}
                    onChange={(e) => setManualBooking({ ...manualBooking, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={manualBooking.check_in}
                    onChange={(e) => setManualBooking({ ...manualBooking, check_in: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={manualBooking.check_out}
                    onChange={(e) => setManualBooking({ ...manualBooking, check_out: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Total Agreed Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={manualBooking.total_price}
                    onChange={(e) => setManualBooking({ ...manualBooking, total_price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Booking Source</label>
                  <select
                    value={manualBooking.purpose}
                    onChange={(e) => setManualBooking({ ...manualBooking, purpose: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Direct Walk-in">Direct Walk-in</option>
                    <option value="Instagram / Phone">Instagram / Phone</option>
                    <option value="Repeat Guest">Repeat Guest</option>
                    <option value="Agent Referral">Agent Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Host Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid cash upon key handover..."
                  value={manualBooking.guest_notes}
                  onChange={(e) => setManualBooking({ ...manualBooking, guest_notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition shadow cursor-pointer"
                >
                  ⚡ Confirm & Lock Calendars
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