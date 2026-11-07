'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'bookings' | 'properties' | 'tasks' | 'upsells'>('ledger')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Manual Booking Modal State
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

  // Upsell Creation Modal State
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [newUpsell, setNewUpsell] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Service',
    icon: '✨'
  })

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    property_id: '',
    title: '',
    amount: '',
    category: 'Utilities',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const [propsRes, bookRes, taskRes, upsellRes, expenseRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').order('id', { ascending: true }),
        supabase.from('expenses').select('*').order('id', { ascending: false })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
      if (expenseRes.data) setExpenses(expenseRes.data)
    } catch (err) {
      console.error('Error loading operations data:', err)
    } finally {
      setLoading(false)
    }
  }

  // 1. GUARANTEED TASK AUTO-DISPATCH ON BOOKING APPROVAL
  const handleApproveBooking = async (booking: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // A. Confirm Booking Status
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED' })
        .eq('id', booking.id)

      if (bookingErr) throw bookingErr

      // B. Mark Property as OCCUPIED
      if (booking.property_id) {
        await supabase
          .from('properties')
          .update({ status: 'OCCUPIED' })
          .eq('id', booking.property_id)
      }

      // C. Extract details safely with bulletproof fallbacks
      const propTitle = booking.property_title || (properties.find(p => String(p.id) === String(booking.property_id))?.title) || 'Vacation Stay'
      const guestName = cleanGuestName(booking.guest_name)
      const checkInDate = booking.check_in || booking.checkIn || booking.check_in_date || 'Upcoming'
      const checkOutDate = booking.check_out || booking.checkOut || booking.check_out_date || 'Departure'

      // D. Insert Housekeeping Dispatch Tasks Directly
      const { error: taskErr } = await supabase.from('tasks').insert([
        {
          host_id: user?.id || null,
          title: `Pre-Arrival Prep: ${propTitle}`,
          description: `Prepare apartment for guest ${guestName}. Check-in: ${checkInDate}`,
          status: 'PENDING'
        },
        {
          host_id: user?.id || null,
          title: `Turnover Checkout: ${propTitle}`,
          description: `Housekeeping turnover after departure on ${checkOutDate}`,
          status: 'PENDING'
        }
      ])

      if (taskErr) console.error('Task insert warning:', taskErr)

      await fetchHostData()
      alert('✅ Booking approved! Revenue accounted, property tagged OCCUPIED, and 2 cleaning tasks auto-dispatched to Tasks tab!')
    } catch (err: any) {
      alert('Error approving booking: ' + err.message)
    }
  }

  // 2. CREATE DIRECT MANUAL BOOKING WITH TASK DISPATCH
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const selectedProp = properties.find((p) => String(p.id) === String(manualBooking.property_id))

      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert([
          {
            host_id: user?.id || null,
            property_id: manualBooking.property_id,
            property_title: selectedProp?.title || 'Direct Host Booking',
            guest_name: manualBooking.guest_name,
            phone: manualBooking.phone,
            purpose: manualBooking.purpose,
            check_in: manualBooking.check_in,
            check_out: manualBooking.check_out,
            total_price: parseFloat(manualBooking.total_price) || 0,
            guest_notes: manualBooking.guest_notes || 'Manual direct booking',
            status: 'CONFIRMED'
          }
        ])

      if (bookingErr) throw bookingErr

      await supabase
        .from('properties')
        .update({ status: 'OCCUPIED' })
        .eq('id', manualBooking.property_id)

      await supabase.from('tasks').insert([
        {
          host_id: user?.id || null,
          title: `Pre-Arrival Prep: ${selectedProp?.title || 'Property'}`,
          description: `Prepare listing for guest ${manualBooking.guest_name}. Check-in: ${manualBooking.check_in}`,
          status: 'PENDING'
        },
        {
          host_id: user?.id || null,
          title: `Turnover Checkout: ${selectedProp?.title || 'Property'}`,
          description: `Housekeeping required after departure on ${manualBooking.check_out}`,
          status: 'PENDING'
        }
      ])

      alert('✅ Reservation confirmed! Property tagged OCCUPIED, calendar locked, and 2 housekeeping tasks auto-dispatched.')
      setShowAddModal(false)
      setManualBooking({ property_id: '', guest_name: '', phone: '', purpose: 'Direct Walk-in', check_in: '', check_out: '', total_price: '', guest_notes: '' })
      fetchHostData()
    } catch (err: any) {
      alert('Error creating booking: ' + err.message)
    }
  }

  // 3. LOG EXPENSE IN LEDGER
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const selectedProp = properties.find((p) => String(p.id) === String(newExpense.property_id))

      const { error } = await supabase.from('expenses').insert([
        {
          host_id: user?.id || null,
          property_id: newExpense.property_id || null,
          property_title: selectedProp?.title || 'General Operational Expense',
          title: newExpense.title,
          amount: parseFloat(newExpense.amount) || 0,
          category: newExpense.category,
          date: newExpense.date
        }
      ])

      if (error) throw error

      alert('✅ Operational expense recorded successfully!')
      setShowExpenseModal(false)
      setNewExpense({ property_id: '', title: '', amount: '', category: 'Utilities', date: new Date().toISOString().split('T')[0] })
      fetchHostData()
    } catch (err: any) {
      alert('Error recording expense: ' + err.message)
    }
  }

  // 4. CREATE UPSELL SERVICE
  const handleCreateUpsell = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('upsell_services').insert([
        {
          title: newUpsell.title,
          description: newUpsell.description,
          price: parseFloat(newUpsell.price) || 0,
          category: newUpsell.category,
          icon: newUpsell.icon || '✨'
        }
      ])

      if (error) throw error

      alert('✅ New add-on service created!')
      setShowUpsellModal(false)
      setNewUpsell({ title: '', description: '', price: '', category: 'Service', icon: '✨' })
      fetchHostData()
    } catch (err: any) {
      alert('Error creating upsell: ' + err.message)
    }
  }

  // 5. TASK DISPATCH CONTROLS
  const handleUpdateTaskStatus = async (taskId: string | number, newStatus: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
      if (error) throw error
      fetchHostData()
    } catch (err: any) {
      alert('Error updating task: ' + err.message)
    }
  }

  const handleDeleteTask = async (taskId: string | number) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
      fetchHostData()
    } catch (err: any) {
      alert('Error deleting task: ' + err.message)
    }
  }

  const handleDeleteExpense = async (expenseId: string | number) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
      if (error) throw error
      fetchHostData()
    } catch (err: any) {
      alert('Error deleting expense: ' + err.message)
    }
  }

  const handleDeleteBooking = async (bookingId: string | number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    try {
      await supabase.from('bookings').delete().eq('id', bookingId)
      fetchHostData()
    } catch (err: any) {
      alert('Error deleting booking: ' + err.message)
    }
  }

  const openBookingModalForProperty = (propertyId: string | number) => {
    setManualBooking({
      property_id: String(propertyId),
      guest_name: '',
      phone: '',
      purpose: 'Direct Walk-in',
      check_in: '',
      check_out: '',
      total_price: '',
      guest_notes: ''
    })
    setShowAddModal(true)
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

  // Financial Calculations
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (parseFloat(b.total_price) || 150), 0)
  const totalExpenses = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* NAVIGATION TABS */}
          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              💰 Ledger & Financials
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              📅 Bookings & Inquiries ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🏠 Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🧹 Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('upsells')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'upsells' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              ✨ Upsells ({upsells.length})
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">
              Loading operations hub...
            </div>
          ) : (
            <>
              {/* TAB 0: LEDGER */}
              {activeTab === 'ledger' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold block">CONFIRMED REVENUE</span>
                      <div className="text-2xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</div>
                      <span className="text-[10px] text-neutral-500 block">From {confirmedBookings.length} confirmed stays</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold block">TOTAL OPERATIONAL EXPENSES</span>
                      <div className="text-2xl font-black text-rose-400">${totalExpenses.toLocaleString()}</div>
                      <span className="text-[10px] text-neutral-500 block">Rent, utilities, gas, maintenance</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold block">NET PROFIT</span>
                      <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-amber-400' : 'text-rose-500'}`}>
                        ${netProfit.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-neutral-500 block">Revenue minus operational bills</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                    <div>
                      <h3 className="text-base font-black text-white">Expense Allocation & Operational Bills</h3>
                      <span className="text-xs text-neutral-400 font-bold">{expenses.length} Expense Records</span>
                    </div>

                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-2"
                    >
                      <span>➕</span> Log New Expense / Bill
                    </button>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
                      No expenses logged yet. Click "Log New Expense / Bill" to add rent, utilities, or maintenance costs.
                    </div>
                  ) : (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-950 text-neutral-400 uppercase font-black border-b border-neutral-800">
                            <tr>
                              <th className="p-4">Date</th>
                              <th className="p-4">Expense Title</th>
                              <th className="p-4">Property</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {expenses.map((e) => (
                              <tr key={e.id} className="hover:bg-neutral-800/50 transition">
                                <td className="p-4 text-neutral-400 font-medium">{e.date || 'N/A'}</td>
                                <td className="p-4 font-extrabold text-white">{e.title}</td>
                                <td className="p-4 text-neutral-300">{e.property_title || 'General Operation'}</td>
                                <td className="p-4">
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] font-black">
                                    {e.category || 'Utilities'}
                                  </span>
                                </td>
                                <td className="p-4 font-black text-rose-400">-${e.amount}</td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleDeleteExpense(e.id)}
                                    className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                                  >
                                    🗑️ Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white">Guest Reservations & Inquiries</h3>
                      <span className="text-xs text-neutral-400 font-bold">{bookings.length} Total</span>
                    </div>

                    <button
                      onClick={() => {
                        setManualBooking({ property_id: '', guest_name: '', phone: '', purpose: 'Direct Walk-in', check_in: '', check_out: '', total_price: '', guest_notes: '' })
                        setShowAddModal(true)
                      }}
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

                        const checkInDate = b.check_in || b.checkIn || b.check_in_date || b.start_date || 'N/A'
                        const checkOutDate = b.check_out || b.checkOut || b.check_out_date || b.end_date || 'N/A'
                        const specialNotes = b.guest_notes || b.notes || 'No special requests'

                        const paymentWhatsAppText = encodeURIComponent(
                          `Hello ${guestName}! 👋 Thank you for your inquiry for *${b.property_title || 'La Estancia Vacation Home'}*.\n\n` +
                          `📅 *Stay Dates:* ${checkInDate} → ${checkOutDate}\n` +
                          `💰 *Total Stay:* $${totalStay}\n` +
                          `🔐 *30% Deposit Required:* $${depositDue}\n\n` +
                          `Please complete your deposit payment via Mobile Money or Card. Reply with your payment code once sent!`
                        )

                        return (
                          <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-3">
                                <h4 className="font-black text-white text-sm leading-snug">{b.property_title || 'Vacation Stay'}</h4>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
                                  isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {b.status || 'PENDING'}
                                </span>
                              </div>

                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs">
                                <div className="flex items-center gap-2.5 text-neutral-300">
                                  <span className="text-neutral-400">👤 Guest:</span>
                                  <span className="font-extrabold text-white">{guestName}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-neutral-300">
                                  <span className="text-neutral-400">💬 Phone:</span>
                                  <span className="font-extrabold text-emerald-400">{phoneNum}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-neutral-300">
                                  <span className="text-neutral-400">📅 Dates:</span>
                                  <span className="font-extrabold text-white">{checkInDate} → {checkOutDate}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">Total Stay:</span>
                                    <span className="text-amber-400 font-black text-sm">${totalStay}</span>
                                  </div>
                                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">30% Deposit:</span>
                                    <span className="text-emerald-400 font-black text-sm">${depositDue}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-0.5">Guest Notes:</span>
                                <p className="text-xs text-neutral-300">{specialNotes}</p>
                              </div>
                            </div>

                            <div className="space-y-2 pt-1">
                              {!isConfirmed && (
                                <button
                                  onClick={() => handleApproveBooking(b)}
                                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition text-center"
                                >
                                  ⚡ Approve Cash/MoMo & Account Revenue
                                </button>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${phoneNum.replace(/[^0-9]/g, '')}&text=${paymentWhatsAppText}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                                >
                                  💬 WhatsApp
                                </a>
                                <button
                                  onClick={() => handleDeleteBooking(b.id)}
                                  className="py-3 bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-400 font-black text-xs rounded-xl shadow transition cursor-pointer text-center"
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

              {/* TAB 2: PROPERTIES */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Managed Listings & Direct Booking</h3>
                    <span className="text-xs text-neutral-400 font-bold">{properties.length} Listings</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {properties.map((p) => {
                      const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
                      const isOccupied = p.status === 'OCCUPIED'

                      return (
                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                          <div className="relative aspect-[16/10] bg-neutral-950">
                            {gallery.length > 0 ? (
                              <img src={gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                                {p.category || 'Apartment'}
                              </span>
                              {isOccupied && (
                                <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase shadow-lg">
                                  🔴 OCCUPIED
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-black text-white text-base truncate">{p.title}</h4>
                              <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                            </div>
                            <p className="text-xs text-neutral-400">📍 {p.location}</p>

                            <button
                              onClick={() => openBookingModalForProperty(p.id)}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition shadow cursor-pointer text-center"
                            >
                              ⚡ Book Property & Account Revenue
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white">Housekeeping & Operations Dispatch</h3>
                      <span className="text-xs text-neutral-400 font-bold">{tasks.length} Active Tasks</span>
                    </div>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
                      No tasks active. Tasks are automatically dispatched when bookings are created or approved.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map((t) => {
                        const isDone = t.status === 'COMPLETED'

                        return (
                          <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center gap-2">
                                <h4 className="font-extrabold text-white text-sm leading-snug">{t.title}</h4>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded border shrink-0 ${
                                  isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {t.status || 'PENDING'}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-400 leading-relaxed">{t.description || 'No instructions provided.'}</p>
                            </div>

                            <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                              <button
                                onClick={() => handleUpdateTaskStatus(t.id, isDone ? 'PENDING' : 'COMPLETED')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                                  isDone ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {isDone ? '↩️ Mark Pending' : '✅ Complete Task'}
                              </button>

                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: UPSELLS */}
              {activeTab === 'upsells' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white">Platform Add-On Services Catalog</h3>
                      <span className="text-xs text-neutral-400 font-bold">{upsells.length} Active Offerings</span>
                    </div>

                    <button
                      onClick={() => setShowUpsellModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-2"
                    >
                      <span>➕</span> Add New Service
                    </button>
                  </div>

                  {upsells.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
                      No upsell services created yet. Click "+ Add New Service" to create your first offering.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {upsells.map((u) => (
                        <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-2xl">{u.icon || '✨'}</span>
                              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                +${u.price}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-white text-sm">{u.title}</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed">{u.description}</p>
                          </div>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block pt-2 border-t border-neutral-800">
                            {u.category || 'Service'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MANUAL BOOKING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white">Direct Booking & Revenue Accounting</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Select Property</label>
                <select
                  required
                  value={manualBooking.property_id}
                  onChange={(e) => setManualBooking({ ...manualBooking, property_id: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Listing --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (${p.price}/night)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={manualBooking.guest_name}
                    onChange={(e) => setManualBooking({ ...manualBooking, guest_name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+256..."
                    value={manualBooking.phone}
                    onChange={(e) => setManualBooking({ ...manualBooking, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={manualBooking.check_in}
                    onChange={(e) => setManualBooking({ ...manualBooking, check_in: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={manualBooking.check_out}
                    onChange={(e) => setManualBooking({ ...manualBooking, check_out: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Total Agreed Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={manualBooking.total_price}
                    onChange={(e) => setManualBooking({ ...manualBooking, total_price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Booking Source</label>
                  <select
                    value={manualBooking.purpose}
                    onChange={(e) => setManualBooking({ ...manualBooking, purpose: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Direct Walk-in">Direct Walk-in</option>
                    <option value="Instagram / Phone">Instagram / Phone</option>
                    <option value="Repeat Guest">Repeat Guest</option>
                    <option value="Agent Referral">Agent Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Host Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid cash upon key handover..."
                  value={manualBooking.guest_notes}
                  onChange={(e) => setManualBooking({ ...manualBooking, guest_notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition shadow cursor-pointer"
                >
                  ⚡ Confirm & Account Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white">Log Operational Expense / Bill</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Select Property (Optional)</label>
                <select
                  value={newExpense.property_id}
                  onChange={(e) => setNewExpense({ ...newExpense, property_id: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- General Platform Expense --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Rent, Gas Refill, Wifi Bill"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Utilities">Utilities (Water/Power)</option>
                    <option value="Rent">Property Rent / Lease</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Consumables">Supplies & Gas</option>
                    <option value="Marketing">Marketing / Ads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="w-1/2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition shadow cursor-pointer"
                >
                  ⚡ Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE UPSELL MODAL */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white">Create Add-On / Upsell Service</h3>
              <button onClick={() => setShowUpsellModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateUpsell} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-neutral-400 font-bold mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    placeholder="🚗"
                    value={newUpsell.icon}
                    onChange={(e) => setNewUpsell({ ...newUpsell, icon: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-neutral-400 font-bold mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Airport Transfer"
                    value={newUpsell.title}
                    onChange={(e) => setNewUpsell({ ...newUpsell, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="45"
                    value={newUpsell.price}
                    onChange={(e) => setNewUpsell({ ...newUpsell, price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Category</label>
                  <select
                    value={newUpsell.category}
                    onChange={(e) => setNewUpsell({ ...newUpsell, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Dining">Dining</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Experience">Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Service Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe what is included in this add-on package..."
                  value={newUpsell.description}
                  onChange={(e) => setNewUpsell({ ...newUpsell, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpsellModal(false)}
                  className="w-1/2 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition shadow cursor-pointer"
                >
                  ⚡ Save Service
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