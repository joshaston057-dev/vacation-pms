'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
import { supabase } from '@/lib/supabase'

const STANDARD_AMENITIES = [
  'Swimming Pool',
  'Standby Generator / Inverter',
  'Air Conditioning',
  '24/7 Security / CCTV',
  'Balcony / City View',
  'Private Parking',
  'Fully Equipped Kitchen',
  'Perimeter Wall / Gate',
  'Elevator Access',
  'Dedicated Workspace',
  'Daily Housekeeping',
  'Smart TV / Netflix',
  'Gym / Fitness Center',
  'Washing Machine',
  'High-Speed Wi-Fi'
]

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'upsells' | 'ledger'>('bookings')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // EDIT PROPERTY MODAL STATE
  const [editingProp, setEditingProp] = useState<any | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('Apartment')
  const [editPrice, setEditPrice] = useState(0)
  const [editLocation, setEditLocation] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSelectedAmenities, setEditSelectedAmenities] = useState<string[]>([])
  const [editCleaningFee, setEditCleaningFee] = useState(0)
  const [editPartyDeposit, setEditPartyDeposit] = useState(0)
  const [editImages, setEditImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // UPSELL FORM STATE
  const [newUpsellTitle, setNewUpsellTitle] = useState('')
  const [newUpsellPrice, setNewUpsellPrice] = useState(0)
  const [newUpsellCategory, setNewUpsellCategory] = useState('Transport')
  const [newUpsellDesc, setNewUpsellDesc] = useState('')
  const [newUpsellIcon, setNewUpsellIcon] = useState('🚗')

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

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string
        if (base64Url) {
          setEditImages((prev) => [...prev, base64Url])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleAmenityToggle = (amenity: string) => {
    setEditSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity]
    )
  }

  const handleOpenEdit = (p: any) => {
    setEditingProp(p)
    setEditTitle(p.title || '')
    setEditCategory(p.category || 'Apartment')
    setEditPrice(p.price || 0)
    setEditLocation(p.location || '')
    setEditDescription(p.description || '')
    setEditSelectedAmenities(Array.isArray(p.amenities) ? p.amenities : [])
    setEditCleaningFee(p.cleaning_fee || 0)
    setEditPartyDeposit(p.party_security_deposit || 0)
    setEditImages(
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : p.image_url
        ? [p.image_url]
        : []
    )
  }

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProp) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: editTitle,
          category: editCategory,
          price: Number(editPrice),
          location: editLocation,
          description: editDescription,
          amenities: editSelectedAmenities,
          images: editImages,
          image_url: editImages[0] || '',
          cleaning_fee: Number(editCleaningFee),
          party_security_deposit: Number(editPartyDeposit)
        })
        .eq('id', editingProp.id)

      if (error) throw error

      setEditingProp(null)
      fetchHostData()
      alert('✅ Property updated successfully!')
    } catch (err: any) {
      alert('Error updating property: ' + err.message)
    } finally {
      setSaving(false)
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
      alert('✅ Booking approved and confirmed! Cleaning task auto-dispatched.')
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

  const handleCreateUpsell = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('upsell_services').insert([
        {
          title: newUpsellTitle,
          price: Number(newUpsellPrice),
          category: newUpsellCategory,
          description: newUpsellDesc,
          icon: newUpsellIcon,
          active: true
        }
      ])

      if (error) throw error

      setNewUpsellTitle('')
      setNewUpsellPrice(0)
      setNewUpsellDesc('')
      fetchHostData()
      alert('✅ New Upsell Service added!')
    } catch (err: any) {
      alert('Error creating upsell service: ' + err.message)
    }
  }

  const handleDeleteUpsell = async (id: number) => {
    if (!confirm('Delete this upsell service?')) return
    try {
      await supabase.from('upsell_services').delete().eq('id', id)
      fetchHostData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleVerifyTask = async (taskId: number, verifyStatus: 'VERIFIED' | 'REOPEN') => {
    try {
      await supabase.from('tasks').update({ status: verifyStatus }).eq('id', taskId)
      fetchHostData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const totalEarnings = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* TAB BAR */}
          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2">
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
              📅 Bookings & Inquiries ({bookings.length})
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
              {/* PROPERTIES TAB */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Managed Listings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((p) => {
                      const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []

                      return (
                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                          <div>
                            <div className="relative aspect-[16/10] bg-neutral-950">
                              {gallery.length > 0 ? (
                                <img src={gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                              )}
                              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                {p.category || 'Apartment'}
                              </span>
                              {gallery.length > 0 && (
                                <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-700">
                                  📸 {gallery.length} Photos
                                </span>
                              )}
                            </div>

                            <div className="p-4 space-y-2">
                              <div className="flex justify-between items-baseline">
                                <h4 className="font-black text-white text-base truncate">{p.title}</h4>
                                <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                              </div>
                              <p className="text-xs text-neutral-400">📍 {p.location}</p>
                            </div>
                          </div>

                          <div className="p-4 pt-0">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-extrabold text-xs rounded-xl shadow cursor-pointer"
                            >
                              ✏️ Edit Property & Photos
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

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

                      return (
                        <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2 border-b border-neutral-800 pb-3">
                              <h4 className="font-black text-white text-xs leading-snug">[{b.property_title || 'Vacation Stay'}]</h4>
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${
                                isConfirmed
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}>
                                {b.status || 'PENDING'}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2 text-neutral-300">
                                <span className="text-neutral-400">👤</span>
                                <span className="text-neutral-400">Guest Name:</span>
                                <span className="font-extrabold text-white">{b.guest_name}</span>
                              </div>

                              <div className="flex items-center gap-2 text-neutral-300">
                                <span className="text-neutral-400">💬</span>
                                <span className="text-neutral-400">WhatsApp:</span>
                                <span className="font-extrabold text-emerald-400">{b.phone}</span>
                              </div>

                              <div className="flex items-center gap-2 text-neutral-300">
                                <span className="text-neutral-400">👥</span>
                                <span className="text-neutral-400">Demographic:</span>
                                <span className="font-extrabold text-amber-400">{b.purpose || 'Solo Business'}</span>
                              </div>

                              <div className="flex items-center gap-2 text-neutral-300">
                                <span className="text-neutral-400">👥</span>
                                <span className="text-neutral-400">Guests:</span>
                                <span className="font-extrabold text-white">{(b.adults || 1) + (b.children || 0)}</span>
                              </div>

                              <div className="flex items-center gap-2 text-neutral-300">
                                <span className="text-neutral-400">📅</span>
                                <span className="text-neutral-400">Dates:</span>
                                <span className="font-extrabold text-white">{b.check_in} → {b.check_out}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <div className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-neutral-300">
                                Total Stay: <span className="text-amber-400 font-black">${totalStay}</span>
                              </div>
                              <div className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-neutral-300">
                                30% Deposit Due: <span className="text-emerald-400 font-black">${depositDue}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                              📝 GUEST NOTES:
                            </span>
                            <p className="text-xs text-neutral-300 font-medium">
                              {b.guest_notes || 'No special requests'}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1">
                            {!isConfirmed && (
                              <button
                                onClick={() => handleApproveBooking(b.id)}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition text-center"
                              >
                                ⚡ Approve Cash / MoMo
                              </button>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              {b.phone && (
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${b.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${b.guest_name}, regarding your stay inquiry for ${b.property_title || 'our property'}:`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                                >
                                  <span>💬</span> WhatsApp
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-400 font-black text-xs rounded-xl shadow transition cursor-pointer text-center"
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

              {/* TASKS TAB */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Housekeeping & Turnover Tasks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((t) => (
                      <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
                        <div className="flex justify-between border-b border-neutral-800 pb-2">
                          <span className="text-xs font-black text-amber-400">{t.task_type}</span>
                          <span className="text-xs font-bold text-neutral-400">{t.status}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-base">{t.title}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => handleVerifyTask(t.id, 'VERIFIED')} className="w-1/2 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer">✓ Verify Ready</button>
                          <button onClick={() => handleVerifyTask(t.id, 'REOPEN')} className="w-1/2 py-2 bg-rose-950 text-rose-400 font-bold text-xs rounded-xl cursor-pointer">✕ Re-Open</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPSELLS TAB */}
              {activeTab === 'upsells' && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                    <h3 className="text-base font-black text-white">Add New Upsell Service</h3>
                    <form onSubmit={handleCreateUpsell} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-400 block mb-1">Title</label>
                        <input type="text" required placeholder="e.g. Airport Pickup" value={newUpsellTitle} onChange={(e) => setNewUpsellTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-400 block mb-1">Price ($)</label>
                          <input type="number" required value={newUpsellPrice} onChange={(e) => setNewUpsellPrice(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl font-bold" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-400 block mb-1">Icon Emoji</label>
                          <input type="text" value={newUpsellIcon} onChange={(e) => setNewUpsellIcon(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl text-center" />
                        </div>
                      </div>
                      <button type="submit" className="sm:col-span-2 py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">
                        + Add Service
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {upsells.map((u) => (
                      <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">{u.icon}</span>
                            <span className="text-xs font-black text-amber-400">${u.price}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm pt-1">{u.title}</h4>
                        </div>
                        <button onClick={() => handleDeleteUpsell(u.id)} className="w-full py-2 bg-rose-950 border border-rose-900 text-rose-400 font-extrabold text-xs rounded-xl mt-3 cursor-pointer">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LEDGER TAB */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Financial Revenue (Confirmed Bookings)</h3>
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <span className="text-xs text-neutral-400 font-bold uppercase">Total Approved Revenue</span>
                    <p className="text-3xl font-black text-amber-400">${totalEarnings}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingProp && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-black text-white">Edit Property & Amenities</h3>
              <button onClick={() => setEditingProp(null)} className="text-neutral-400 hover:text-white font-bold cursor-pointer text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Title</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl" />
              </div>

              <div className="border border-dashed border-amber-500/40 bg-amber-500/5 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-black text-amber-400 uppercase tracking-wider">
                  📷 Add Gallery Photos from Device
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleDeviceImageUpload}
                  className="block w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-500 file:text-black cursor-pointer"
                />

                {editImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {editImages.map((imgSrc, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-800">
                        <img src={imgSrc} alt="thumb" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-black/80 text-rose-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl font-bold">
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                    <option value="House">House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Nightly Rate ($)</label>
                  <input type="number" required value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Location</label>
                <input type="text" required value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Description</label>
                <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl" />
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-black text-amber-400 uppercase tracking-wider">
                  ✓ Select Property Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-neutral-950 p-3 rounded-2xl border border-neutral-800 max-h-48 overflow-y-auto">
                  {STANDARD_AMENITIES.map((amenity) => {
                    const isSelected = editSelectedAmenities.includes(amenity)
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`text-left text-[11px] font-bold p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span>{isSelected ? '☑' : '☐'}</span>
                        <span className="truncate">{amenity}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button type="button" onClick={() => setEditingProp(null)} className="w-1/3 py-3 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="w-2/3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">
                  {saving ? 'Saving...' : 'Save Changes'}
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