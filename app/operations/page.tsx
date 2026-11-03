'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import UpsellMotionSlider from '../components/UpsellMotionSlider'
import { supabase } from '@/lib/supabase'

export default function HostOperationsPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'properties' | 'tasks' | 'ledger'>('bookings')
  
  // Data States
  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([
    { id: 1, title: 'Clean Turnover - Entebbe Unit', priority: 'High', status: 'Pending', assignedTo: 'Housekeeping', date: 'Today' },
    { id: 2, title: 'Refill Cooking Gas - Kisaasi Apt', priority: 'Medium', status: 'Completed', assignedTo: 'Maintenance', date: 'Yesterday' }
  ])
  const [bills, setBills] = useState<any[]>([
    { id: 1, description: 'Monthly Wi-Fi Internet', amount: '$50', status: 'Paid', date: 'Nov 1' },
    { id: 2, description: 'Deep Cleaning Service', amount: '$30', status: 'Pending', date: 'Nov 2' }
  ])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortalData()
  }, [])

  const fetchPortalData = async () => {
    setLoading(true)
    const { data: bookingData } = await supabase.from('bookings').select('*').order('id', { ascending: false })
    if (bookingData) setBookings(bookingData)

    const { data: propertyData } = await supabase.from('properties').select('*').order('id', { ascending: false })
    if (propertyData) setProperties(propertyData)

    setLoading(false)
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
                Centralized PMS: Manage Bookings, Properties, Upsells, Tasks, and Financial Ledgers.
              </p>
            </div>
          </div>
        </section>

        {/* 🚀 UPSELL MOTION AD SLIDER */}
        <UpsellMotionSlider />

        {/* MAIN DASHBOARD CONTENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          {/* NAVIGATION TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              📅 Bookings ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'properties'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🏠 Properties ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              🧹 Staff Tasks ({tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'bg-amber-500 text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              💰 Financial Ledger ({bills.length})
            </button>
          </div>

          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-base">Guest Reservation Requests</h3>
              {loading ? (
                <p className="text-xs text-neutral-500 animate-pulse">Loading reservation records...</p>
              ) : bookings.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs font-bold">
                  No reservation requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 space-y-1">
                      <p className="font-bold text-amber-400">{b.guest_name}</p>
                      <p className="text-[10px] text-neutral-500">Submitted: {new Date(b.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-white text-base">Property Listings Portfolio</h3>
                <a href="/admin/add-property" className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg transition">
                  + Add Property
                </a>
              </div>
              {properties.length === 0 ? (
                <p className="text-xs text-neutral-500 py-8 text-center">No properties added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map(p => (
                    <div key={p.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <h4 className="font-bold text-white text-sm">{p.title}</h4>
                      <p className="text-xs text-amber-400 font-bold">${p.price_per_night || p.price || 0} / night</p>
                      <p className="text-xs text-neutral-400">📍 {p.location || 'Uganda'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STAFF TASKS TRACKER */}
          {activeTab === 'tasks' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-base">Automated Housekeeping & Staff Dispatch</h3>
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 mr-2">
                        {t.priority} Priority
                      </span>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm inline">{t.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1">Assigned: {t.assignedTo} • Status: {t.status}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-lg transition self-start sm:self-auto">
                      📱 Dispatch on WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-base">Operational Bills & Financial Ledger</h3>
              <div className="space-y-3">
                {bills.map(bill => (
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