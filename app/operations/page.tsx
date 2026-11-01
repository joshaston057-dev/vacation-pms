'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('bookings')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  
  // Modal & Manual Booking States
  const [editingBooking, setEditingBooking] = useState<any | null>(null)
  
  // Manual Booking Form States
  const [manualGuest, setManualGuest] = useState('')
  const [manualProp, setManualProp] = useState('')
  const [manualCheckIn, setManualCheckIn] = useState('')
  const [manualCheckOut, setManualCheckOut] = useState('')
  const [manualPrice, setManualPrice] = useState('')

  const [services, setServices] = useState([
    { id: '1', category: 'Transportation', name: 'Airport Pickup & Dropoff', price: 45, whatsapp_number: '256757386946' },
    { id: '2', category: 'Dining', name: 'Private Chef Meal Prep', price: 60, whatsapp_number: '256780564778' },
    { id: '3', category: 'Cleaning', name: 'Mid-Stay Deep Cleaning', price: 25, whatsapp_number: '256757386946' },
  ])

  // Form states
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProp, setTaskProp] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskPhone, setTaskPhone] = useState('256757386946')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')

  const [expDesc, setExpDesc] = useState('')
  const [expCategory, setExpCategory] = useState('Rent')
  const [expAmount, setExpAmount] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
      }
    })
    loadData()
  }, [])

  const loadData = async () => {
    const { data: p } = await supabase.from('properties').select('*')
    const { data: b } = await supabase.from('bookings').select('*')
    const { data: t } = await supabase.from('tasks').select('*')
    const { data: e } = await supabase.from('expenses').select('*')

    if (p) setProperties(p)
    if (b) setBookings(b)
    if (t) setTasks(t)
    if (e) setExpenses(e)
  }

  const toggleOccupancy = async (id: string, current: boolean) => {
    const next = !current
    setProperties(properties.map(item => item.id === id ? { ...item, is_occupied: next } : item))
    await supabase.from('properties').update({ is_occupied: next }).eq('id', id)
  }

  const confirmBooking = async (id: string) => {
    setBookings(bookings.map(item => item.id === id ? { ...item, status: 'Confirmed' } : item))
    await supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', id)
  }

  const addManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = {
      id: Date.now().toString(),
      guest_name: manualGuest,
      property_name: manualProp,
      check_in: manualCheckIn,
      check_out: manualCheckOut,
      total_price: parseFloat(manualPrice) || 0,
      status: 'Confirmed'
    }
    setBookings([item, ...bookings])
    await supabase.from('bookings').insert([item])

    setManualGuest('')
    setManualProp('')
    setManualCheckIn('')
    setManualCheckOut('')
    setManualPrice('')
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    setBookings(bookings.filter(item => item.id !== id))
    await supabase.from('bookings').delete().eq('id', id)
  }

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBooking) return

    setBookings(bookings.map(b => b.id === editingBooking.id ? editingBooking : b))
    
    await supabase.from('bookings').update({
      guest_name: editingBooking.guest_name,
      check_in: editingBooking.check_in,
      check_out: editingBooking.check_out,
      total_price: editingBooking.total_price,
      status: editingBooking.status,
    }).eq('id', editingBooking.id)

    setEditingBooking(null)
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = {
      id: Date.now().toString(),
      title: taskTitle,
      property_name: taskProp,
      assigned_to: taskAssignee,
      phone_number: taskPhone,
      due_date: taskDueDate,
      priority: taskPriority,
      status: 'Unfinished'
    }
    setTasks([item, ...tasks])
    await supabase.from('tasks').insert([item])
    setTaskTitle('')
    setTaskProp('')
    setTaskAssignee('')
    setTaskDueDate('')
  }

  const toggleTask = async (id: string, current: string) => {
    const next = current === 'Unfinished' ? 'Finished' : 'Unfinished'
    setTasks(tasks.map(t => t.id === id ? { ...t, status: next } : t))
    await supabase.from('tasks').update({ status: next }).eq('id', id)
  }

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = {
      id: Date.now().toString(),
      description: expDesc,
      category: expCategory,
      amount: parseFloat(expAmount) || 0,
      date: new Date().toISOString().split('T')[0]
    }
    setExpenses([item, ...expenses])
    await supabase.from('expenses').insert([item])
    setExpDesc('')
    setExpAmount('')
  }

  const totalEarned = bookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + (b.total_price || 0), 0)
  const totalBills = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const netIncome = totalEarned - totalBills

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Host Operations Portal</h1>
              <p className="text-xs text-neutral-400 mt-1">Manage listings, bookings, staff tasks, bills, and upsells securely.</p>
            </div>
            <Link href="/properties" className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow">
              Property Catalog
            </Link>
          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
            {[
              { id: 'properties', label: '🏠 Properties & Occupancy' },
              { id: 'bookings', label: '📅 Bookings' },
              { id: 'tasks', label: '🧹 Tasks & Staff' },
              { id: 'financials', label: '💰 Financials & Bills' },
              { id: 'services', label: '✨ Upsell Services' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                  activeTab === tab.id ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => (
                <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-extrabold text-white text-sm">{p.title}</h3>
                    <span className="text-amber-500 font-bold text-xs">${p.price_per_night}/n</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${p.is_occupied ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {p.is_occupied ? '🔴 Occupied' : '🟢 Available'}
                    </span>
                    <button onClick={() => toggleOccupancy(p.id, p.is_occupied)} className="px-3 py-1 bg-neutral-800 text-amber-400 text-xs font-bold rounded-lg cursor-pointer">
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Manual Booking Creation Form */}
              <form onSubmit={addManualBooking} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">+ Add Manual Booking</h3>
                <input type="text" required placeholder="Guest Name" value={manualGuest} onChange={e => setManualGuest(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="Property Name" value={manualProp} onChange={e => setManualProp(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" required value={manualCheckIn} onChange={e => setManualCheckIn(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <input type="date" required value={manualCheckOut} onChange={e => setManualCheckOut(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <input type="number" required placeholder="Agreed / Negotiated Rate ($)" value={manualPrice} onChange={e => setManualPrice(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">
                  Save & Confirm Booking
                </button>
              </form>

              {/* Bookings List */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-sm font-bold text-white">All Reservations</h2>
                {bookings.map(b => (
                  <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm">{b.guest_name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {b.status || 'Pending Host Review'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        📅 {b.check_in} to {b.check_out} {b.property_name ? `| 📍 ${b.property_name}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-amber-500 font-extrabold text-base">${b.total_price}</span>
                      
                      <div className="flex items-center gap-2">
                        {b.status !== 'Confirmed' && (
                          <button onClick={() => confirmBooking(b.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer">
                            Approve
                          </button>
                        )}
                        <button onClick={() => setEditingBooking(b)} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-lg cursor-pointer">
                          Edit / Negotiate Rate
                        </button>
                        <button onClick={() => deleteBooking(b.id)} className="px-2 py-1.5 bg-red-950/50 hover:bg-red-900 text-red-400 text-xs font-bold rounded-lg cursor-pointer">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT & NEGOTIATE RATE MODAL */}
          {editingBooking && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <h3 className="font-extrabold text-white text-base">Edit / Negotiate Booking</h3>
                  <button onClick={() => setEditingBooking(null)} className="text-neutral-400 hover:text-white text-sm">✕</button>
                </div>
                <form onSubmit={handleUpdateBooking} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Guest Name</label>
                    <input 
                      type="text" 
                      value={editingBooking.guest_name || ''} 
                      onChange={e => setEditingBooking({ ...editingBooking, guest_name: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Check In</label>
                      <input 
                        type="date" 
                        value={editingBooking.check_in || ''} 
                        onChange={e => setEditingBooking({ ...editingBooking, check_in: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Check Out</label>
                      <input 
                        type="date" 
                        value={editingBooking.check_out || ''} 
                        onChange={e => setEditingBooking({ ...editingBooking, check_out: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Negotiated Total Price ($)</label>
                    <input 
                      type="number" 
                      value={editingBooking.total_price || ''} 
                      onChange={e => setEditingBooking({ ...editingBooking, total_price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Approval Status</label>
                    <select 
                      value={editingBooking.status || 'Pending'} 
                      onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="Pending Host Review">Pending Host Review</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                    <button type="button" onClick={() => setEditingBooking(null)} className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-amber-500 text-black text-xs font-extrabold rounded-xl cursor-pointer">
                      Save & Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={addTask} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">Assign Task</h3>
                <input type="text" required placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="Property Name" value={taskProp} onChange={e => setTaskProp(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="Staff Name" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="WhatsApp Phone (e.g. 256757386946)" value={taskPhone} onChange={e => setTaskPhone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="date" required value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Add Task</button>
              </form>
              <div className="lg:col-span-2 space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-white text-xs">{t.title} ({t.priority})</h4>
                      <p className="text-xs text-neutral-400">{t.property_name} - Staff: {t.assigned_to}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${t.phone_number}?text=${encodeURIComponent(`Hello ${t.assigned_to}, task update: ${t.title}`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                        💬 WhatsApp
                      </a>
                      <button onClick={() => toggleTask(t.id, t.status)} className="px-3 py-1.5 bg-neutral-800 text-amber-400 text-xs font-bold rounded-lg cursor-pointer">
                        {t.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl"><span className="text-xs text-neutral-400">Revenue</span><h3 className="text-xl font-bold text-emerald-400">${totalEarned}</h3></div>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl"><span className="text-xs text-neutral-400">Bills</span><h3 className="text-xl font-bold text-red-400">${totalBills}</h3></div>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl"><span className="text-xs text-neutral-400">Net</span><h3 className="text-xl font-bold text-amber-400">${netIncome}</h3></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={addExpense} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                  <h3 className="font-extrabold text-amber-500 text-sm">Log Bill</h3>
                  <input type="text" required placeholder="Description (e.g. Rent / Gas)" value={expDesc} onChange={e => setExpDesc(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                    <option value="Rent">Rent</option>
                    <option value="Gas & Utilities">Gas & Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                  <input type="number" required placeholder="Amount ($)" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Log Expense</button>
                </form>
                <div className="lg:col-span-2 space-y-3">
                  {expenses.map(e => (
                    <div key={e.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                      <div><h4 className="font-bold text-white text-xs">{e.description}</h4><span className="text-[10px] text-amber-400">{e.category}</span></div>
                      <span className="text-red-400 font-bold text-xs">-${e.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget as HTMLFormElement
                const cat = (form.elements.namedItem('cat') as HTMLSelectElement).value
                const name = (form.elements.namedItem('name') as HTMLInputElement).value
                const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value) || 0
                const phone = (form.elements.namedItem('phone') as HTMLInputElement).value
                setServices([{ id: Date.now().toString(), category: cat, name, price, whatsapp_number: phone }, ...services])
                form.reset()
              }} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">Add Upsell Service</h3>
                <select name="cat" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                  <option value="Transportation">Transportation</option>
                  <option value="Dining">Dining</option>
                  <option value="Cleaning">Cleaning & Laundry</option>
                  <option value="Tours">Tours & Excursions</option>
                </select>
                <input name="name" type="text" required placeholder="Service Name (e.g. Airport Pickup)" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input name="price" type="number" required placeholder="Price ($)" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input name="phone" type="text" required defaultValue="256757386946" placeholder="WhatsApp Phone" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">
                  + Add Service
                </button>
              </form>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                {services.map(s => (
                  <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{s.category}</span>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-amber-500 font-bold text-xs">${s.price}</p>
                    <a href={`https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(`Booking service: ${s.name}`)}`} target="_blank" rel="noopener noreferrer" className="block text-center py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                      💬 WhatsApp Service
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  )
}