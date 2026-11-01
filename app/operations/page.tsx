'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('properties')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  
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
    // Security check: Redirect to login if unauthenticated
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
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Guest Reservations</h2>
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-white text-xs">{b.guest_name} ({b.status})</h4>
                      <p className="text-xs text-neutral-400">{b.property_name} | {b.check_in} to {b.check_out}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-extrabold text-xs">${b.total_price}</span>
                      {b.status === 'Pending' && (
                        <button onClick={() => confirmBooking(b.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer">
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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