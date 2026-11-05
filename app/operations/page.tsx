'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import UpsellMotionSlider from '../components/UpsellMotionSlider'
import { supabase } from '@/lib/supabase'

export default function HostOperationsPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'properties' | 'tasks' | 'ledger'>('properties')
  
  const [businessName, setBusinessName] = useState('La Estancia Vacation Homes')
  const [isEditingBrand, setIsEditingBrand] = useState(false)

  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ADD PROPERTY MODAL & MULTI-FILE STATES
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)
  const [propTitle, setPropTitle] = useState('')
  const [propCategory, setPropCategory] = useState('Apartment')
  const [propLocation, setPropLocation] = useState('')
  const [propPrice, setPropPrice] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [propSubmitting, setPropSubmitting] = useState(false)

  // TASK STATES
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [newPriority, setNewPriority] = useState('High')

  useEffect(() => {
    fetchPortalData()
  }, [])

  const fetchPortalData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Fetch profile business name if exists
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.business_name) {
          setBusinessName(profile.business_name)
        }
      }

      // 2. Fetch all properties (unrestricted for single test account)
      const { data: propertyData } = await supabase
        .from('properties')
        .select('*')
        .order('id', { ascending: false })
      
      if (propertyData) setProperties(propertyData)

      // 3. Fetch all bookings
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false })

      if (bookingData) setBookings(bookingData)

      // 4. Fetch all tasks
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: false })

      if (taskData) setTasks(taskData)

    } catch (err) {
      console.error('Portal Data Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
      const previews = filesArray.map((file) => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propTitle || !propLocation || !propPrice) {
      alert('Please fill in all property fields.')
      return
    }

    setPropSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uploadedUrls: string[] = []

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${user?.id || 'host'}/${Date.now()}_${i}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file)

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName)
            
            uploadedUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      const leadCoverImage = uploadedUrls.length > 0 ? uploadedUrls[0] : ''

      const newProperty = {
        title: propTitle,
        category: propCategory,
        location: propLocation,
        price: parseFloat(propPrice),
        image_url: leadCoverImage,
        images: uploadedUrls,
        status: 'Active',
        host_id: user?.id || null
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([newProperty])
        .select()

      if (error) throw error

      if (data) {
        setProperties([data[0], ...properties])
      }

      setPropTitle('')
      setPropLocation('')
      setPropPrice('')
      setSelectedFiles([])
      setImagePreviews([])
      setShowAddPropertyModal(false)
      alert(`🎉 Property "${propTitle}" published successfully!`)
    } catch (err: any) {
      alert('Error creating property: ' + err.message)
    } finally {
      setPropSubmitting(false)
    }
  }

  const handleSaveBusinessName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('profiles').upsert({ id: user.id, business_name: businessName })
      setIsEditingBrand(false)
      alert(`✅ Business Name updated!`)
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const parseBookingData = (b: any) => {
    return {
      propertyTitle: b.property_title || 'Property Stay',
      guestName: b.guest_name || 'Guest',
      phone: b.phone || '',
      demographic: b.demographic || 'Guest Stay',
      dates: b.check_in ? `${b.check_in} → ${b.check_out}` : 'Stay Dates',
      totalPrice: b.total_price || 0,
      paidAmount: b.paid_amount || 0,
      status: b.status || 'Pending'
    }
  }

  const openWhatsApp = (phone: string, guestName: string, property: string, paidAmount: number) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : ''
    const message = encodeURIComponent(
      `Hello ${guestName}, thank you for choosing ${businessName} regarding your stay at [${property}]!\n\n` +
      `To confirm your reservation, please send your deposit of $${paidAmount} (30%).`
    )
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank')
  }

  const dispatchSpecialist = (task: any) => {
    const cleanPhone = (task.phone || '').replace(/[^0-9]/g, '')
    const message = encodeURIComponent(
      `🛠️ DUTY WORK ORDER - ${businessName.toUpperCase()}\n\n` +
      `Hello ${task.assignedTo || 'Staff'},\n\nTask: ${task.title}\nPriority: ${task.priority}`
    )
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank')
  }

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle || !newStaffName || !newStaffPhone) return

    const { data: { user } } = await supabase.auth.getUser()
    const newTask = {
      title: newTaskTitle,
      priority: newPriority,
      status: 'Pending',
      assignedTo: newStaffName,
      phone: newStaffPhone,
      host_id: user?.id || null,
      due_date: new Date().toISOString().split('T')[0]
    }

    await supabase.from('tasks').insert([newTask])
    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
    setNewStaffName('')
    setNewStaffPhone('')
  }

  const togglePropertyStatus = async (propId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Occupied' ? 'Active' : 'Occupied'
    await supabase.from('properties').update({ status: nextStatus }).eq('id', propId)
    setProperties(properties.map(p => p.id === propId ? { ...p, status: nextStatus } : p))
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('Delete this property?')) return
    await supabase.from('properties').delete().eq('id', id)
    setProperties(properties.filter(p => p.id !== id))
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {businessName} Operations
                </h1>
                <button
                  onClick={() => setIsEditingBrand(!isEditingBrand)}
                  className="text-xs bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-amber-400 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  ✏️ Edit Brand
                </button>
              </div>

              {isEditingBrand && (
                <div className="mt-3 flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-3 rounded-xl max-w-md">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 rounded-lg w-full font-bold focus:outline-none"
                  />
                  <button
                    onClick={handleSaveBusinessName}
                    className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <UpsellMotionSlider />

        {/* DASHBOARD CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          {/* TAB NAVIGATION & SINGLE ADD PROPERTY BUTTON */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                🏠 Properties ({properties.length})
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                📅 Bookings ({bookings.length})
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                🧹 Tasks ({tasks.length})
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                💰 Financial Ledger
              </button>
            </div>

            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              ➕ Add New Property
            </button>
          </div>

          {/* TAB: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-neutral-800 pb-4">
                <h3 className="font-extrabold text-white text-lg">Property Portfolio</h3>
                <p className="text-xs text-neutral-400">Manage rates, status, and active listings.</p>
              </div>

              {loading ? (
                <p className="text-xs text-neutral-500 animate-pulse">Loading properties...</p>
              ) : properties.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs font-bold space-y-3">
                  <p>No properties added yet.</p>
                  <button
                    onClick={() => setShowAddPropertyModal(true)}
                    className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    + Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {properties.map((p) => {
                    const gallery = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : [])

                    return (
                      <div key={p.id} className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4 shadow-lg relative overflow-hidden">
                        {gallery.length > 0 && (
                          <div className="relative">
                            <img 
                              src={gallery[0]} 
                              alt={p.title} 
                              className="w-full h-44 object-cover rounded-xl border border-neutral-800"
                            />
                            <span className="absolute top-2 left-2 bg-black/70 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-500/40">
                              ⭐ Lead Cover
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                              {p.category || 'Apartment'}
                            </span>
                            <h4 className="font-black text-white text-base mt-2">{p.title}</h4>
                            <p className="text-xs text-neutral-400 font-medium">📍 {p.location}</p>
                          </div>

                          <button
                            onClick={() => togglePropertyStatus(p.id, p.status || 'Active')}
                            className={`px-3 py-1 font-extrabold text-[10px] rounded-full uppercase border cursor-pointer ${
                              p.status === 'Occupied' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            ● {p.status || 'Active'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-neutral-900 text-xs">
                          <span className="font-black text-amber-400 text-sm">${p.price || 50} / night</span>
                          <button
                            onClick={() => deleteProperty(p.id)}
                            className="text-xs text-rose-500 font-bold px-2 py-1 rounded bg-rose-950/30 cursor-pointer"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="font-extrabold text-white text-lg">Guest Reservations</h3>
              
              {bookings.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs font-bold">
                  No reservation requests yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => {
                    const parsed = parseBookingData(b)
                    return (
                      <div key={b.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-white">{parsed.propertyTitle}</h4>
                          <span className="text-xs font-extrabold text-amber-400">{parsed.status}</span>
                        </div>
                        <p className="text-xs text-neutral-300">👤 {parsed.guestName} | 💬 {parsed.phone} | 📅 {parsed.dates}</p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => openWhatsApp(parsed.phone, parsed.guestName, parsed.propertyTitle, parsed.paidAmount)}
                            className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            💬 WhatsApp Guest
                          </button>
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="px-3 py-2 bg-rose-950 text-rose-400 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-white text-lg">➕ Dispatch Staff Task</h3>
                <form onSubmit={handleAddCustomTask} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Task Title (e.g. Clean & Refill)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Staff Name & Phone"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none"
                  />
                  <button type="submit" className="bg-amber-500 text-black font-extrabold text-xs py-3 rounded-xl cursor-pointer">
                    + Add & Dispatch
                  </button>
                </form>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-extrabold text-white text-lg">Active Tasks</h3>
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.title}</h4>
                      <p className="text-xs text-neutral-400">Assigned: {t.assignedTo}</p>
                    </div>
                    <button
                      onClick={() => dispatchSpecialist(t)}
                      className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-white text-lg">Financial Ledger & Bills</h3>
              <p className="text-xs text-neutral-400">Track operating expenses, rent, and utility bills here.</p>
            </div>
          )}

        </section>
      </div>

      {/* ADD PROPERTY MODAL */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-black text-white">➕ Add New Property</h3>
              <button onClick={() => setShowAddPropertyModal(false)} className="text-neutral-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kisaasi Luxury Apartment"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Category</label>
                <select
                  value={propCategory}
                  onChange={(e) => setPropCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl font-bold focus:outline-none"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">Stand-Alone House</option>
                  <option value="Mansion">Luxury Mansion</option>
                  <option value="Villa">Villa / Resort</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kisaasi, Kampala"
                  value={propLocation}
                  onChange={(e) => setPropLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Nightly Price ($ USD)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45"
                  value={propPrice}
                  onChange={(e) => setPropPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl font-bold text-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Gallery Photos (Select Multiple)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 px-3 py-2 rounded-xl cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black"
                />

                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt="Preview" className={`w-full h-20 object-cover rounded-lg border ${idx === 0 ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-neutral-800'}`} />
                        {idx === 0 && <span className="absolute bottom-1 left-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded">LEAD</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPropertyModal(false)} className="px-4 py-2.5 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={propSubmitting} className="px-5 py-2.5 bg-amber-500 text-black text-xs font-extrabold rounded-xl cursor-pointer">
                  {propSubmitting ? 'Publishing...' : 'Save & Publish Listing'}
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