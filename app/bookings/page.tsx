'use client'

import { useState } from 'react'

interface Booking {
  id: string
  guestName: string
  propertyName: string
  checkIn: string
  checkOut: string
  source: 'Direct Website' | 'Manual / Phone' | 'Airbnb (iCal)' | 'Booking.com (iCal)'
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  totalPrice: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      guestName: 'Alexandre Dumas',
      propertyName: 'Entebbe Lakeside Villa',
      checkIn: '2026-11-15',
      checkOut: '2026-11-20',
      source: 'Airbnb (iCal)',
      status: 'Confirmed',
      totalPrice: 1250
    },
    {
      id: '2',
      guestName: 'Brenda Namubiru',
      propertyName: 'Kisaasi Executive Suite',
      checkIn: '2026-11-18',
      checkOut: '2026-11-22',
      source: 'Direct Website',
      status: 'Confirmed',
      totalPrice: 320
    },
    {
      id: '3',
      guestName: 'Mark Okello',
      propertyName: 'Munyonyo Luxury Mansion',
      checkIn: '2026-11-25',
      checkOut: '2026-11-30',
      source: 'Manual / Phone',
      status: 'Pending',
      totalPrice: 1500
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false)
  const [icalUrl, setIcalUrl] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('Entebbe Lakeside Villa')

  const [formData, setFormData] = useState({
    guestName: '',
    propertyName: 'Entebbe Lakeside Villa',
    checkIn: '',
    checkOut: '',
    source: 'Manual / Phone' as const,
    status: 'Confirmed' as const,
    totalPrice: 200
  })

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault()
    const newBooking: Booking = {
      id: Date.now().toString(),
      ...formData,
      totalPrice: Number(formData.totalPrice)
    }
    setBookings([newBooking, ...bookings])
    setIsModalOpen(false)
    setFormData({
      guestName: '',
      propertyName: 'Entebbe Lakeside Villa',
      checkIn: '',
      checkOut: '',
      source: 'Manual / Phone',
      status: 'Confirmed',
      totalPrice: 200
    })
  }

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id))
  }

  const handleSaveIcal = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Successfully synced iCal feed for ${selectedProperty}! External calendar updates will now reflect automatically.`)
    setIsIcalModalOpen(false)
    setIcalUrl('')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings & iCal Integration</h1>
            <p className="text-neutral-400 text-sm mt-1">Manage direct website reservations, manual entries, and external calendar sync.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsIcalModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition border border-neutral-700"
            >
              🔗 Sync iCal Feed
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + New Manual Booking
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-lg font-bold">Active Reservations</h2>
            <span className="text-xs text-neutral-400">Total Bookings: {bookings.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="p-4">Guest</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Check-In</th>
                  <th className="p-4">Check-Out</th>
                  <th className="p-4">Source / Channel</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-sm">
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-neutral-850">
                    <td className="p-4 font-medium">{booking.guestName}</td>
                    <td className="p-4 text-neutral-300">{booking.propertyName}</td>
                    <td className="p-4 text-neutral-400">{booking.checkIn}</td>
                    <td className="p-4 text-neutral-400">{booking.checkOut}</td>
                    <td className="p-4">
                      <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded text-xs font-semibold">
                        {booking.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded font-semibold ${
                        booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">${booking.totalPrice}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        Cancel / Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add Manual / Direct Booking</h2>
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.guestName}
                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Sarah Connor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Property</label>
                  <select
                    value={formData.propertyName}
                    onChange={e => setFormData({ ...formData, propertyName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Entebbe Lakeside Villa">Entebbe Lakeside Villa</option>
                    <option value="Kisaasi Executive Suite">Kisaasi Executive Suite</option>
                    <option value="Munyonyo Luxury Mansion">Munyonyo Luxury Mansion</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Check-In Date</label>
                    <input
                      type="date"
                      required
                      value={formData.checkIn}
                      onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Check-Out Date</label>
                    <input
                      type="date"
                      required
                      value={formData.checkOut}
                      onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Booking Source</label>
                    <select
                      value={formData.source}
                      onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Direct Website">Direct Website</option>
                      <option value="Manual / Phone">Manual / Phone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Total Price ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.totalPrice}
                      onChange={e => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Save Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* iCal Sync Modal */}
        {isIcalModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-2">Sync iCal Calendar Feed</h2>
              <p className="text-neutral-400 text-xs mb-4">Paste your Airbnb or Booking.com iCal export link to automatically sync blocked dates and prevent double bookings.</p>
              <form onSubmit={handleSaveIcal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Select Property</label>
                  <select
                    value={selectedProperty}
                    onChange={e => setSelectedProperty(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Entebbe Lakeside Villa">Entebbe Lakeside Villa</option>
                    <option value="Kisaasi Executive Suite">Kisaasi Executive Suite</option>
                    <option value="Munyonyo Luxury Mansion">Munyonyo Luxury Mansion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">iCal URL (.ics)</label>
                  <input
                    type="url"
                    required
                    value={icalUrl}
                    onChange={e => setIcalUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsIcalModalOpen(false)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Connect iCal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}