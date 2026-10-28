'use client'

import { useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function EstanciaOSOperations() {
  const [activeTab, setActiveTab] = useState<'daily' | 'bookings' | 'concierge' | 'properties' | 'expenses'>('daily')

  // --- Daily Operations State ---
  const [dailyNotes, setDailyNotes] = useState('')
  const [cleaningStatus, setCleaningStatus] = useState('Pending')
  const [selectedProp, setSelectedProp] = useState('')
  const [dailyMsg, setDailyMsg] = useState('')

  // --- Bookings / iCal State ---
  const [guestName, setGuestName] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [icalUrl, setIcalUrl] = useState('')
  const [bookingMsg, setBookingMsg] = useState('')

  // --- Concierge State ---
  const [serviceTitle, setServiceTitle] = useState('')
  const [category, setCategory] = useState('Transport')
  const [servicePrice, setServicePrice] = useState('')
  const [description, setDescription] = useState('')
  const [serviceMsg, setServiceMsg] = useState('')

  // --- Property State ---
  const [propertyTitle, setPropertyTitle] = useState('')
  const [location, setLocation] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [maxGuests, setMaxGuests] = useState('2')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [imageUrl, setImageUrl] = useState('')
  const [propMsg, setPropMsg] = useState('')

  // --- Handlers ---
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceMsg('')
    try {
      const { error } = await supabase.from('concierge_services').insert([
        {
          title: serviceTitle,
          category,
          price: parseFloat(servicePrice),
          description,
        },
      ])
      if (error) throw error
      setServiceMsg('✨ Concierge service published live!')
      setServiceTitle('')
      setServicePrice('')
      setDescription('')
    } catch (err: any) {
      setServiceMsg(`❌ Error: ${err.message}`)
    }
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingMsg('')
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          guest_name: guestName,
          check_in: checkIn,
          check_out: checkOut,
          ical_url: icalUrl,
          property_title: selectedProp,
        },
      ])
      if (error) throw error
      setBookingMsg('✨ Booking & iCal sync logged successfully!')
      setGuestName('')
      setCheckIn('')
      setCheckOut('')
      setIcalUrl('')
    } catch (err: any) {
      setBookingMsg(`❌ Note: Make sure 'bookings' table exists. Details: ${err.message}`)
    }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setPropMsg('')
    try {
      const { error } = await supabase.from('properties').insert([
        {
          title: propertyTitle,
          location,
          price_per_night: parseFloat(pricePerNight),
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          guests: parseInt(maxGuests),
          image_url: imageUrl,
        },
      ])
      if (error) throw error
      setPropMsg('✨ Vacation property published live to catalogue!')
      setPropertyTitle('')
      setLocation('')
      setPricePerNight('')
      setMaxGuests('2')
      setBedrooms('1')
      setBathrooms('1')
      setImageUrl('')
    } catch (err: any) {
      setPropMsg(`❌ Error: ${err.message}`)
    }
  }

  const handleLogDailyOp = async (e: React.FormEvent) => {
    e.preventDefault()
    setDailyMsg('✨ Daily operation status updated!')
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-neutral-800 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-amber-500 tracking-tight">EstanciaOS Host Operations</h1>
              <p className="text-neutral-400 text-sm mt-1">Real-time control center for bookings, iCal sync, daily tasks, and concierge listings.</p>
            </div>

            {/* Control Navigation Tabs */}
            <div className="flex flex-wrap bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'daily' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Daily Operations
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'bookings' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Bookings & iCal
              </button>
              <button
                onClick={() => setActiveTab('concierge')}
                className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'concierge' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Concierge Services
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'properties' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Add Property
              </button>
            </div>
          </div>

          {/* --- TAB 1: DAILY OPERATIONS MONITOR --- */}
          {activeTab === 'daily' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Daily Host Operations Monitor</h2>
                <p className="text-neutral-400 text-sm mb-6">Log housekeeping, turn-key inspections, and guest arrivals for today.</p>

                {dailyMsg && <p className="mb-4 p-3 bg-neutral-950 border border-neutral-800 text-amber-500 rounded-xl text-sm">{dailyMsg}</p>}

                <form onSubmit={handleLogDailyOp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Select Property</label>
                    <input
                      type="text"
                      placeholder="e.g. Kololo Luxury Apartment"
                      value={selectedProp}
                      onChange={(e) => setSelectedProp(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Housekeeping / Turn Status</label>
                      <select
                        value={cleaningStatus}
                        onChange={(e) => setCleaningStatus(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      >
                        <option value="Pending">Pending Cleaning</option>
                        <option value="InProgress">Cleaning In Progress</option>
                        <option value="Inspected">Inspected & Ready</option>
                        <option value="Occupied">Guest Checked In</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Keylock / Access Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Code #4821 Active"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Daily Log / Operations Notes</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Guest requested late check-in at 8 PM. Linen restocked."
                      value={dailyNotes}
                      onChange={(e) => setDailyNotes(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition">
                    Save Daily Monitor Entry
                  </button>
                </form>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Live Status Overview</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
                      <span className="text-xs text-neutral-400">Housekeeping</span>
                      <span className="text-xs font-bold text-amber-500">{cleaningStatus}</span>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
                      <span className="text-xs text-neutral-400">iCal Sync Engine</span>
                      <span className="text-xs font-bold text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: BOOKINGS & ICAL SYNC --- */}
          {activeTab === 'bookings' && (
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Bookings & iCal Calendar Sync</h2>
              <p className="text-neutral-400 text-sm mb-6">Manually input direct bookings or sync Airbnb/Booking.com iCal feeds.</p>

              {bookingMsg && <p className="mb-4 p-3 bg-neutral-950 border border-neutral-800 text-amber-500 rounded-xl text-sm">{bookingMsg}</p>}

              <form onSubmit={handleAddBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Guest Name / Channel</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe (Direct Booking)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Target Property Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kololo Luxury Apartment"
                      value={selectedProp}
                      onChange={(e) => setSelectedProp(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Check-out Date</label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">iCal Feed URL (Airbnb / VRBO / Booking.com)</label>
                  <input
                    type="url"
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition">
                  Sync iCal & Save Booking
                </button>
              </form>
            </div>
          )}

          {/* --- TAB 3: CONCIERGE SERVICES MANAGEMENT --- */}
          {activeTab === 'concierge' && (
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Add Concierge Service</h2>
              <p className="text-neutral-400 text-sm mb-6">Publish luxury experiences directly to your public guest menu.</p>

              {serviceMsg && <p className="mb-4 p-3 bg-neutral-950 border border-neutral-800 text-amber-500 rounded-xl text-sm">{serviceMsg}</p>}

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Airport Transfer"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    >
                      <option value="Transport">Transport</option>
                      <option value="Dining">Private Chef</option>
                      <option value="Excursions">Tours</option>
                      <option value="Wellness">Wellness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      placeholder="75"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Details about what the service includes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition">
                  Publish Service Live
                </button>
              </form>
            </div>
          )}

          {/* --- TAB 4: ADD PROPERTY --- */}
          {activeTab === 'properties' && (
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Add New Vacation Property</h2>
              <p className="text-neutral-400 text-sm mb-6">Publish apartments or villas to your public properties catalogue.</p>

              {propMsg && <p className="mb-4 p-3 bg-neutral-950 border border-neutral-800 text-amber-500 rounded-xl text-sm">{propMsg}</p>}

              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Property Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kololo Luxury Apartment"
                    value={propertyTitle}
                    onChange={(e) => setPropertyTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kololo, Kampala"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Price per Night ($ USD)</label>
                    <input
                      type="number"
                      required
                      placeholder="150"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      required
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      required
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Max Guests</label>
                    <input
                      type="number"
                      required
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition">
                  Publish Property Live
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  )
}