'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  location: string
  price_per_night: number
  is_occupied: boolean
  image_urls?: string[]
}

interface Booking {
  id: string
  guest_name: string
  property_name: string
  check_in: string
  check_out: string
  total_price: number
  status: 'Pending' | 'Confirmed' | 'Cancelled'
}

interface Task {
  id: string
  title: string
  property_name: string
  assigned_to: string
  phone_number: string
  status: 'Unfinished' | 'Finished'
  due_date: string
  priority: 'Low' | 'Medium' | 'High'
}

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
}

interface UpsellService {
  id: string
  category: string
  name: string
  price: number
  whatsapp_number: string
}

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'financials' | 'services'>('properties')
  const [bookingTab, setBookingTab] = useState<'Pending' | 'Confirmed'>('Pending')

  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [services, setServices] = useState<UpsellService[]>([
    { id: '1', category: 'Transportation', name: 'Airport Pickup & Dropoff', price: 45, whatsapp_number: '256757386946' },
    { id: '2', category: 'Dining', name: 'Private Chef Meal Prep', price: 60, whatsapp_number: '256780564778' },
    { id: '3', category: 'Cleaning', name: 'Mid-Stay Deep Cleaning & Linen Change', price: 25, whatsapp_number: '256757386946' },
  ])

  const [loading, setLoading] = useState(true)

  // Forms
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProp, setTaskProp] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskPhone, setTaskPhone] = useState('256757386946')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')

  const [expDesc, setExpDesc] = useState('')
  const [expCategory, setExpCategory] = useState('Rent')
  const [expAmount, setExpAmount] = useState('')

  const [serviceCat, setServiceCat] = useState('Transportation')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [servicePhone, setServicePhone] = useState('256757386946')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)

    const { data: propData } = await supabase.from('properties').select('*')
    const { data: bookData } = await supabase.from('bookings').select('*')
    const { data: taskData } = await supabase.from('tasks').select('*')
    const { data: expData } = await supabase.from('expenses').select('*')

    if (propData) setProperties(propData)
    if (bookData) setBookings(bookData)
    if (taskData) setTasks(taskData)
    if (expData) setExpenses(expData)

    setLoading(false)
  }

  // --- PROPERTY OCCUPANCY TOGGLE ---
  const handleToggleOccupancy = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    setProperties(properties.map(p => p.id === id ? { ...p, is_occupied: nextStatus } : p))
    await supabase.from('properties').update({ is_occupied: nextStatus }).eq('id', id)
  }

  // --- BOOKING STATUS CONFIRMATION ---
  const handleConfirmBooking = async (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b))
    await supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', id)
  }

  // --- TASK CREATION & STATUS TOGGLE ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      property_name: taskProp,
      assigned_to: taskAssignee,
      phone_number: taskPhone,
      due_date: taskDueDate,
      priority: taskPriority,
      status: 'Unfinished',
    }
    setTasks([newTask, ...tasks])
    await supabase.from('tasks').insert([newTask])

    setTaskTitle('')
    setTaskProp('')
    setTaskAssignee('')
    setTaskDueDate('')
  }

  const handleToggleTaskStatus = async (id: string, currentStatus: 'Unfinished' | 'Finished') => {
    const nextStatus = currentStatus === 'Unfinished' ? 'Finished' : 'Unfinished'
    setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t))
    await supabase.from('tasks').update({ status: nextStatus }).eq('id', id)
  }

  // --- EXPENSE ENTRY ---
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const newExp: Expense = {
      id: Date.now().toString(),
      description: expDesc,
      category: expCategory,
      amount: parseFloat(expAmount) || 0,
      date: new Date().toISOString().split('T')[0],
    }
    setExpenses([newExp, ...expenses])
    await supabase.from('expenses').insert([newExp])

    setExpDesc('')
    setExpAmount('')
  }

  // --- ADD UPSELL SERVICE ---
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()
    const newService: UpsellService = {
      id: Date.now().toString(),
      category: serviceCat,
      name: serviceName,
      price: parseFloat(servicePrice) || 0,
      whatsapp_number: servicePhone,
    }
    setServices([newService, ...services])
    setServiceName('')
    setServicePrice('')
  }

  // Calculations
  const totalEarned = bookings
    .filter((b) => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0)

  const totalBills = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const netRevenue = totalEarned - totalBills

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Host Operations Portal</h1>
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[10px] rounded-full uppercase">
                  La Estancia
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">Manage listings, guest bookings, operational staff, finances, and upsell services.</p>
            </div>

            <Link
              href="/properties"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition"
            >
              + Public Property Catalog
            </Link>
          </div>

          {/* PORTAL MAIN TABS */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
            {[
              { key: 'properties', label: '🏠 Properties & Occupancy' },
              { key: 'bookings', label: '📅 Bookings' },
              { key: 'tasks', label: '🧹 Tasks & Staff' },
              { key: 'financials', label: '💰 Financials & Bills' },
              { key: 'services', label: '✨ Upsell Services' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-black shadow-lg'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROPERTIES HUB & OCCUPANCY TOGGLE */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Property Occupancy Dashboard</h2>
                <button onClick={fetchAllData} className="text-xs text-amber-500 font-bold">↻ Refresh</button>
              </div>

              {properties.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-6">No properties found. Add properties to manage occupancy.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((prop) => (
                    <div key={prop.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-white text-sm">{prop.title}</h3>
                        <span className="text-amber-500 font-bold text-xs">${prop.price_per_night}/night</span>
                      </div>
                      <p className="text-xs text-neutral-400">📍 {prop.location}</p>

                      <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                          prop.is_occupied
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {prop.is_occupied ? '🔴 Occupied' : '🟢 Available'}
                        </span>

                        <button
                          onClick={() => handleToggleOccupancy(prop.id, prop.is_occupied)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl border border-neutral-700 transition cursor-pointer"
                        >
                          Toggle Occupancy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOKINGS (PENDING VS CONFIRMED) */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex gap-3 border-b border-neutral-800 pb-2">
                <button
                  onClick={() => setBookingTab('Pending')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    bookingTab === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-neutral-400'
                  }`}
                >
                  Pending Requests ({bookings.filter((b) => b.status === 'Pending').length})
                </button>
                <button
                  onClick={() => setBookingTab('Confirmed')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    bookingTab === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-neutral-400'
                  }`}
                >
                  Confirmed Reservations ({bookings.filter((b) => b.status === 'Confirmed').length})
                </button>
              </div>

              <div className="space-y-3">
                {bookings.filter((b) => b.status === bookingTab).length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-6">No {bookingTab.toLowerCase()} bookings found.</p>
                ) : (
                  bookings
                    .filter((b) => b.status === bookingTab)
                    .map((b) => (
                      <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{b.guest_name}</h4>
                          <p className="text-xs text-neutral-400">🏡 {b.property_name}</p>
                          <p className="text-[11px] text-neutral-500">Dates: {b.check_in} ➔ {b.check_out}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-amber-500 font-extrabold text-sm">${b.total_price}</span>
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleConfirmBooking(b.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
                            >
                              ✓ Confirm Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS & STAFF WITH WHATSAPP LINK */}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TASK CREATION */}
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">Assign Housekeeping Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Task Title (e.g. Linen Cleaning)"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Property Name"
                    value={taskProp}
                    onChange={(e) => setTaskProp(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Staff Performer Name"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Staff WhatsApp Phone (e.g. 256757386946)"
                    value={taskPhone}
                    onChange={(e) => setTaskPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">
                    + Assign Task
                  </button>
                </form>
              </div>

              {/* TASK LIST */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-extrabold text-white text-sm">Operational Task Queue</h3>
                {tasks.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-6">No operational tasks assigned.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs">{task.title}</span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            task.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">🏡 {task.property_name} • Staff: {task.assigned_to}</p>
                        <p className="text-[10px] text-neutral-500">Due: {task.due_date}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* DIRECT WHATSAPP LINK TO STAFF */}
                        <a
                          href={`https://wa.me/${task.phone_number}?text=${encodeURIComponent(`Hello ${task.assigned_to}, update on task: ${task.title} for ${task.property_name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow"
                        >
                          💬 Text Performer
                        </a>

                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`px-3 py-1.5 font-extrabold text-xs rounded-xl transition ${
                            task.status === 'Finished'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-amber-400 border border-neutral-700'
                          }`}
                        >
                          {task.status === 'Finished' ? '✓ Finished' : '⌛ Unfinished'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIALS & HOST BILLS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* FINANCIAL SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                  <span className="text-xs text-neutral-400">Total Revenue (Confirmed)</span>
                  <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">${totalEarned.toLocaleString()}</h3>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                  <span className="text-xs text-neutral-400">Total Host Bills & Expenses</span>
                  <h3 className="text-2xl font-extrabold text-red-400 mt-1">${totalBills.toLocaleString()}</h3>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                  <span className="text-xs text-neutral-400">Net Host Income</span>
                  <h3 className="text-2xl font-extrabold text-amber-400 mt-1">${netRevenue.toLocaleString()}</h3>
                </div>
              </div>

              {/* LOG HOST BILLS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4 h-fit">
                  <h3 className="font-extrabold text-amber-500 text-sm">Log Host Bill / Expense</h3>
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Description (e.g. Monthly Rent / Gas)"
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="Rent">Rent</option>
                      <option value="Gas & Utilities">Gas & Utilities</option>
                      <option value="Cleaning & Supplies">Cleaning & Supplies</option>
                      <option value="Internet & Wifi">Internet & Wifi</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                    <input
                      type="number"
                      required
                      placeholder="Amount ($)"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />
                    <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">
                      + Log Expense
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-extrabold text-white text-sm">Expense Ledger</h3>
                  {expenses.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic py-6">No host expenses logged.</p>
                  ) : (
                    expenses.map((exp) => (
                      <div key={exp.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-white text-xs">{exp.description}</h4>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{exp.category}</span>
                        </div>
                        <span className="text-red-400 font-extrabold text-xs">-${exp.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UPSELL SERVICES HUB */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">Add Upsell Guest Service</h3>
                <form onSubmit={handleAddService} className="space-y-3">
                  <select
                    value={serviceCat}
                    onChange={(e) => setServiceCat(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Dining">Dining</option>
                    <option value="Cleaning">Cleaning & Laundry</option>
                    <option value="Tours & Excursions">Tours & Excursions</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Service Name (e.g. Airport Pickup)"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Price ($)"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="WhatsApp Contact (e.g. 256757386946)"
                    value={servicePhone}
                    onChange={(e) => setServicePhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                  />
                  <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer">
                    + Add Guest Service
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-extrabold text-white text-sm">Active Guest Upsell Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                          {s.category}
                        </span>
                        <h4 className="font-extrabold text-white text-sm mt-2">{s.name}</h4>
                        <p className="text-amber-500 font-extrabold text-xs mt-1">${s.price}</p>
                      </div>

                      {/* WHATSAPP LINK FOR GUEST SERVICE */}
                      <a
                        href={`https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(`Hello, I want to book the service: ${s.name} ($${s.price})`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow"
                      >
                        💬 Book Service via WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}