'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Booking {
  id: string
  guest_name: string
  guest_phone?: string
  property_title: string
  check_in: string
  check_out: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at?: string
}

export default function BookingsPage() {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  // New Booking Form state
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [propertyTitle, setPropertyTitle] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [status, setStatus] = useState<'pending' | 'confirmed'>('confirmed')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === 'estancia2026') {
      setIsAuthenticated(true)
      setErrorMsg('')
      fetchBookings()
    } else {
      setErrorMsg('Invalid passcode. Access denied.')
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error.message)
    } else if (data) {
      setBookings(data)
    }
    setLoading(false)
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          guest_name: guestName,
          guest_phone: guestPhone,
          property_title: propertyTitle,
          check_in: checkIn,
          check_out: checkOut,
          total_price: parseFloat(totalPrice) || 0,
          status: status
        }
      ])

      if (error) throw error

      alert('Booking recorded successfully!')
      setGuestName('')
      setGuestPhone('')
      setPropertyTitle('')
      setCheckIn('')
      setCheckOut('')
      setTotalPrice('')
      fetchBookings()
    } catch (err: any) {
      alert(`Error recording booking: ${err.message}`)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', id)
    fetchBookings()
  }

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking record?')) return
    await supabase.from('bookings').delete().eq('id', id)
    fetchBookings()
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h1 className="text-2xl font-bold text-amber-500 mb-2">Host OS Bookings</h1>
            <p className="text-sm text-neutral-400 mb-6">Enter your administrative passcode to manage reservations and guest records.</p>
            
            <input 
              type="password" 
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg mb-4 text-white focus:outline-none focus:border-amber-500"
            />
            
            {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}
            
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition">
              Unlock Portal
            </button>
          </form>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-neutral-800">
            <div>
              <h1 className="text-3xl font-extrabold text-amber-500">Reservations & Bookings</h1>
              <p className="text-neutral-400 text-sm mt-1">Track guest check-ins, direct WhatsApp reservations, and revenue status.</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="mt-4 md:mt-0 px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white rounded-lg text-sm"
            >
              🔒 Lock Portal
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* RECORD NEW BOOKING FORM */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl lg:col-span-1">
              <h2 className="text-xl font-bold text-white mb-4">Log New Booking</h2>
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Guest Name</label>
                  <input required type="text" placeholder="e.g. Sarah Jenkins" value={guestName} onChange={e=>setGuestName(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">WhatsApp / Phone</label>
                  <input type="text" placeholder="+256..." value={guestPhone} onChange={e=>setGuestPhone(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Property Booked</label>
                  <input required type="text" placeholder="e.g. Kololo Luxury Villa" value={propertyTitle} onChange={e=>setPropertyTitle(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Check-In</label>
                    <input required type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Check-Out</label>
                    <input required type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Total Price ($)</label>
                    <input required type="number" placeholder="450" value={totalPrice} onChange={e=>setTotalPrice(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Status</label>
                    <select value={status} onChange={e=>setStatus(e.target.value as any)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white">
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition">
                  Save Reservation
                </button>
              </form>
            </div>

            {/* RESERVATIONS LIST TABLE */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-4">Master Reservations Table</h2>
              {loading ? (
                <p className="text-xs text-neutral-400 animate-pulse">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl">
                  <p className="text-neutral-400 text-sm">No reservations recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="text-xs uppercase bg-neutral-950 text-neutral-500">
                      <tr>
                        <th className="p-3">Guest</th>
                        <th className="p-3">Property</th>
                        <th className="p-3">Dates</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} className="border-b border-neutral-800">
                          <td className="p-3 font-semibold text-white">
                            {b.guest_name}
                            {b.guest_phone && <span className="block text-xs font-normal text-neutral-500">{b.guest_phone}</span>}
                          </td>
                          <td className="p-3">{b.property_title}</td>
                          <td className="p-3 text-xs">{b.check_in} to {b.check_out}</td>
                          <td className="p-3 font-semibold text-amber-500">${b.total_price}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            {b.status === 'pending' && (
                              <button onClick={() => handleStatusUpdate(b.id, 'confirmed')} className="text-xs text-green-400 hover:underline">Confirm</button>
                            )}
                            <button onClick={() => handleDeleteBooking(b.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}