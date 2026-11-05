'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import UpsellMotionSlider from '../components/UpsellMotionSlider'
import { supabase } from '@/lib/supabase'

export default function HostOperationsPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'properties' | 'tasks' | 'ledger'>('properties')
  
  // HOST BUSINESS BRANDING
  const [businessName, setBusinessName] = useState('Vacation Homes Agency')
  const [isEditingBrand, setIsEditingBrand] = useState(false)

  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ADD PROPERTY MODAL STATES
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)
  const [propTitle, setPropTitle] = useState('')
  const [propCategory, setPropCategory] = useState('Apartment')
  const [propLocation, setPropLocation] = useState('')
  const [propPrice, setPropPrice] = useState('')
  const [propSubmitting, setPropSubmitting] = useState(false)

  // CUSTOM TASK INPUT STATES
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

      if (!user) {
        setLoading(false)
        return
      }

      // 1. Fetch custom business name from public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.business_name) {
        setBusinessName(profile.business_name)
      }

      // 2. Fetch ONLY bookings assigned to THIS host ID
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', user.id)
        .order('id', { ascending: false })

      if (bookingData) setBookings(bookingData)

      // 3. Fetch ONLY properties belonging to THIS host ID
      const { data: propertyData } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', user.id)
        .order('id', { ascending: false })
      
      if (propertyData) setProperties(propertyData)

      // 4. Fetch tasks belonging to THIS host ID
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('host_id', user.id)
        .order('id', { ascending: false })

      if (taskData) setTasks(taskData)

    } catch (err) {
      console.error('Portal Data Isolation Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // CREATE NEW PROPERTY WORKFLOW
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propTitle || !propLocation || !propPrice) {
      alert('Please fill in all property fields.')
      return
    }

    setPropSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Authentication error. Please log in again.')
        return
      }

      const newProperty = {
        title: propTitle,
        category: propCategory,
        location: propLocation,
        price: parseFloat(propPrice),
        status: 'Active',
        host_id: user.id
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
      setShowAddPropertyModal(false)
      alert(`🎉 Property "${propTitle}" added successfully!`)
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

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, business_name: businessName })

      if (error) throw error

      setIsEditingBrand(false)
      alert(`✅ Business Name updated to "${businessName}"!`)
    } catch (err: any) {
      alert('Error updating business name: ' + err.message)
    }
  }

  const parseBookingData = (b: any) => {
    let rawName = b.guest_name || b.name || 'Guest'
    
    if (rawName.includes('Prop:')) {
      const getVal = (label: string) => {
        const parts = rawName.split('|')
        const found = parts.find((p: string) => p.includes(label))
        return found ? found.split(':')[1]?.trim() : ''
      }
      return {
        propertyTitle: getVal('Prop') || 'Property Stay',
        guestName: getVal('Guest') || 'Guest',
        phone: getVal('Ph') || b.phone || '',
        demographic: getVal('Demo') || 'Guest Stay',
        guestsCount: getVal('Guests') || '1',
        dates: getVal('In') ? `${getVal('In')} → ${getVal('Out')}` : 'Stay Dates',
        notes: getVal('Notes') || b.notes || 'No extra notes',
        totalPrice: b.total_price || 0,
        paidAmount: b.paid_amount || 0,
        status: b.status || 'Pending'
      }
    }

    return {
      propertyTitle: b.property_title || 'Property Reservation',
      guestName: rawName,
      phone: b.phone || '',
      demographic: b.demographic || 'Guest Stay',
      guestsCount: b.guests || 1,
      dates: b.check_in ? `${b.check_in} → ${b.check_out}` : 'Stay Dates',
      notes: b.notes || 'No extra notes',
      totalPrice: b.total_price || 0,
      paidAmount: b.paid_amount || 0,
      status: b.status || 'Pending'
    }
  }

  const openWhatsApp = (phone: string, guestName: string, property: string, paidAmount: number) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : ''
    const message = encodeURIComponent(
      `Hello ${guestName}, thank you for choosing ${businessName} regarding your stay at [${property}]!\n\n` +
      `To confirm your reservation, please send your deposit of $${paidAmount} (30%) via Mobile Money / Transfer.`
    )
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank')
  }

  const dispatchSpecialist = (task: any) => {
    const cleanPhone = (task.phone || '').replace(/[^0-9]/g, '')
    const staffName = task.assignedTo || task.assigned_to || 'Staff Member'

    const message = encodeURIComponent(
      `🛠️ DUTY WORK ORDER - ${businessName.toUpperCase()}\n\n` +
      `Hello ${staffName},\n\n` +
      `You have been allocated a new duty:\n` +
      `📌 Task: ${task.title}\n` +
      `⚡ Priority: ${task.priority}\n\n` +
      `Please reply to confirm receipt and notify once completed!`
    )

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank')
  }

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle || !newStaffName || !newStaffPhone) {
      alert('Please fill in task title, staff name, and phone number.')
      return
    }

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

  const deleteTask = async (id: number) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleApproveBooking = async (b: any) => {
    const parsed = parseBookingData(b)
    
    try {
      const response = await fetch('/api/approve-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: b.id,
          amountPaid: parsed.paidAmount,
          paymentMethod: 'MoMo / Cash',
          guestName: parsed.guestName,
          phone: parsed.phone,
          propertyTitle: parsed.propertyTitle,
          checkIn: b.check_in,
          checkOut: b.check_out,
          demographic: parsed.demographic,
          businessName: businessName
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(`✅ Payment Approved! Access Door Code: ${result.doorCode}\nProperty status updated to OCCUPIED!`)
        window.open(result.whatsappUrl, '_blank')
        fetchPortalData()
      } else {
        alert('Approval error: ' + result.error)
      }
    } catch (err) {
      alert('Network error while executing booking approval.')
    }
  }

  const togglePropertyStatus = async (propId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Occupied' ? 'Active' : 'Occupied'
    await supabase.from('properties').update({ status: nextStatus }).eq('id', propId)
    setProperties(properties.map(p => p.id === propId ? { ...p, status: nextStatus } : p))
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return
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

        {/* PORTAL HEADER & BRANDING CONTROL */}
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
                  ✏️ Edit Business Name
                </button>
              </div>

              {isEditingBrand && (
                <div className="mt-3 flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-3 rounded-xl max-w-md">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Ewright Furnished Apartments"
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 rounded-lg w-full focus:outline-none focus:border-amber-500 font-bold"
                  />
                  <button
                    onClick={handleSaveBusinessName}
                    className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2 rounded-lg shadow whitespace-nowrap cursor-pointer"
                  >
                    Save Brand
                  </button>
                </div>
              )}

              <p className="text-xs text-neutral-400 mt-1">
                Centralized PMS: Manage Bookings, Properties, Staff Dispatch, and Financial Ledgers under <strong className="text-amber-400">{businessName}</strong>.
              </p>
            </div>
          </div>
        </section>

        <UpsellMotionSlider />

        {/* DASHBOARD CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          {/* TABS HEADER WITH PERMANENT ADD PROPERTY BUTTON */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                📅 Bookings ({bookings.length})
              </button>

              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🏠 Properties ({properties.length})
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🧹 Staff Tasks ({tasks.length})
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                💰 Financial Ledger ({bills.length})
              </button>
            </div>

            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              ➕ Add New Property
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
                  No reservation requests submitted for {businessName} yet.
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900 pb-4">
                          <h4 className="font-black text-white text-base sm:text-lg tracking-tight truncate max-w-xl">
                            [{parsed.propertyTitle}]
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase self-start sm:self-auto ${
                            parsed.status === 'Confirmed' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                          }`}>
                            {parsed.status}
                          </span>
                        </div>

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
                            <span className="text-base">📅</span>
                            <span className="text-neutral-400 font-semibold">Dates:</span>
                            <span className="font-bold text-neutral-200">{parsed.dates}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-800/80 mt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg">
                              <span className="text-neutral-400 text-xs font-semibold">Total Stay:</span>
                              <span className="font-black text-amber-400 text-xs">${parsed.totalPrice}</span>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                              <span className="text-emerald-400 text-xs font-semibold">30% Deposit Due:</span>
                              <span className="font-black text-emerald-400 text-xs">${parsed.paidAmount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                          <button
                            onClick={() => handleApproveBooking(b)}
                            className="py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            ⚡ Approve Cash / MoMo
                          </button>

                          <button
                            onClick={() => openWhatsApp(parsed.phone, parsed.guestName, parsed.propertyTitle, parsed.paidAmount)}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            💬 WhatsApp
                          </button>

                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 font-bold text-xs rounded-xl border border-rose-900/50 transition cursor-pointer flex items-center justify-center gap-1"
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

          {/* TAB 2: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Property Listings Portfolio</h3>
                  <p className="text-xs text-neutral-400">Manage rates, status, and active listings.</p>
                </div>
              </div>

              {loading ? (
                <p className="text-xs text-neutral-500 animate-pulse">Loading property portfolio...</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                  {properties.map((p) => (
                    <div key={p.id} className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4 shadow-lg hover:border-neutral-700 transition relative">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            {p.category || 'Short-Stay'}
                          </span>
                          <h4 className="font-black text-white text-base mt-2">{p.title}</h4>
                          <p className="text-xs text-neutral-400 font-medium">📍 {p.location}</p>
                        </div>

                        <button
                          onClick={() => togglePropertyStatus(p.id, p.status || 'Active')}
                          className={`px-3 py-1 font-extrabold text-[10px] rounded-full uppercase border transition cursor-pointer ${
                            p.status === 'Occupied' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          }`}
                        >
                          ● {p.status || 'Active'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-900 text-xs">
                        <div>
                          <span className="text-neutral-500 font-medium">Nightly Rate: </span>
                          <span className="font-black text-amber-400 text-sm">${p.price || p.price_per_night} / night</span>
                        </div>

                        <button
                          onClick={() => deleteProperty(p.id)}
                          className="text-xs text-rose-500 hover:text-rose-400 font-bold px-2 py-1 rounded bg-rose-950/30 border border-rose-900/40 cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STAFF TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-white text-lg">➕ Create & Dispatch Custom Task</h3>
                <form onSubmit={handleAddCustomTask} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Task Title (e.g. Refill Gas Cylinder)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />

                  <input
                    type="text"
                    placeholder="Staff Name (e.g. John Gas Runner)"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />

                  <input
                    type="text"
                    placeholder="WhatsApp Phone (+2567...)"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-3 rounded-xl shadow-lg transition cursor-pointer"
                  >
                    + Add Task
                  </button>
                </form>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-white text-lg">Active Staff Duties & Dispatch Queue</h3>
                
                <div className="space-y-3">
                  {tasks.map((t) => (
                    <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                            {t.priority || 'High'} Priority
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{t.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          👤 Assigned To: <strong className="text-amber-400">{t.assignedTo || t.assigned_to}</strong> • 💬 WhatsApp: <span className="font-mono text-emerald-400">{t.phone}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatchSpecialist(t)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-lg"
                        >
                          💬 Dispatch on WhatsApp
                        </button>
                        
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="px-3 py-2.5 bg-rose-950/50 text-rose-400 text-xs font-bold rounded-xl border border-rose-900/50 hover:bg-rose-900/50 transition cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* MODAL: ADD NEW PROPERTY */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-black text-white">➕ Add New Property</h3>
              <button
                onClick={() => setShowAddPropertyModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Property Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Entebbe Lakeview Mansion"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Category</label>
                <select
                  value={propCategory}
                  onChange={(e) => setPropCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Apartment">1-Bedroom Apartment</option>
                  <option value="House">Stand-Alone House</option>
                  <option value="Mansion">Luxury Mansion</option>
                  <option value="Villa">Villa / Resort</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Location / City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Entebbe, Uganda or London, UK"
                  value={propLocation}
                  onChange={(e) => setPropLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Nightly Price ($ USD)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 85"
                  value={propPrice}
                  onChange={(e) => setPropPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={propSubmitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-xl shadow cursor-pointer"
                >
                  {propSubmitting ? 'Saving Property...' : 'Save & Publish Listing'}
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