'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPortal() {
  const [activeTab, setActiveTab] = useState('bookings')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [financials, setFinancials] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    const [propRes, bookRes, taskRes, finRes, servRes] = await Promise.all([
      supabase.from('properties').select('*').order('id', { ascending: false }),
      supabase.from('bookings').select('*').order('id', { ascending: false }),
      supabase.from('tasks').select('*').order('id', { ascending: false }),
      supabase.from('financials').select('*').order('id', { ascending: false }),
      supabase.from('services').select('*').order('id', { ascending: false })
    ])

    if (propRes.data) setProperties(propRes.data)
    if (bookRes.data) setBookings(bookRes.data)
    if (taskRes.data) setTasks(taskRes.data)
    if (finRes.data) setFinancials(finRes.data)
    if (servRes.data) setServices(servRes.data)
    setLoading(false)
  }

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchAllData()
  }

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Delete booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    fetchAllData()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            La Estancia Host Operations Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Centralized PMS: Manage Bookings, Properties, and Operations.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-6 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              📅 Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              🏠 Properties ({properties.length})
            </button>
          </div>
        </section>

        {activeTab === 'bookings' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <h2 className="text-base font-extrabold text-white">Guest Reservation Requests</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                No reservation requests submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map(b => {
                  const status = b.status || 'Pending Host Review'
                  const isApproved = status.toLowerCase().includes('confirm') || status.toLowerCase().includes('approv')
                  const rawNameStr = b.guest_name || ''
                  
                  let parsedProperty = 'Requested Property'
                  let parsedGuestName = rawNameStr
                  let parsedPhone = ''
                  let parsedDemographic = 'N/A'
                  let parsedGuests = 'N/A'
                  let parsedCheckIn = 'N/A'
                  let parsedCheckOut = 'N/A'
                  let parsedNotes = 'None'

                  if (rawNameStr.includes('Prop: [')) {
                    const propMatch = rawNameStr.match(/Prop:\s*\[(.*?)\]/)
                    if (propMatch) parsedProperty = propMatch[1]

                    const guestMatch = rawNameStr.match(/Guest:\s*(.*?)(?=\s*\||$)/)
                    if (guestMatch) parsedGuestName = guestMatch[1].trim()

                    const phMatch = rawNameStr.match(/Ph:\s*(.*?)(?=\s*\||$)/)
                    if (phMatch) parsedPhone = phMatch[1].trim()

                    const demoMatch = rawNameStr.match(/Demo:\s*(.*?)(?=\s*\||$)/)
                    if (demoMatch) parsedDemographic = demoMatch[1].trim()

                    const guestsMatch = rawNameStr.match(/Guests:\s*(.*?)(?=\s*\||$)/)
                    if (guestsMatch) parsedGuests = guestsMatch[1].trim()

                    const inMatch = rawNameStr.match(/In:\s*(.*?)(?=\s*\||$)/)
                    if (inMatch) parsedCheckIn = inMatch[1].trim()

                    const outMatch = rawNameStr.match(/Out:\s*(.*?)(?=\s*\||$)/)
                    if (outMatch) parsedCheckOut = outMatch[1].trim()

                    const notesMatch = rawNameStr.match(/Notes:\s*(.*?)(?=\s*\||$)/)
                    if (notesMatch) parsedNotes = notesMatch[1].trim()
                  }

                  const cleanPhone = parsedPhone.replace(/[^0-9]/g, '')

                  return (
                    <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-extrabold text-white text-sm line-clamp-1">{parsedProperty}</h3>
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                            isApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-300 space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                          <p>👤 <strong className="text-white">Guest Name:</strong> {parsedGuestName}</p>
                          <p>💬 <strong className="text-white">WhatsApp:</strong> <span className={cleanPhone ? 'text-emerald-400 font-mono font-bold' : 'text-neutral-500'}>{cleanPhone ? `+${cleanPhone}` : 'Not provided'}</span></p>
                          <p>👥 <strong className="text-amber-400">Demographic:</strong> {parsedDemographic}</p>
                          <p>👨‍👩‍👧 <strong className="text-white">Guests:</strong> {parsedGuests}</p>
                          <p>📅 <strong className="text-white">Dates:</strong> {parsedCheckIn} → {parsedCheckOut}</p>
                          <p>📝 <strong className="text-amber-400">Notes:</strong> {parsedNotes}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-neutral-800">
                        <button
                          onClick={() => {
                            const phoneToUse = cleanPhone || prompt('Enter guest WhatsApp number:')?.replace(/[^0-9]/g, '')
                            if (!phoneToUse) return
                            window.open(`https://api.whatsapp.com/send?phone=${phoneToUse}&text=Hello%20${parsedGuestName}`, '_blank')
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                        >
                          💬 Message Guest on WhatsApp
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, isApproved ? 'Pending Host Review' : 'Confirmed')}
                            className="py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 rounded-xl cursor-pointer border border-neutral-700"
                          >
                            {isApproved ? '↩︎ Mark Pending' : '✓ Approve Stay'}
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl cursor-pointer border border-red-500/20"
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
          </section>
        )}

        {activeTab === 'properties' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <h2 className="text-base font-extrabold text-white">Properties List</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map(p => (
                <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <h3 className="font-extrabold text-white text-sm">{p.title}</h3>
                  <p className="text-xs text-neutral-400">📍 {p.location}</p>
                  <p className="text-xs text-amber-500 font-bold">${p.price_per_night || p.price} / night</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
}