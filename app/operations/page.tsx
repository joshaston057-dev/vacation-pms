'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

const AVAILABLE_AMENITIES = [
  'Free High-Speed WiFi',
  'Swimming Pool',
  'Standby Generator / Inverter',
  'Air Conditioning',
  'Fully Equipped Kitchen',
  'Private Parking',
  '24/7 Security / CCTV',
  'Washing Machine',
  'Smart TV / Netflix',
  'Balcony / City View',
  'Gym / Fitness Center',
  'Elevator Access'
]

export default function OperationsPortal() {
  const [activeTab, setActiveTab] = useState('bookings')

  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [financials, setFinancials] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Property Modal State
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [propTitle, setPropTitle] = useState('')
  const [propCategory, setPropCategory] = useState('Apartment')
  const [propPrice, setPropPrice] = useState('')
  const [propLocation, setPropLocation] = useState('')
  const [propDescription, setPropDescription] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  // Tasks Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProperty, setTaskProperty] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskStaffPhone, setTaskStaffPhone] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [taskDueDate, setTaskDueDate] = useState('')

  // Financial Ledger Form State
  const [transTitle, setTransTitle] = useState('')
  const [transType, setTransType] = useState('Expense')
  const [transCategory, setTransCategory] = useState('Rent')
  const [transAmount, setTransAmount] = useState('')
  const [transDate, setTransDate] = useState('')
  const [transProperty, setTransProperty] = useState('')

  // Upsell Service Form State
  const [serviceName, setServiceName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('Transportation')
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [serviceLocation, setServiceLocation] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [whatsappContact, setWhatsappContact] = useState('')

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

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity))
    } else {
      setSelectedAmenities([...selectedAmenities, amenity])
    }
  }

  const uploadGalleryPhotos = async (files: FileList): Promise<string[]> => {
    setUploading(true)
    const uploadedUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `properties/${fileName}`
      const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(filePath)
        if (data?.publicUrl) uploadedUrls.push(data.publicUrl)
      }
    }
    setUploading(false)
    return uploadedUrls
  }

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let finalImages = [...existingImages]
    if (selectedFiles && selectedFiles.length > 0) {
      const newUrls = await uploadGalleryPhotos(selectedFiles)
      finalImages = [...finalImages, ...newUrls]
    }

    const pgArrayString = `{${selectedAmenities.map(a => `"${a.replace(/"/g, '\\"')}"`).join(',')}}`

    const payload: any = {
      title: propTitle,
      category: propCategory,
      price_per_night: parseFloat(propPrice) || 0,
      location: propLocation,
      description: propDescription,
      images: JSON.stringify(finalImages),
      amenities: pgArrayString
    }

    let res = isAddingNew
      ? await supabase.from('properties').insert([payload])
      : await supabase.from('properties').update(payload).eq('id', editingProperty.id)

    let error = res.error

    if (error) {
      alert('Error saving property: ' + error.message)
    } else {
      setEditingProperty(null)
      setIsAddingNew(false)
      fetchAllData()
    }
    setLoading(false)
  }

  const handleDeleteProperty = async (id: number) => {
    if (!confirm('Delete this property?')) return
    await supabase.from('properties').delete().eq('id', id)
    setEditingProperty(null)
    fetchAllData()
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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('tasks').insert([{
      title: taskTitle, property_name: taskProperty, assignee_name: taskAssignee,
      staff_phone: taskStaffPhone, priority: taskPriority, due_date: taskDueDate, status: 'Pending'
    }])
    setTaskTitle(''); setTaskProperty(''); setTaskAssignee(''); setTaskStaffPhone('')
    fetchAllData()
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('financials').insert([{
      title: transTitle, type: transType, category: transCategory,
      amount: parseFloat(transAmount) || 0, date: transDate || new Date().toISOString().split('T')[0],
      property_name: transProperty
    }])
    setTransTitle(''); setTransAmount(''); setTransProperty('')
    fetchAllData()
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('services').insert([{
      service_name: serviceName, category: serviceCategory, company_name: companyName,
      company_logo: companyLogo, description: serviceDescription, location: serviceLocation,
      price: parseFloat(servicePrice) || 0, whatsapp_contact: whatsappContact
    }])
    setServiceName(''); setCompanyName(''); setCompanyLogo(''); setServiceDescription('')
    setServiceLocation(''); setServicePrice(''); setWhatsappContact('')
    fetchAllData()
  }

  const totalIncome = financials.filter(f => f.type === 'Income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalExpenses = financials.filter(f => f.type === 'Expense').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* PORTAL HEADER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                La Estancia Host Operations Portal
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Centralized PMS: Manage Properties, Bookings, Staff, Finances, and Upsell Services.
              </p>
            </div>
            {activeTab === 'properties' && (
              <button
                onClick={() => {
                  setEditingProperty(null); setIsAddingNew(true); setPropTitle(''); setPropCategory('Apartment');
                  setPropPrice(''); setPropLocation(''); setPropDescription(''); setSelectedAmenities([]); setExistingImages([]); setSelectedFiles(null);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                + Add New Property
              </button>
            )}
          </div>

          {/* TAB BAR */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              📅 Bookings & iCal ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🏠 Properties & Photos ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🧹 Tasks & Staff ({tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'financials' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              💰 Financials & Ledger (${netProfit.toLocaleString()})
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'services' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              ✨ Upsell Services ({services.length})
            </button>
          </div>
        </section>

        {/* 1. BOOKINGS TAB */}
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
                  let parsedProperty = b.property_name || b.property || b.title || 'the requested property'
                  let parsedGuestName = rawNameStr
                  let parsedPhone = b.phone_number || b.phone || b.whatsapp || b.contact || b.guest_phone || b.mobile || ''
                  let parsedDemographic = b.demographics || ''
                  let parsedGuests = b.guest_count || ''
                  let parsedCheckIn = b.check_in || 'N/A'
                  let parsedCheckOut = b.check_out || 'N/A'
                  let parsedNotes = b.special_requests || b.notes || b.message || ''

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
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex-shrink-0 ${
                            isApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-300 space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80">
                          <p>👤 <strong className="text-white">Guest Name:</strong> {parsedGuestName || 'N/A'}</p>
                          <p>💬 <strong className="text-white">WhatsApp:</strong> <span className={cleanPhone ? 'text-emerald-400 font-mono font-bold' : 'text-neutral-500 italic'}>{cleanPhone ? `+${cleanPhone}` : 'Not provided'}</span></p>
                          <p>👥 <strong className="text-amber-400">Demographic:</strong> {parsedDemographic || 'N/A'}</p>
                          <p>👨‍👩‍👧 <strong className="text-white">Guests:</strong> {parsedGuests || 'N/A'}</p>
                          <p>📅 <strong className="text-white">Dates:</strong> {parsedCheckIn} → {parsedCheckOut}</p>
                          
                          <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                            parsedNotes && parsedNotes !== 'None' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold' : 'bg-neutral-900 border-neutral-800 text-neutral-500 italic'
                          }`}>
                            📝 <strong className="text-amber-400">Guest Notes:</strong> {parsedNotes || 'No special requests provided.'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-neutral-800">
                        {/* CLEAN & UNCONGESTED WHATSAPP BUTTON */}
                        <button
                          onClick={() => {
                            let phoneToUse = cleanPhone
                            if (!phoneToUse) {
                              const manual = prompt('Enter guest WhatsApp number (e.g. +256700000000):')
                              if (manual) phoneToUse = manual.replace(/[^0-9]/g, '')
                              else return
                            }
                            const textMsg = encodeURIComponent(
                              `Hello ${parsedGuestName || 'Guest'}! Thank you for reserving ${parsedProperty} with La Estancia. We received your note: "${parsedNotes || 'None'}".`
                            )
                            window.open(`https://api.whatsapp.com/send?phone=${phoneToUse}&text=${textMsg}`, '_blank')
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          💬 Message Guest on WhatsApp
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, isApproved ? 'Pending Host Review' : 'Confirmed')}
                            className="py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 rounded-xl cursor-pointer transition border border-neutral-700"
                          >
                            {isApproved ? '↩︎ Mark Pending' : '✓ Approve Stay'}
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl cursor-pointer transition border border-red-500/20"
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

        {/* 2. PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-white">Managed Properties Catalog</h2>
              <a href="/properties" className="text-xs text-amber-400 font-bold hover:underline">View Public Catalog →</a>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                No properties found. Click "+ Add New Property" above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {properties.map(p => {
                  let imageList: string[] = []
                  let amenitiesList: string[] = []
                  try { imageList = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []) } catch (e) { imageList = [] }
                  try { 
                    if (Array.isArray(p.amenities)) {
                      amenitiesList = p.amenities
                    } else if (typeof p.amenities === 'string') {
                      if (p.amenities.startsWith('{') && p.amenities.endsWith('}')) {
                        amenitiesList = p.amenities.slice(1, -1).split(',').map(s => s.replace(/^"(.*)"$/, '$1').trim()).filter(Boolean)
                      } else if (p.amenities.startsWith('[')) {
                        amenitiesList = JSON.parse(p.amenities)
                      } else {
                        amenitiesList = p.amenities.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }
                  } catch (e) { 
                    amenitiesList = [] 
                  }

                  const mainImg = imageList.length > 0 ? imageList[0] : null
                  const displayPrice = p.price_per_night || p.nightly_price || p.price || 0

                  return (
                    <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="relative h-48 bg-neutral-950">
                          {mainImg ? (
                            <img src={mainImg} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-bold">📷 No Photos</div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            📷 {imageList.length} Photos
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="font-extrabold text-white text-sm line-clamp-1">{p.title}</h3>
                          <p className="text-xs text-neutral-400">📍 {p.location || 'Kampala, Uganda'}</p>
                          <p className="text-xs text-amber-500 font-extrabold">${displayPrice} / night</p>

                          {amenitiesList.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {amenitiesList.slice(0, 3).map((a, i) => (
                                <span key={i} className="text-[9px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md">
                                  ✓ {a}
                                </span>
                              ))}
                              {amenitiesList.length > 3 && (
                                <span className="text-[9px] text-neutral-500 font-bold self-center">+{amenitiesList.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          onClick={() => {
                            setEditingProperty(p); setIsAddingNew(false); setPropTitle(p.title || '');
                            setPropCategory(p.category || 'Apartment'); setPropPrice(String(p.price_per_night || p.price || ''));
                            setPropLocation(p.location || ''); setPropDescription(p.description || '');
                            setSelectedAmenities(amenitiesList); setExistingImages(imageList);
                          }}
                          className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl border border-neutral-700 transition cursor-pointer"
                        >
                          ✏️ Edit Property, Photos & Amenities
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* 3. TASKS TAB */}
        {activeTab === 'tasks' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit">
                <h2 className="text-sm font-extrabold text-white">Dispatch Task</h2>
                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">TASK</label>
                    <input type="text" required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Cleaning & Linens" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">PROPERTY</label>
                    <input type="text" required value={taskProperty} onChange={e => setTaskProperty(e.target.value)} placeholder="Entebbe Villa" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">STAFF</label>
                      <input type="text" required value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} placeholder="John" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">WHATSAPP</label>
                      <input type="text" required value={taskStaffPhone} onChange={e => setTaskStaffPhone(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Add Task</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Active Tasks</h2>
                {tasks.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">No tasks added.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map(t => (
                      <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                        <h3 className="font-extrabold text-white text-sm">{t.title}</h3>
                        <p className="text-xs text-neutral-400">🏠 {t.property_name} • 👤 {t.assignee_name}</p>
                        <button onClick={() => window.open(`https://api.whatsapp.com/send?phone=${(t.staff_phone||'').replace(/[^0-9]/g,'')}&text=Task:%20${t.title}`, '_blank')} className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer">WhatsApp Staff</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 4. FINANCIALS TAB */}
        {activeTab === 'financials' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-bold">Total Income</span>
                <p className="text-2xl font-black text-emerald-400">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-bold">Total Expenses</span>
                <p className="text-2xl font-black text-red-400">${totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-bold">Net Profit</span>
                <p className="text-2xl font-black text-amber-500">${netProfit.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit">
                <h2 className="text-sm font-extrabold text-white">Add Financial Entry</h2>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">TITLE</label>
                    <input type="text" required value={transTitle} onChange={e => setTransTitle(e.target.value)} placeholder="UMEME Token" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">TYPE</label>
                      <select value={transType} onChange={e => setTransType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white cursor-pointer">
                        <option value="Expense">Expense</option>
                        <option value="Income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">CATEGORY</label>
                      <select value={transCategory} onChange={e => setTransCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white cursor-pointer">
                        <option value="Rent">Rent</option>
                        <option value="UMEME">UMEME</option>
                        <option value="Gas">Gas</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">AMOUNT ($)</label>
                      <input type="number" required value={transAmount} onChange={e => setTransAmount(e.target.value)} placeholder="40" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">DATE</label>
                      <input type="date" required value={transDate} onChange={e => setTransDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Save Entry</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Ledger History</h2>
                {financials.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">No entries recorded.</div>
                ) : (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
                    {financials.map(f => (
                      <div key={f.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-xs">{f.title} <span className="text-[10px] text-neutral-400">({f.category})</span></p>
                          <p className="text-[10px] text-neutral-500">{f.date}</p>
                        </div>
                        <span className={`font-black text-sm ${f.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {f.type === 'Income' ? '+' : '-'}${f.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. SERVICES TAB */}
        {activeTab === 'services' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit">
                <h2 className="text-sm font-extrabold text-white">Add Upsell Service</h2>
                <form onSubmit={handleAddService} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">SERVICE TITLE</label>
                    <input type="text" required value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="Airport Pickup" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">COMPANY</label>
                      <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ewright Cabs" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">PRICE ($)</label>
                      <input type="number" required value={servicePrice} onChange={e => setServicePrice(e.target.value)} placeholder="45" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">WHATSAPP CONTACT</label>
                    <input type="text" required value={whatsappContact} onChange={e => setWhatsappContact(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Publish Service</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Active Upsell Services</h2>
                {services.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded