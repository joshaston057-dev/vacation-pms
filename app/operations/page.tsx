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

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const [propsRes, bookRes, taskRes, upsellRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').order('id', { ascending: false })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
    } catch (err) {
      console.error('Error loading operations data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBooking = async (bookingId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED' })
        .eq('id', bookingId)

      if (error) throw error
      fetchHostData()
      alert('✅ Booking approved and confirmed!')
    } catch (err: any) {
      alert('Error approving booking: ' + err.message)
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
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
        if (part.includes('Guest:')) {
          return part.replace('Guest:', '').trim()
        }
      }
      return parts[0].replace('Prop:', '').trim()
    }
    return rawName.trim()
  }

  const cleanPhone = (b: any) => {
    if (b.phone && b.phone.trim()) return b.phone.trim()
    return '+256757386946'
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* TAB BAR */}
          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              📅 Bookings & Inquiries ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🏠 Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🧹 Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('upsells')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'upsells' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              ✨ Upsells ({upsells.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              💰 Ledger
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">Loading operations data...</div>
          ) : (
            <>
              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Guest Reservations & Inquiries</h3>
                    <span className="text-xs text-neutral-400 font-bold">{bookings.length} Total</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {bookings.map((b) => {
                      const totalStay = b.total_price || 150
                      const depositDue = Math.round(totalStay * 0.3)
                      const isConfirmed = b.status === 'CONFIRMED'
                      const guestName = cleanGuestName(b.guest_name)
                      const phoneNum = cleanPhone(b)

                      // AUTOMATED PAYMENT WHATSAPP MESSAGE
                      const paymentWhatsAppText = encodeURIComponent(
                        `Hello ${guestName}! 👋 Thank you for your inquiry for *${b.property_title || 'La Estancia Vacation Home'}*.\n\n` +
                        `📅 *Stay Dates:* ${b.check_in || 'N/A'} → ${b.check_out || 'N/A'}\n` +
                        `💰 *Total Stay:* $${totalStay}\n` +
                        `🔐 *30% Deposit Required:* $${depositDue}\n\n` +
                        `Please complete your 30% deposit payment via Mobile Money (MoMo) or Card to secure your reservation. Once sent, kindly reply with your payment confirmation code here!`
                      )

                      return (
                        <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="font-black text-white text-sm leading-snug">
                                {b.property_title || 'Vacation Stay'}
                              </h4>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
                                isConfirmed
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {b.status || 'PENDING'}
                              </span>
                            </div>

                            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs">
                              <div className="flex items-center gap-2.5 text-neutral-300">
                                <span className="text-neutral-400 text-sm">👤</span>
                                <span className="text-neutral-400">Guest Name:</span>
                                <span className="font-extrabold text-white">{guestName}</span>
                              </div>

                              <div className="flex items-center gap-2.5 text-neutral-300">
                                <span className="text-neutral-400 text-sm">💬</span>
                                <span className="text-neutral-400">WhatsApp:</span>
                                <span className="font-extrabold text-emerald-400">{phoneNum}</span>
                              </div>

                              <div className="flex items-center gap-2.5 text-neutral-300">
                                <span className="text-neutral-400 text-sm">👥</span>
                                <span className="text-neutral-400">Demographic:</span>
                                <span className="font-extrabold text-amber-400">{b.purpose || 'Leisure'}</span>
                              </div>

                              <div className="flex items-center gap-2.5 text-neutral-300">
                                <span className="text-neutral-400 text-sm">👥</span>
                                <span className="text-neutral-400">Guests:</span>
                                <span className="font-extrabold text-white">{(b.adults || 1) + (b.children || 0)}</span>
                              </div>

                              <div className="flex items-center gap-2.5 text-neutral-300">
                                <span className="text-neutral-400 text-sm">📅</span>
                                <span className="text-neutral-400">Dates:</span>
                                <span className="font-extrabold text-white">{b.check_in || 'N/A'} → {b.check_out || 'N/A'}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                  <span className="text-[10px] text-neutral-400 block">Total Stay:</span>
                                  <span className="text-amber-400 font-black text-sm">${totalStay}</span>
                                </div>
                                <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                  <span className="text-[10px] text-neutral-400 block">30% Deposit Due:</span>
                                  <span className="text-emerald-400 font-black text-sm">${depositDue}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                                📝 GUEST NOTES:
                              </span>
                              <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                                {b.guest_notes || 'No special requests'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1">
                            {!isConfirmed && (
                              <button
                                onClick={() => handleApproveBooking(b.id)}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition text-center"
                              >
                                ⚡ Approve Cash / MoMo
                              </button>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`https://api.whatsapp.com/send?phone=${phoneNum.replace(/[^0-9]/g, '')}&text=${paymentWhatsAppText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                              >
                                <span>💬</span> WhatsApp Payment
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
                </div>
              )}

              {/* PROPERTIES TAB */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Managed Listings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((p) => {
                      const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []

                      return (
                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                          <div className="relative aspect-[16/10] bg-neutral-950">
                            {gallery.length > 0 ? (
                              <img src={gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                            )}
                            <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                              {p.category || 'Apartment'}
                            </span>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-black text-white text-base truncate">{p.title}</h4>
                              <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                            </div>
                            <p className="text-xs text-neutral-400">📍 {p.location}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}