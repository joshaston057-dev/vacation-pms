'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPortal() {
  // Navigation Tabs: 'properties' | 'bookings' | 'tasks' | 'financials' | 'services'
  const [activeTab, setActiveTab] = useState('bookings')

  // Data States
  const [services, setServices] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  
  // Upsell Service Form State
  const [serviceName, setServiceName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('Transportation')
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [whatsappContact, setWhatsappContact] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServices()
    fetchBookings()
    fetchProperties()
  }, [])

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('id', { ascending: false })
    if (data) setServices(data)
  }

  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*').order('id', { ascending: false })
    if (data) setBookings(data)
  }

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('*').order('id', { ascending: false })
    if (data) setProperties(data)
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newService = {
      service_name: serviceName,
      category: serviceCategory,
      company_name: companyName,
      company_logo: companyLogo,
      description: serviceDescription,
      location: location,
      price: parseFloat(price) || 0,
      whatsapp_contact: whatsappContact
    }

    const { error } = await supabase.from('services').insert([newService])

    if (error) {
      console.error('Error adding service:', error.message)
      alert('Failed to add service. Check your Supabase table schema.')
    } else {
      setServiceName('')
      setCompanyName('')
      setCompanyLogo('')
      setServiceDescription('')
      setLocation('')
      setPrice('')
      setWhatsappContact('')
      fetchServices()
    }
    setLoading(false)
  }

  const serviceCategories = ['Transportation', 'Dining & Meals', 'Cleaning & Laundry', 'Tours & Excursions', 'Concierge & Security']

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* PORTAL HEADER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            La Estancia Host Operations Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Centralized PMS: Manage Properties, Bookings, Staff, Finances, and Upsell Services.
          </p>

          {/* FULL SUB-NAVIGATION TABS BAR */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'properties'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🏠 Properties & Photos ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              📅 Bookings & iCal ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🧹 Tasks & Staff
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'financials'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              💰 Financials & Ledger
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              ✨ Upsell Services ({services.length})
            </button>
          </div>
        </section>

        {/* 1. BOOKINGS & ICAL TAB */}
        {activeTab === 'bookings' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <h2 className="text-base font-extrabold text-white">Guest Reservation Requests</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                No reservation requests submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-white text-sm">{booking.property_name}</h3>
                      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] rounded-lg">
                        {booking.status || 'Pending Host Review'}
                      </span>
                    </div>
                    <div className="text-xs space-y-1.5 text-neutral-300">
                      <p>👤 <strong className="text-white">Guest:</strong> {booking.guest_name}</p>
                      <p>💬 <strong className="text-white">WhatsApp:</strong> {booking.phone_number}</p>
                      <p>📅 <strong className="text-white">Dates:</strong> {booking.check_in} to {booking.check_out}</p>
                    </div>
                    <button
                      onClick={() => {
                        const cleanPhone = (booking.phone_number || '').replace(/[^0-9]/g, '')
                        const msg = encodeURIComponent(`Hello ${booking.guest_name}, regarding your reservation request for ${booking.property_name} at La Estancia...`)
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      💬 Message Guest on WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. PROPERTIES & PHOTOS TAB */}
        {activeTab === 'properties' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-white">Managed Properties Catalog</h2>
              <a href="/properties" className="text-xs text-amber-400 font-bold hover:underline">View Public Catalog →</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map(p => (
                <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <h3 className="font-extrabold text-white text-sm">{p.title}</h3>
                  <p className="text-xs text-neutral-400">📍 {p.location || 'Kampala, Uganda'}</p>
                  <p className="text-xs text-amber-500 font-bold">${p.price_per_night || p.nightly_price || p.price || 0} / night</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. TASKS & STAFF TAB */}
        {activeTab === 'tasks' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-2">
              <span className="text-3xl">🧹</span>
              <h3 className="font-extrabold text-white text-sm">Task & Staff Dispatch Module</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Assign turn-over cleaning tasks, laundry dispatch, and maintenance work orders to team members via WhatsApp.
              </p>
            </div>
          </section>
        )}

        {/* 4. FINANCIALS & LEDGER TAB */}
        {activeTab === 'financials' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-2">
              <span className="text-3xl">💰</span>
              <h3 className="font-extrabold text-white text-sm">Financials & Operations Ledger</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Track nightly payouts, utility bills (UMEME/Water/Gas), maintenance costs, and host commission splits.
              </p>
            </div>
          </section>
        )}

        {/* 5. UPSELL SERVICES TAB */}
        {activeTab === 'services' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* ADD SERVICE FORM */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit shadow-xl">
                <h2 className="text-sm font-extrabold text-white">Add Partner Service</h2>
                
                <form onSubmit={handleAddService} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Service Title</label>
                    <input
                      type="text"
                      required
                      value={serviceName}
                      onChange={e => setServiceName(e.target.value)}
                      placeholder="e.g. Airport VIP Pickup"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Service Category</label>
                    <select
                      value={serviceCategory}
                      onChange={e => setServiceCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {serviceCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Company Name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="Ewright Cabs"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Logo URL (Optional)</label>
                      <input
                        type="text"
                        value={companyLogo}
                        onChange={e => setCompanyLogo(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Location / Coverage</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Entebbe & Kampala"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">Service Description</label>
                    <textarea
                      required
                      rows={2}
                      value={serviceDescription}
                      onChange={e => setServiceDescription(e.target.value)}
                      placeholder="Reliable airport transfers with air conditioning..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">Price ($)</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="45"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        required
                        value={whatsappContact}
                        onChange={e => setWhatsappContact(e.target.value)}
                        placeholder="+256757..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer mt-2"
                  >
                    {loading ? 'Adding Service...' : 'Publish Service'}
                  </button>
                </form>
              </div>

              {/* SERVICES DISPLAY GRID */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Active Upsell Services</h2>

                {services.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                    No upsell services added yet. Fill out the form to publish your first partner service.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(service => (
                      <div key={service.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
                        
                        <div className="flex justify-between items-start">
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] rounded-lg uppercase tracking-wider">
                            {service.category}
                          </span>
                          <span className="font-black text-amber-500 text-sm">
                            ${service.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {service.company_logo ? (
                            <img src={service.company_logo} alt={service.company_name} className="w-10 h-10 object-cover rounded-xl border border-neutral-800" />
                          ) : (
                            <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center text-xs font-bold text-amber-500">
                              🏢
                            </div>
                          )}
                          <div>
                            <h3 className="font-extrabold text-white text-sm">{service.service_name}</h3>
                            <p className="text-[11px] text-neutral-400 font-semibold">{service.company_name}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-neutral-800/80">
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {service.description}
                          </p>
                          <p className="text-[11px] text-neutral-400 flex items-center gap-1 pt-1">
                            📍 {service.location || 'Kampala, Uganda'}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const phone = service.whatsapp_contact || '+256757386946'
                            const msg = encodeURIComponent(`Hello ${service.company_name}, I would like to book your service: ${service.service_name} ($${service.price})`)
                            window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          💬 Book via WhatsApp
                        </button>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>
        )}

      </div>
      <Footer />
    </main>
  )
}