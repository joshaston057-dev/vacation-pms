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

  // STATE FOR CUSTOM TASK FORM INPUTS
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [newPriority, setNewPriority] = useState('High')

  // ACTIVE TASKS STATE
  const [tasks, setTasks] = useState<any[]>([
    { 
      id: 1, 
      title: 'Clean Turnover - Ntinda Apt', 
      priority: 'High', 
      status: 'Pending', 
      assignedTo: 'Sarah (Housekeeping)', 
      phone: '+256780564778',
      due_date: '2026-12-14'
    },
    { 
      id: 2, 
      title: 'Refill Cooking Gas - Munyonyo Mansion', 
      priority: 'Medium', 
      status: 'Pending', 
      assignedTo: 'John (Gas Runner)', 
      phone: '+256726797237',
      due_date: '2026-11-10'
    }
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
    try {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false })

      if (bookingData && bookingData.length > 0) {
        setBookings(bookingData)
      } else {
        setBookings([
          {
            id: 999,
            property_title: '2 bedroom fully furnished Airbnb apartment for rent in Ntinda',
            guest_name: 'Lussy',
            phone: '+256780564778',
            demographic: 'Couple with Kids',
            guests: 2,
            check_in: '2026-11-12',
            check_out: '2026-12-14',
            notes: 'i need a cat',
            total_price: 150,
            paid_amount: 45,
            status: 'Pending'
          }
        ])
      }

      const { data: propertyData } = await supabase.from('properties').select('*').order('id', { ascending: false })
      
      if (propertyData && propertyData.length > 0) {
        setProperties(propertyData)
      } else {
        setProperties([
          { id: 101, title: '2 bedroom fully furnished Airbnb apartment for rent in Ntinda', location: 'Ntinda, Kampala', price: 45, category: 'Apartment', status: 'Active' },
          { id: 102, title: '5 Bedroom Fully Furnished Mansion', location: 'Entebbe', price: 70, category: 'Mansion', status: 'Active' },
          { id: 103, title: '3 Bedroom Luxury Villa for Rent', location: 'Munyonyo', price: 70, category: 'Villa', status: 'Active' },
          { id: 104, title: 'Furnished Short-Stay Studio', location: 'Kisaasi, Kampala', price: 35, category: 'Studio', status: 'Active' }
        ])
      }
    } catch (err) {
      console.error('Portal Data Error:', err)
    } finally {
      setLoading(false)
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
        phone: getVal('Ph') || b.phone || '+256780564778',
        demographic: getVal('Demo') || 'Couple with Kids',
        guestsCount: getVal('Guests') || '2',
        dates: getVal('In') ? `${getVal('In')} → ${getVal('Out')}` : '2026-11-10 → 2026-12-14',
        notes: getVal('Notes') || b.notes || 'i need a cat',
        totalPrice: b.total_price || 150,
        paidAmount: b.paid_amount || 45,
        status: b.status || 'Pending'
      }
    }

    return {
      propertyTitle: b.property_title || '2 bedroom fully furnished Airbnb apartment for rent in Ntinda',
      guestName: rawName,
      phone: b.phone || '+256780564778',
      demographic: b.demographic || 'Couple with Kids',
      guestsCount: b.guests || '2',
      dates: b.check_in ? `${b.check_in} → ${b.check_out}` : '2026-11-10 → 2026-12-14',
      notes: b.notes || 'i need a cat',
      totalPrice: b.total_price || 150,
      paidAmount: b.paid_amount || 45,
      status: b.status || 'Pending'
    }
  }

  const openWhatsApp = (phone: string, guestName: string, property: string, paidAmount: number) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '256780564778'
    const message = encodeURIComponent(
      `Hello ${guestName}, thank you for choosing La Estancia Vacation Homes regarding your stay at [${property}]!\n\n` +
      `To confirm your reservation, please send your deposit of $${paidAmount} (30%) via MTN/Airtel MoMo to +256780564778.`
    )
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank')
  }

  // ADD CUSTOM TASK WITH STAFF WHATSAPP NUMBER
  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle || !newStaffName || !newStaffPhone) {
      alert('Please fill in the task title, staff name, and WhatsApp phone number.')
      return
    }

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      priority: newPriority,
      status: 'Pending',
      assignedTo: newStaffName,
      phone: newStaffPhone,
      due_date: new Date().toISOString().split('T')[0]
    }

    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
    setNewStaffName('')
    setNewStaffPhone('')
  }

  // DISPATCH TASK TO STAFF ON WHATSAPP
  const dispatchSpecialist = (task: any) => {
    const cleanPhone = (task.phone || '').replace(/[^0-9]/g, '')
    const staffName = task.assignedTo || 'Staff Member'

    const message = encodeURIComponent(
      `🛠️ DUTY WORK ORDER - LA ESTANCIA\n\n` +
      `Hello ${staffName},\n\n` +
      `You have been allocated a new task:\n` +
      `📌 Task: ${task.title}\n` +
      `⚡ Priority: ${task.priority}\n\n` +
      `Please reply to confirm receipt and notify once completed!`
    )

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank')
  }

  const deleteTask = (id: number) => {
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
          checkIn: b.check_in || '2026-11-12',
          checkOut: b.check_out || '2026-12-14',
          demographic: parsed.demographic
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
                Centralized PMS: Manage Bookings, Properties, Staff Dispatch, and Financial Ledgers.
              </p>
            </div>
          </div>
        </section>

        <UpsellMotionSlider />

        {/* DASHBOARD CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          {/* TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-4">
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
                            <span className="text-base">👨‍👩‍👧</span>
                            <span className="text-neutral-400 font-semibold">Guests:</span>
                            <span className="font-bold text-neutral-200">{parsed.guestsCount}</span>
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

                        <div className="p-3.5 bg-neutral-900 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                          <span className="text-base">📄</span>
                          <div>
                            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">GUEST NOTES: </span>
                            <span className="text-xs text-neutral-300 font-medium">{parsed.notes}</span>
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
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1"
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
                  <p className="text-xs text-neutral-400">Manage rates, status, and active listings across Entebbe, Munyonyo, and Ntinda.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {properties.map((p) => (
                  <div key={p.id} className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4 shadow-lg hover:border-neutral-700 transition">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          {p.category || 'Short-Stay'}
                        </span>
                        <h4 className="font-black text-white text-base mt-2">{p.title}</h4>
                        <p className="text-xs text-neutral-400 font-medium">📍 {p.location || 'Uganda'}</p>
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
                        <span className="font-black text-amber-400 text-sm">${p.price || p.price_per_night || 45} / night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STAFF TASKS & CUSTOM TASK CREATOR */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              
              {/* ADD CUSTOM TASK FORM */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-white text-lg">➕ Create & Dispatch Custom Task</h3>
                <p className="text-xs text-neutral-400">Assign any duty (cleaning, gas refill, electrical repair) and input your staff member's direct WhatsApp phone number.</p>
                
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
                    placeholder="Staff Name (e.g. John Gas Man)"
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
                    + Add & Save Task
                  </button>
                </form>
              </div>

              {/* EXISTING TASKS LIST */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-white text-lg">Active Staff Duties & Dispatch Queue</h3>
                
                <div className="space-y-3">
                  {tasks.map((t) => (
                    <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                            {t.priority} Priority
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{t.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          👤 Assigned To: <strong className="text-amber-400">{t.assignedTo}</strong> • 💬 WhatsApp: <span className="font-mono text-emerald-400">{t.phone}</span>
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

      <Footer />
    </main>
  )
}