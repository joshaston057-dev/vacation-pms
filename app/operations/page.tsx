'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

const COMMON_AMENITIES = [
  'High-Speed WiFi',
  'Air Conditioning',
  'Smart TV',
  'Kitchen / Microwave',
  'Free Parking',
  'Washing Machine',
  'Balcony / Garden',
  '24/7 Security',
  'Hot Shower',
  'Generator Backup'
]

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'ledger' | 'upsells' | 'cohosts'>('properties')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [cohosts, setCohosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Listing Modal
  const [showEditListingModal, setShowEditListingModal] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>({
    id: '',
    title: '',
    custom_name: '',
    price: '',
    location: '',
    category: 'Apartment',
    images: [],
    amenities: []
  })

  // Manual Booking Modal
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

  // Other Modals
  const [showCoHostModal, setShowCoHostModal] = useState(false)
  const [newCoHost, setNewCoHost] = useState({ name: '', specialty: '', location: '', rating: '5.0', phone: '', bio: '', image_url: '' })

  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [newUpsell, setNewUpsell] = useState({ title: '', description: '', price: '', category: 'Service', icon: '✨' })

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const [propsRes, bookRes, taskRes, upsellRes, expenseRes, cohostRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').order('id', { ascending: true }),
        supabase.from('expenses').select('*').order('id', { ascending: false }),
        supabase.from('co_hosts').select('*').order('id', { ascending: true })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
      if (expenseRes.data) setExpenses(expenseRes.data)
      if (cohostRes.data) setCohosts(cohostRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const openEditListingModal = (property: any) => {
    const imgArray = Array.isArray(property.images) ? property.images : property.image_url ? [property.image_url] : []
    const amenitiesArray = Array.isArray(property.amenities) ? property.amenities : ['High-Speed WiFi', 'Air Conditioning', 'Smart TV', 'Kitchen / Microwave']
    
    setEditingProperty({
      id: property.id,
      title: property.title || '',
      custom_name: property.custom_name || '',
      price: property.price || '',
      location: property.location || '',
      category: property.category || 'Apartment',
      images: imgArray,
      amenities: amenitiesArray
    })
    setShowEditListingModal(true)
  }

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    try {
      const updatedImages = [...editingProperty.images]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const randomStr = Math.random().toString(36).substring(2)
        const fileName = `pms-${randomStr}-${Date.now()}.${fileExt}`
        const filePath = `listings/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          updatedImages.push(publicUrlData.publicUrl)
        }
      }

      setEditingProperty({ ...editingProperty, images: updatedImages })
      alert('✅ Photos uploaded successfully!')
    } catch (err: any) {
      alert('Upload Error: ' + err.message)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const filtered = editingProperty.images.filter((_: any, idx: number) => idx !== indexToRemove)
    setEditingProperty({ ...editingProperty, images: filtered })
  }

  const handleToggleAmenity = (amenityName: string) => {
    const currentAmenities = editingProperty.amenities || []
    if (currentAmenities.includes(amenityName)) {
      setEditingProperty({
        ...editingProperty,
        amenities: currentAmenities.filter((a: string) => a !== amenityName)
      })
    } else {
      setEditingProperty({
        ...editingProperty,
        amenities: [...currentAmenities, amenityName]
      })
    }
  }

  const handleSaveFullListing = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: editingProperty.custom_name,
          custom_name: editingProperty.custom_name,
          price: parseFloat(editingProperty.price) || 0,
          location: editingProperty.location,
          category: editingProperty.category,
          images: editingProperty.images,
          image_url: editingProperty.images[0] || null,
          amenities: editingProperty.amenities
        })
        .eq('id', editingProperty.id)

      if (error) throw error

      alert('✅ Listing updated successfully!')
      setShowEditListingModal(false)
      fetchHostData()
    } catch (err: any) {
      alert('Error updating listing: ' + err.message)
    }
  }

  const handleApproveBooking = async (booking: any) => {
    try {
      await supabase.from('bookings').update({ status: 'CONFIRMED' }).eq('id', booking.id)
      if (booking.property_id) {
        await supabase.from('properties').update({ status: 'OCCUPIED' }).eq('id', booking.property_id)
      }
      fetchHostData()
      alert('✅ Booking confirmed!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Delete booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    fetchHostData()
  }

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedProp = properties.find((p) => String(p.id) === String(manualBooking.property_id))
      const propTitle = selectedProp?.custom_name || selectedProp?.title || 'Direct Booking'

      const { error } = await supabase.from('bookings').insert([
        {
          property_id: manualBooking.property_id,
          property_title: propTitle,
          guest_name: manualBooking.guest_name,
          phone: manualBooking.phone,
          purpose: manualBooking.purpose,
          check_in: manualBooking.check_in,
          check_out: manualBooking.check_out,
          total_price: parseFloat(manualBooking.total_price) || 0,
          guest_notes: manualBooking.guest_notes || 'Manual reservation',
          status: 'CONFIRMED'
        }
      ])

      if (error) throw error
      await supabase.from('properties').update({ status: 'OCCUPIED' }).eq('id', manualBooking.property_id)

      alert('✅ Reservation confirmed & calendar locked!')
      setShowAddModal(false)
      setManualBooking({ property_id: '', guest_name: '', phone: '', purpose: 'Direct Walk-in', check_in: '', check_out: '', total_price: '', guest_notes: '' })
      fetchHostData()
    } catch (err: any) {
      alert('Error: ' + err.message)
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

  const handleCreateCoHost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await supabase.from('co_hosts').insert([newCoHost])
      alert('✅ Co-host added!')
      setShowCoHostModal(false)
      setNewCoHost({ name: '', specialty: '', location: '', rating: '5.0', phone: '', bio: '', image_url: '' })
      fetchHostData()
    } catch (err: any) { alert('Error: ' + err.message) }
  }

  const handleDeleteCoHost = async (id: number) => {
    if (!confirm('Remove co-host?')) return
    await supabase.from('co_hosts').delete().eq('id', id)
    fetchHostData()
  }

  const handleCreateUpsell = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await supabase.from('upsell_services').insert([{ ...newUpsell, price_usd: parseFloat(newUpsell.price) || 0 }])
      alert('✅ Upsell added!')
      setShowUpsellModal(false)
      setNewUpsell({ title: '', description: '', price: '', category: 'Service', icon: '✨' })
      fetchHostData()
    } catch (err: any) { alert('Error: ' + err.message) }
  }

  const handleDeleteUpsell = async (id: number) => {
    await supabase.from('upsell_services').delete().eq('id', id)
    fetchHostData()
  }

  const filteredProperties = properties.filter((p) =>
    (p.custom_name || p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Quick search properties, guests, or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition shadow-lg"
            />
          </div>

          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2 scrollbar-none">
            <button onClick={() => setActiveTab('properties')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🏠 Properties ({properties.length})</button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>📅 Bookings ({bookings.length})</button>
            <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🧹 Dispatch ({tasks.length})</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>💰 Ledger</button>
            <button onClick={() => setActiveTab('upsells')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'upsells' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>✨ Upsells ({upsells.length})</button>
            <button onClick={() => setActiveTab('cohosts')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'cohosts' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🤝 Co-Hosts ({cohosts.length})</button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">Loading operations hub...</div>
          ) : (
            <>
              {activeTab === 'properties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProperties.map((p) => {
                    const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
                    const displayTitle = p.custom_name || p.title || 'Executive Apartment'
                    return (
                      <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="relative aspect-[16/10] bg-neutral-950">
                          {gallery.length > 0 ? (
                            <img src={gallery[0]} alt={displayTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                          )}
                          <span className="absolute top-3 left-3 bg-black/80 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                            {gallery.length} Photos
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-black text-white text-base truncate">{displayTitle}</h4>
                            <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                          </div>
                          <p className="text-xs text-neutral-400">📍 {p.location}</p>
                          <button
                            onClick={() => openEditListingModal(p)}
                            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            ✏️ Edit Listing, Photos & Amenities
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white">Guest Reservations & Inquiries</h3>
                      <span className="text-xs text-neutral-400 font-bold">{bookings.length} Total Bookings</span>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
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
                        const rawTitle = b.property_title || 'Executive Apartment'
                        const checkInDate = b.check_in || 'N/A'
                        const checkOutDate = b.check_out || 'N/A'
                        const specialNotes = b.guest_notes || 'No special requests'

                        const paymentWhatsAppText = encodeURIComponent(
                          `Hello ${guestName}! 👋 Thank you for your inquiry for *${rawTitle}*.\n\n` +
                          `📅 *Stay Dates:* ${checkInDate} → ${checkOutDate}\n` +
                          `💰 *Total Stay:* $${totalStay}\n` +
                          `🔐 *30% Deposit Required:* $${depositDue}\n\n` +
                          `Please complete your deposit payment via Mobile Money or Card. Reply with your payment code once sent!`
                        )

                        return (
                          <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-3">
                                <h4 className="font-black text-white text-sm leading-snug">{rawTitle}</h4>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
                                  isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {b.status || 'PENDING'}
                                </span>
                              </div>

                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs">
                                <div className="text-neutral-300">👤 Guest: <span className="font-extrabold text-white">{guestName}</span></div>
                                <div className="text-neutral-300">💬 Phone: <span className="font-extrabold text-emerald-400">{phoneNum}</span></div>
                                <div className="text-neutral-300">📅 Dates: <span className="font-extrabold text-white">{checkInDate} → {checkOutDate}</span></div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                                    <span className="text-[10px] text-neutral-400 block">Total:</span>
                                    <span className="text-amber-400 font-black">${totalStay}</span>
                                  </div>
                                  <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                                    <span className="text-[10px] text-neutral-400 block">Deposit:</span>
                                    <span className="text-emerald-400 font-black">${depositDue}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-0.5">Special Notes:</span>
                                <p className="text-xs text-neutral-300">{specialNotes}</p>
                              </div>
                            </div>

                            <div className="space-y-2 pt-1">
                              {!isConfirmed && (
                                <button
                                  onClick={() => handleApproveBooking(b)}
                                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition text-center"
                                >
                                  ⚡ Approve & Lock Calendar
                                </button>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${phoneNum.replace(/[^0-9]/g, '')}&text=${paymentWhatsAppText}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1 text-center cursor-pointer"
                                >
                                  💬 WhatsApp
                                </a>
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
                  )}
                </div>
              )}

              {activeTab === 'upsells' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Upsell Services Catalog</h3>
                    <button onClick={() => setShowUpsellModal(true)} className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">➕ Add New Service</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upsells.map((u) => (
                      <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">{u.icon || '✨'}</span>
                            <span className="text-xs font-black text-amber-400">+${u.price || u.price_usd || 0}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm">{u.title}</h4>
                          <p className="text-xs text-neutral-400">{u.description}</p>
                        </div>
                        <button onClick={() => handleDeleteUpsell(u.id)} className="w-full py-2 bg-rose-950 text-rose-400 text-xs font-bold rounded-xl cursor-pointer">🗑️ Remove Service</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'cohosts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Co-Host Marketplace</h3>
                    <button onClick={() => setShowCoHostModal(true)} className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">➕ Add New Co-Host</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {cohosts.map((ch) => (
                      <div key={ch.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={ch.image_url} alt={ch.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/30" />
                            <div>
                              <h4 className="font-black text-white text-sm">{ch.name}</h4>
                              <span className="text-[11px] text-amber-400 font-bold">⭐ {ch.rating} Rating</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400">{ch.bio}</p>
                        </div>
                        <button onClick={() => handleDeleteCoHost(ch.id)} className="w-full py-2 bg-rose-950 text-rose-400 font-black text-xs rounded-xl cursor-pointer">🗑️ Remove Co-Host</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && <div className="text-neutral-400 text-xs">Tasks dispatch active.</div>}
              {activeTab === 'ledger' && <div className="text-neutral-400 text-xs">Ledger financials active.</div>}
            </>
          )}
        </div>
      </div>

      {showEditListingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-5 text-xs my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Edit Listing, Device Photos & Amenities</h3>
              <button onClick={() => setShowEditListingModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveFullListing} className="space-y-4">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Listing Title / Layout</label>
                <input type="text" required value={editingProperty.custom_name} onChange={(e) => setEditingProperty({ ...editingProperty, custom_name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Price ($/night)</label>
                  <input type="number" required value={editingProperty.price} onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-bold text-amber-400" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Location</label>
                  <input type="text" required value={editingProperty.location} onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-neutral-400 font-bold">Property Photos (Upload from Device)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleDeviceFileUpload}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
                {uploadingImages && <p className="text-amber-400 font-bold animate-pulse">Uploading photos to Supabase Storage...</p>}

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {editingProperty.images.map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800">
                      <img src={url} alt="listing preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] cursor-pointer shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-neutral-400 font-bold">Property Amenities (Select applicable)</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                  {COMMON_AMENITIES.map((amenity) => {
                    const isChecked = (editingProperty.amenities || []).includes(amenity)
                    return (
                      <label
                        key={amenity}
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer text-xs ${
                          isChecked ? 'bg-amber-500/10 border-amber-500 text-white font-bold' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-neutral-800 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl cursor-pointer shadow-lg">⚡ Save Listing Changes</button>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Manual Booking & Calendar Lock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Select Property</label>
                <select
                  required
                  value={manualBooking.property_id}
                  onChange={(e) => setManualBooking({ ...manualBooking, property_id: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- Choose Listing --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.custom_name || p.title} (${p.price}/night)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Guest Name</label>
                  <input type="text" required placeholder="Full Name" value={manualBooking.guest_name} onChange={(e) => setManualBooking({ ...manualBooking, guest_name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">WhatsApp Phone</label>
                  <input type="text" required placeholder="+256..." value={manualBooking.phone} onChange={(e) => setManualBooking({ ...manualBooking, phone: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Check-In Date</label>
                  <input type="date" required value={manualBooking.check_in} onChange={(e) => setManualBooking({ ...manualBooking, check_in: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Check-Out Date</label>
                  <input type="date" required value={manualBooking.check_out} onChange={(e) => setManualBooking({ ...manualBooking, check_out: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Total Agreed Price ($)</label>
                  <input type="number" required placeholder="150" value={manualBooking.total_price} onChange={(e) => setManualBooking({ ...manualBooking, total_price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Booking Source</label>
                  <select value={manualBooking.purpose} onChange={(e) => setManualBooking({ ...manualBooking, purpose: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white">
                    <option value="Direct Walk-in">Direct Walk-in</option>
                    <option value="Instagram / Phone">Instagram / Phone</option>
                    <option value="Repeat Guest">Repeat Guest</option>
                    <option value="Agent Referral">Agent Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Special Notes / Requests</label>
                <textarea rows={2} placeholder="e.g. Early check-in requested..." value={manualBooking.guest_notes} onChange={(e) => setManualBooking({ ...manualBooking, guest_notes: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              </div>

              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl cursor-pointer shadow">⚡ Confirm & Lock Calendar</button>
            </form>
          </div>
        </div>
      )}

      {showCoHostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Add Co-Host</h3>
              <button onClick={() => setShowCoHostModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleCreateCoHost} className="space-y-3">
              <input type="text" required placeholder="Name" value={newCoHost.name} onChange={(e) => setNewCoHost({ ...newCoHost, name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Specialty" value={newCoHost.specialty} onChange={(e) => setNewCoHost({ ...newCoHost, specialty: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Location" value={newCoHost.location} onChange={(e) => setNewCoHost({ ...newCoHost, location: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Phone (+256...)" value={newCoHost.phone} onChange={(e) => setNewCoHost({ ...newCoHost, phone: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" placeholder="Photo URL" value={newCoHost.image_url} onChange={(e) => setNewCoHost({ ...newCoHost, image_url: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <textarea rows={2} placeholder="Bio" value={newCoHost.bio} onChange={(e) => setNewCoHost({ ...newCoHost, bio: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">Save Co-Host</button>
            </form>
          </div>
        </div>
      )}

      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Add Upsell Service</h3>
              <button onClick={() => setShowUpsellModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleCreateUpsell} className="space-y-3">
              <input type="text" required placeholder="Service Title" value={newUpsell.title} onChange={(e) => setNewUpsell({ ...newUpsell, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="number" required placeholder="Price ($)" value={newUpsell.price} onChange={(e) => setNewUpsell({ ...newUpsell, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <textarea rows={2} placeholder="Description" value={newUpsell.description} onChange={(e) => setNewUpsell({ ...newUpsell, description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">Save Service</button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}