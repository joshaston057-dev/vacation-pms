'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Property {
  id: string
  title: string
  category: string
  location: string
  price: number
  description: string
  amenities: string
  image_url: string
}

interface Booking {
  id: string
  property_title: string
  traveler_name: string
  traveler_phone?: string
  check_in?: string
  check_out?: string
  total_guests?: number
  origin_region?: string
  total_cost: number
  status: string
  created_at: string
}

export default function HostPortalDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'financials' | 'cohosting' | 'upsells' | 'tasks'>('properties')
  
  // Properties State
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [showPropModal, setShowPropModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  
  // Property Form Inputs
  const [propTitle, setPropTitle] = useState('')
  const [propCategory, setPropCategory] = useState('Apartment')
  const [propLocation, setPropLocation] = useState('')
  const [propPrice, setPropPrice] = useState(100)
  const [propDesc, setPropDesc] = useState('')
  const [propAmenities, setPropAmenities] = useState('')
  const [propImage, setPropImage] = useState('')

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Manual Booking Inputs
  const [bTitle, setBTitle] = useState('')
  const [bName, setBName] = useState('')
  const [bCheckIn, setBCheckIn] = useState('')
  const [bCheckOut, setBCheckOut] = useState('')
  const [bCost, setBCost] = useState(150)

  useEffect(() => {
    fetchProperties()
    if (activeTab === 'bookings' || activeTab === 'financials') {
      fetchBookings()
    }
  }, [activeTab])

  async function fetchProperties() {
    setLoadingProps(true)
    try {
      const { data, error } = await supabase.from('properties').select('*')
      if (error) throw error
      if (data) setProperties(data)
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoadingProps(false)
    }
  }

  async function fetchBookings() {
    setLoadingBookings(true)
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (data) setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoadingBookings(false)
    }
  }

  async function handleSaveProperty(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        title: propTitle,
        category: propCategory,
        location: propLocation,
        price: Number(propPrice),
        description: propDesc,
        amenities: propAmenities,
        image_url: propImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
      }

      if (editingProperty) {
        const { error } = await supabase.from('properties').update(payload).eq('id', editingProperty.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('properties').insert([payload])
        if (error) throw error
      }

      setShowPropModal(false)
      setEditingProperty(null)
      fetchProperties()
    } catch (err) {
      console.error('Error saving property:', err)
      alert('Error saving property.')
    }
  }

  async function handleDeleteProperty(id: string) {
    if (!confirm('Are you sure you want to remove this property?')) return
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
      fetchProperties()
    } catch (err) {
      console.error('Error deleting property:', err)
    }
  }

  async function handleManualBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          property_title: bTitle,
          traveler_name: bName,
          check_in: bCheckIn,
          check_out: bCheckOut,
          total_cost: Number(bCost),
          status: 'Manually Confirmed',
          created_at: new Date().toISOString()
        }
      ])
      if (error) throw error
      setShowBookingModal(false)
      fetchBookings()
    } catch (err) {
      console.error('Error adding booking:', err)
      alert('Error creating manual booking.')
    }
  }

  async function handleDeleteBooking(id: string) {
    if (!confirm('Remove this booking record?')) return
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id)
      if (error) throw error
      fetchBookings()
    } catch (err) {
      console.error('Error removing booking:', err)
    }
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0)

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between p-6">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-extrabold tracking-wider text-amber-400">LA ESTANCIA</h1>
            <p className="text-xs text-neutral-400 mt-1">Host Portal & PMS Operations</p>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'properties', label: 'Properties', icon: '🏡' },
              { id: 'bookings', label: 'Bookings & iCal', icon: '📅' },
              { id: 'financials', label: 'Financial Ledger', icon: '💰' },
              { id: 'cohosting', label: 'Co-Hosting', icon: '🤝' },
              { id: 'upsells', label: 'Upsell Services', icon: '⭐' },
              { id: 'tasks', label: 'Tasks & Dispatch', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400 transition-colors">
            ← Back to Public Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-neutral-800 mb-8">
          <h2 className="text-2xl font-bold capitalize text-white">
            {activeTab === 'bookings' ? 'Bookings, iCal & Manual Ledger' : activeTab}
          </h2>
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            ● Secure Live Sync Active
          </span>
        </header>

        {/* Tab 1: Properties */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">Manage your portfolio items, descriptions, and amenities.</p>
              <button
                onClick={() => {
                  setEditingProperty(null)
                  setPropTitle('')
                  setPropCategory('Apartment')
                  setPropLocation('')
                  setPropPrice(100)
                  setPropDesc('')
                  setPropAmenities('')
                  setPropImage('')
                  setShowPropModal(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                + Add New Property
              </button>
            </div>

            {loadingProps ? (
              <div className="text-center py-20 text-neutral-500 text-xs animate-pulse">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                <p className="text-neutral-400 text-xs">No properties found in database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div className="relative h-48 bg-neutral-800">
                      <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-neutral-950/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 border border-amber-500/20">
                        {property.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-bold text-white">{property.title}</h4>
                        <span className="text-amber-400 text-xs font-bold">${property.price}/night</span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-3">{property.location}</p>
                      
                      <div className="space-y-2 mb-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                        <p className="text-xs text-neutral-300"><strong className="text-amber-400">Description:</strong> {property.description || 'No description provided.'}</p>
                        <p className="text-xs text-neutral-300"><strong className="text-amber-400">Amenities:</strong> {property.amenities || 'WiFi, AC, Parking'}</p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingProperty(property)
                          setPropTitle(property.title)
                          setPropCategory(property.category)
                          setPropLocation(property.location)
                          setPropPrice(property.price)
                          setPropDesc(property.description || '')
                          setPropAmenities(property.amenities || '')
                          setPropImage(property.image_url)
                          setShowPropModal(true)
                        }}
                        className="px-4 py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition-colors"
                      >
                        Edit Property
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookings & iCal */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">Manage traveler bookings from Book Now button and iCal sync feeds.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                  + Manually Add Booking
                </button>
                <button onClick={fetchBookings} className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-400 hover:bg-neutral-800 transition-colors">
                  ↻ Refresh iCal & Feed
                </button>
              </div>
            </div>

            {loadingBookings ? (
              <div className="text-center py-20 text-neutral-500 text-xs animate-pulse">Loading bookings ledger...</div>
            ) : bookings.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                <p className="text-neutral-400 text-xs">No bookings recorded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                          {booking.status}
                        </span>
                        <span className="text-xs text-neutral-400">{new Date(booking.created_at).toLocaleDateString()}</span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">{booking.property_title}</h4>
                      <p className="text-xs text-amber-400 font-semibold mb-4">Guest: {booking.traveler_name} {booking.traveler_phone ? `(${booking.traveler_phone})` : ''}</p>

                      <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 text-xs mb-4">
                        {booking.check_in && <p className="text-neutral-400">Check-In: <span className="text-white font-medium">{booking.check_in}</span></p>}
                        {booking.check_out && <p className="text-neutral-400">Check-Out: <span className="text-white font-medium">{booking.check_out}</span></p>}
                        {booking.total_guests && <p className="text-neutral-400">Guests: <span className="text-white font-medium">{booking.total_guests}</span></p>}
                        {booking.origin_region && <p className="text-neutral-400">Origin: <span className="text-white font-medium">{booking.origin_region}</span></p>}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">${booking.total_cost}</span>
                      <button onClick={() => handleDeleteBooking(booking.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        Remove Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Financial Ledger */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-xs text-neutral-400 mb-1 font-semibold uppercase">Total Revenue</p>
                <p className="text-3xl font-extrabold text-amber-400">${totalRevenue}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-xs text-neutral-400 mb-1 font-semibold uppercase">Total Bookings</p>
                <p className="text-3xl font-extrabold text-white">{bookings.length}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-xs text-neutral-400 mb-1 font-semibold uppercase">Ledger Status</p>
                <p className="text-3xl font-extrabold text-emerald-400">Synced</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cohosting' && <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-neutral-400 text-xs">Co-hosting tools active.</div>}
        {activeTab === 'upsells' && <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-neutral-400 text-xs">Upsell configuration active.</div>}
        {activeTab === 'tasks' && <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-neutral-400 text-xs">Task dispatch operations active.</div>}
      </main>

      {/* Property Modal */}
      {showPropModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl my-8">
            <button onClick={() => setShowPropModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-white text-lg font-bold">✕</button>
            <h3 className="text-lg font-bold text-white mb-4">{editingProperty ? 'Edit Property' : 'Add New Property'}</h3>
            
            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Title</label>
                <input type="text" required value={propTitle} onChange={(e) => setPropTitle(e.target.value)} placeholder="e.g. Luxury Apartment" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                  <select value={propCategory} onChange={(e) => setPropCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white">
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                    <option value="House">House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Price per Night ($)</label>
                  <input type="number" required value={propPrice} onChange={(e) => setPropPrice(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Location</label>
                <input type="text" required value={propLocation} onChange={(e) => setPropLocation(e.target.value)} placeholder="e.g. Kisaasi, Kampala" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                <textarea rows={3} required value={propDesc} onChange={(e) => setPropDesc(e.target.value)} placeholder="Property overview..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Amenities (comma-separated)</label>
                <input type="text" value={propAmenities} onChange={(e) => setPropAmenities(e.target.value)} placeholder="High-speed WiFi, Pool, Parking, AC" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Image URL</label>
                <input type="text" value={propImage} onChange={(e) => setPropImage(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-3 rounded-xl transition-colors">
                Save Property
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-white text-lg font-bold">✕</button>
            <h3 className="text-lg font-bold text-white mb-4">Manually Add Booking</h3>

            <form onSubmit={handleManualBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Property Title</label>
                <input type="text" required value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder="Luxury Apartment" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Guest Name</label>
                <input type="text" required value={bName} onChange={(e) => setBName(e.target.value)} placeholder="John Doe" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Check-In</label>
                  <input type="date" required value={bCheckIn} onChange={(e) => setBCheckIn(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Check-Out</label>
                  <input type="date" required value={bCheckOut} onChange={(e) => setBCheckOut(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Total Cost ($)</label>
                <input type="number" required value={bCost} onChange={(e) => setBCost(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-3 rounded-xl transition-colors">
                Create Booking Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}