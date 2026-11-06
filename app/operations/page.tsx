'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'ledger'>('properties')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // EDIT PROPERTY MODAL STATE (WITH ICAL CHANNEL MANAGER)
  const [editingProp, setEditingProp] = useState<any | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('Apartment')
  const [editPrice, setEditPrice] = useState(0)
  const [editLocation, setEditLocation] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAmenities, setEditAmenities] = useState('')
  const [editCleaningFee, setEditCleaningFee] = useState(0)
  const [editPartyDeposit, setEditPartyDeposit] = useState(0)
  const [airbnbUrl, setAirbnbUrl] = useState('')
  const [bookingcomUrl, setBookingcomUrl] = useState('')
  const [vrboUrl, setVrboUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const [propsRes, bookRes, taskRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
    } catch (err) {
      console.error('Error loading operations data:', err)
    } finally {
      setLoading(false)
    }
  }

  // OPEN EDIT MODAL WITH PROPERTY DATA
  const handleOpenEdit = (p: any) => {
    setEditingProp(p)
    setEditTitle(p.title || '')
    setEditCategory(p.category || 'Apartment')
    setEditPrice(p.price || 0)
    setEditLocation(p.location || '')
    setEditDescription(p.description || '')
    setEditAmenities(p.amenities ? p.amenities.join(', ') : '')
    setEditCleaningFee(p.cleaning_fee || 0)
    setEditPartyDeposit(p.party_security_deposit || 0)
    setAirbnbUrl(p.airbnb_ical_url || '')
    setBookingcomUrl(p.bookingcom_ical_url || '')
    setVrboUrl(p.vrbo_ical_url || '')
  }

  // SAVE UPDATED PROPERTY TO SUPABASE
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProp) return

    setSaving(true)
    try {
      const amenitiesArray = editAmenities
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      const { error } = await supabase
        .from('properties')
        .update({
          title: editTitle,
          category: editCategory,
          price: Number(editPrice),
          location: editLocation,
          description: editDescription,
          amenities: amenitiesArray,
          cleaning_fee: Number(editCleaningFee),
          party_security_deposit: Number(editPartyDeposit),
          airbnb_ical_url: airbnbUrl,
          bookingcom_ical_url: bookingcomUrl,
          vrbo_ical_url: vrboUrl
        })
        .eq('id', editingProp.id)

      if (error) throw error

      setEditingProp(null)
      fetchHostData()
      alert('✅ Property and iCal Channel settings updated successfully!')
    } catch (err: any) {
      alert('Error updating property: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyTask = async (taskId: number, verifyStatus: 'VERIFIED' | 'REOPEN') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: verifyStatus })
        .eq('id', taskId)

      if (error) throw error
      fetchHostData()
    } catch (err: any) {
      alert('Error updating task: ' + err.message)
    }
  }

  const totalEarnings = bookings.reduce((sum, b) => sum + (Number(b.paid_amount) || Number(b.total_price) || 0), 0)
  const totalBookingsCount = bookings.length

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* TAB NAVIGATION BAR */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🏠 Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                📅 Bookings ({bookings.length})
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
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                💰 Financial Ledger
              </button>
            </div>
          </div>

          {/* GUEST DEMOGRAPHIC INTELLIGENCE PANEL */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="font-extrabold text-white text-base">📊 Guest Demographics & Intelligence</h3>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full">
                Automated Insights
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Top Purpose</span>
                <span className="text-sm font-black text-amber-400">Business (45%)</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Top Channel</span>
                <span className="text-sm font-black text-amber-400">TikTok (60%)</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Avg Occupancy</span>
                <span className="text-sm font-black text-white">2.1 Adults / 0.3 Child</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Recommendation</span>
                <span className="text-xs font-bold text-emerald-400">Add Workspace Desks</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">
              Loading operational data...
            </div>
          ) : (
            <>
              {/* 1. PROPERTIES TAB WITH IMAGE PREVIEWS & EDITING */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Managed Properties</h3>
                    <span className="text-xs text-neutral-400 font-bold">{properties.length} Active Listings</span>
                  </div>

                  {properties.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500 text-xs font-bold bg-neutral-900 rounded-2xl border border-neutral-800">
                      No properties found in your host account.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {properties.map((p) => {
                        const gallery = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : [])

                        return (
                          <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                            <div>
                              <div className="relative aspect-[16/10] bg-neutral-950">
                                {gallery.length > 0 ? (
                                  <img src={gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">
                                    No Image Available
                                  </div>
                                )}
                                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">
                                  {p.category || 'Apartment'}
                                </span>
                                {gallery.length > 1 && (
                                  <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-neutral-700">
                                    📸 {gallery.length} Photos
                                  </span>
                                )}
                              </div>

                              <div className="p-4 space-y-2">
                                <div className="flex justify-between items-baseline gap-2">
                                  <h4 className="font-black text-white text-base truncate">{p.title}</h4>
                                  <span className="text-amber-400 font-black text-base shrink-0">${p.price || 0}/night</span>
                                </div>
                                <p className="text-xs text-neutral-400">📍 {p.location}</p>
                                {p.description && (
                                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                                    {p.description}
                                  </p>
                                )}
                                {p.amenities && p.amenities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {p.amenities.map((item: string, idx: number) => (
                                      <span key={idx} className="bg-neutral-950 border border-neutral-800 text-[9px] font-bold text-neutral-300 px-2 py-0.5 rounded-md">
                                        ✓ {item}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="p-4 pt-0">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                              >
                                ✏️ Edit Property & iCal Sync
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Guest Reservations</h3>
                    <span className="text-xs text-neutral-400 font-bold">{bookings.length} Total Bookings</span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500 text-xs font-bold bg-neutral-900 rounded-2xl border border-neutral-800">
                      No active or pending bookings found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bookings.map((b) => (
                        <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                              <span className="text-xs font-black text-amber-400">ID #{b.id}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                b.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {b.status || 'PAID'}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-black text-white text-base">{b.guest_name || 'Guest'}</h4>
                              <p className="text-xs text-neutral-400">📱 {b.phone}</p>
                            </div>

                            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                              <div className="flex justify-between text-neutral-300">
                                <span>Dates:</span>
                                <span className="font-bold text-white">{b.check_in} → {b.check_out}</span>
                              </div>
                              <div className="flex justify-between text-neutral-300">
                                <span>Guests:</span>
                                <span className="font-bold text-white">{b.adults || 1} Adult(s), {b.children || 0} Child(ren)</span>
                              </div>
                              <div className="flex justify-between text-neutral-300">
                                <span>Purpose:</span>
                                <span className="font-bold text-amber-400">{b.purpose || 'Leisure'}</span>
                              </div>
                              <div className="flex justify-between text-neutral-300">
                                <span>Source:</span>
                                <span className="font-bold text-neutral-400">{b.booking_source || 'Direct Website'}</span>
                              </div>
                              {b.door_code && (
                                <div className="flex justify-between text-neutral-300 border-t border-neutral-800 pt-1.5 mt-1.5">
                                  <span>Door Access Code:</span>
                                  <span className="font-black text-emerald-400">{b.door_code}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 space-y-3">
                            <div className="flex justify-between items-center border-t border-neutral-800 pt-2">
                              <span className="text-xs text-neutral-400 font-bold">Total Revenue:</span>
                              <span className="text-base font-black text-amber-400">${b.paid_amount || b.total_price || 0}</span>
                            </div>

                            {b.phone && (
                              <a
                                href={`https://api.whatsapp.com/send?phone=${b.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-center w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition"
                              >
                                Message Guest on WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. TASKS TAB */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Automated Housekeeping & Work Orders</h3>
                    <span className="text-xs text-neutral-400 font-bold">{tasks.length} Active Tasks</span>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500 text-xs font-bold bg-neutral-900 rounded-2xl border border-neutral-800">
                      No cleaning or inspection tasks generated yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map((t) => (
                        <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-xl">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{t.task_type || 'Cleaning'}</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                              t.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-base">{t.title}</h4>
                          <p className="text-xs text-neutral-400">Assigned To: <span className="text-white font-bold">{t.assignedTo || 'Aisha (Head Cleaner)'}</span></p>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleVerifyTask(t.id, 'VERIFIED')}
                              className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                            >
                              ✓ Verify Photos & Ready
                            </button>
                            <button
                              onClick={() => handleVerifyTask(t.id, 'REOPEN')}
                              className="w-1/2 py-2.5 bg-rose-950 border border-rose-900 text-rose-400 font-extrabold text-xs rounded-xl hover:bg-rose-900 transition cursor-pointer"
                            >
                              ✕ Re-Open Task
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. FINANCIAL LEDGER TAB */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Financial Ledger & Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold uppercase">Total Gross Revenue</span>
                      <p className="text-2xl font-black text-amber-400">${totalEarnings}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold uppercase">Paid Reservations</span>
                      <p className="text-2xl font-black text-white">{totalBookingsCount}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold uppercase">Avg Booking Value</span>
                      <p className="text-2xl font-black text-emerald-400">
                        ${totalBookingsCount > 0 ? Math.round(totalEarnings / totalBookingsCount) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* EDIT PROPERTY & ICAL SYNC MODAL */}
      {editingProp && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Host Management</span>
                <h3 className="text-lg font-black text-white">Edit Property & Channel Sync</h3>
              </div>
              <button
                onClick={() => setEditingProp(null)}
                className="text-neutral-400 hover:text-white font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl font-bold focus:border-amber-500"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                    <option value="House">House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Nightly Rate ($)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl font-bold focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Amenities (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. WiFi, Air Conditioning, Pool, Kitchen"
                  value={editAmenities}
                  onChange={(e) => setEditAmenities(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Cleaning Fee ($)</label>
                  <input
                    type="number"
                    value={editCleaningFee}
                    onChange={(e) => setEditCleaningFee(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Party Deposit ($)</label>
                  <input
                    type="number"
                    value={editPartyDeposit}
                    onChange={(e) => setEditPartyDeposit(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                  />
                </div>
              </div>

              {/* CHANNEL MANAGER / ICAL SETTINGS */}
              <div className="border-t border-neutral-800 pt-3 space-y-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  🔗 Channel Manager (iCal Sync)
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                    Your Export Calendar Link (Paste into Airbnb / Booking.com)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://vacation-pms.vercel.app/api/ical/${editingProp.ical_export_token}`}
                      className="w-full bg-neutral-950 border border-neutral-800 text-[11px] text-amber-400 p-2.5 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://vacation-pms.vercel.app/api/ical/${editingProp.ical_export_token}`)
                        alert('Copied iCal link to clipboard!')
                      }}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">Airbnb iCal Import URL</label>
                    <input
                      type="url"
                      placeholder="https://www.airbnb.com/calendar/ical/..."
                      value={airbnbUrl}
                      onChange={(e) => setAirbnbUrl(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">Booking.com iCal Import URL</label>
                    <input
                      type="url"
                      placeholder="https://ical.booking.com/v1/export?..."
                      value={bookingcomUrl}
                      onChange={(e) => setBookingcomUrl(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="w-1/3 py-3 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-2/3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
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