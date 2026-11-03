'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import UpsellMotionSlider from '../components/UpsellMotionSlider'
import { supabase } from '@/lib/supabase'

export default function HostOperationsPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'properties' | 'tasks' | 'ledger'>('bookings')
  
  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([
    { id: 1, title: 'Clean Turnover - Ntinda Apt', priority: 'High', status: 'Pending', assignedTo: 'Housekeeping', phone: '+256780564778' },
    { id: 2, title: 'Refill Cooking Gas - Munyonyo Mansion', priority: 'Medium', status: 'Completed', assignedTo: 'Maintenance', phone: '+256726797237' }
  ])
  const [bills, setBills] = useState<any[]>([
    { id: 1, description: 'Monthly Wi-Fi Internet', amount: '$50', status: 'Paid', date: 'Nov 1, 2026' },
    { id: 2, description: 'Deep Cleaning Service', amount: '$30', status: 'Pending', date: 'Nov 2, 2026' }
  ])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortalData()
  }, [])

  const fetchPortalData = async () => {
    setLoading(true)
    const { data: bookingData } = await supabase.from('bookings').select('*').order('id', { ascending: false })
    if (bookingData) setBookings(bookingData)

    const { data: propertyData } = await supabase.from('properties').select('*').order('id', { ascending: false })
    if (propertyData) setProperties(propertyData)

    setLoading(false)
  }

  // Helper to parse messy combined strings from Supabase if needed
  const parseBookingData = (b: any) => {
    let rawName = b.guest_name || b.name || ''
    
    // If guest_name contains the combined string format
    if (rawName.includes('Prop:')) {
      const getVal = (label: string) => {
        const parts = rawName.split('|')
        const found = parts.find((p: string) => p.includes(label))
        return found ? found.split(':')[1]?.trim() : ''
      }
      return {
        propertyTitle: getVal('Prop') || 'Property Stay',
        guestName: getVal('Guest') || 'Guest',
        phone: getVal('Ph') || b.phone || '+256726797237',
        demographic: getVal('Demo') || 'Couple with Kids',
        guestsCount: getVal('Guests') || '2',
        dates: getVal('In') ? `${getVal('In')} → ${getVal('Out')}` : '2026-11-12 → 2026-12-14',
        notes: getVal('Notes') || b.notes || 'need airport pickup',
        status: b.status || 'Confirmed'
      }
    }

    return {
      propertyTitle: b.property_title || b.property || 'Property Stay',
      guestName: rawName || 'Guest',
      phone: b.phone || b.contact || '+256726797237',
      demographic: b.demographic || 'Couple with Kids',
      guestsCount: b.guests || '2',
      dates: b.check_in ? `${b.check_in} → ${b.check_out}` : '2026-11-12 → 2026-12-14',
      notes: b.notes || b.special_requests || 'need airport pickup',
      status: b.status || 'Confirmed'
    }
  }

  const openWhatsApp = (phone: string, guestName: string, property: string) => {
    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : ''
    const message = encodeURIComponent(`Hello ${guestName}, thank you for choosing La Estancia Vacation Homes regarding your stay at ${property}!`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const deleteBooking = async (id: number) => {
    await supabase.from('bookings').delete().eq('id', id)
    setBookings(bookings.filter(b => b.id !== id))
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* PORTAL HEADER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                La Estancia Host Operations Portal
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Centralized PMS: Manage Bookings, Properties, Upsells, Tasks, and Financial Ledgers.
              </p>
            </div>
          </div>
        </section>

        {/* 🚀 UPSELL MOTION AD SLIDER */}
        <UpsellMotionSlider />

        {/* MAIN DASHBOARD CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          {/* NAVIGATION TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              📅 Bookings ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'properties'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🏠 Properties ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🧹 Staff Tasks ({tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              💰 Financial Ledger ({bills.length})
            </button>
          </div>

          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="font-extrabold text-white text-lg">Guest Reservation Requests</h3>
              
              {loading ? (
                <p className="text-xs text-neutral-500 animate-pulse">Loading reservation records...</p>
              ) : bookings.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs font-bold">
                  No reservation requests submitted yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((b) => {
                    const parsed = parseBookingData(b)

                    return (
                      <div
                        key={b.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden max-w-3xl"
                      >
                        {/* CARD HEADER WITH PROPERTY & STATUS BADGE */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900 pb-4">
                          <h4 className="font-black text-white text-base sm:text-lg tracking-tight truncate max-w-xl">
                            {parsed.propertyTitle}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase self-start sm:self-auto ${
                            parsed.status === 'Confirmed' 
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          }`}>
                            {parsed.status}
                          </span>
                        </div>

                        {/* DETAILS LIST */}
                        <div className="space-y-3 text-xs sm:text-sm text-neutral-300 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👤</span>
                            <span className="text-neutral-400 font-semibold">Guest Name:</span>
                            <span className="font-bold text-white">{parsed.guestName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-base">💬</span>
                            <span className="text-neutral-400 font-semibold">WhatsApp:</span>
                            <span className="font-bold text-emerald-400 font-mono">{parsed.phone}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-base">👥</span>
                            <span className="text-neutral-400 font-semibold">Demographic:</span>
                            <span className="font-bold text-neutral-200">{parsed.demographic}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-base">👨‍👩‍👧</span>
                            <span className="text-neutral-400 font-semibold">Guests:</span>
                            <span className="font-bold text-neutral-200">{parsed.guestsCount}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <span className="text-neutral-400 font-semibold">Dates:</span>
                            <span className="font-bold text-neutral-200">{parsed.dates}</span>
                          </div>
                        </div>

                        {/* GUEST NOTES BOX */}
                        <div className="p-3.5 bg-neutral-900 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                          <span className="text-base">📄</span>
                          <div>
                            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Guest Notes: </span>
                            <span className="text-xs text-neutral-300 font-medium">{parsed.notes}</span>
                          </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="space-y-3 pt-2">
                          <button
                            onClick={() => openWhatsApp(parsed.phone, parsed.guestName, parsed.propertyTitle)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            💬 Message Guest on WhatsApp
                          </button>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                const updated = bookings.map(item => item.id === b.id ? { ...item, status: parsed.status === 'Confirmed' ? 'Pending' : 'Confirmed' } : item)
                                setBookings(updated)
                              }}
                              className="py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl border border-neutral-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              🔄 {parsed.status === 'Confirmed' ? 'Mark Pending' : 'Mark Confirmed'}
                            </button>

                            <button
                              onClick={() => deleteBooking(b.id)}
                              className="py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 font-bold text-xs rounded-xl border border-rose-900/50 transition cursor-pointer flex items-center justify-center gap-1.5"
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
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-lg">Property Listings Portfolio</h3>
              {properties.length === 0 ? (
                <p className="text-xs text-neutral-500 py-8 text-center">No properties added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((p) => (
                    <div key={p.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <h4 className="font-bold text-white text-sm">{p.title}</h4>
                      <p className="text-xs text-amber-400 font-bold">${p.price_per_night || p.price || 0} / night</p>
                      <p className="text-xs text-neutral-400">📍 {p.location || 'Uganda'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STAFF TASKS TRACKER */}
          {activeTab === 'tasks' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-lg">Automated Housekeeping & Staff Dispatch</h3>
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 mr-2">
                        {t.priority} Priority
                      </span>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm inline">{t.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1">Assigned: {t.assignedTo} • Status: {t.status}</p>
                    </div>
                    <button
                      onClick={() => openWhatsApp(t.phone, t.assignedTo, t.title)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
                    >
                      💬 Dispatch on WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-lg">Operational Bills & Financial Ledger</h3>
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">{bill.description}</h4>
                      <p className="text-xs text-neutral-400">{bill.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-amber-400 text-sm">{bill.amount}</p>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase">{bill.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      </div>

      <Footer />
    </main>
  )
}