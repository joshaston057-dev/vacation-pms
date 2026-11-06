'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'ledger'>('bookings')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const [propsRes, bookRes, taskRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
    } catch (err) {
      console.error('Error loading operations data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTask = async (taskId: number, verifyStatus: 'VERIFIED' | 'REOPEN') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: verifyStatus })
        .eq('id', taskId)

      if (error) throw error
      fetchHostData()
    } catch (err: any) {
      alert('Error updating task: ' + err.message)
    }
  }

  // CALCULATE LEDGER METRICS
  const totalEarnings = bookings.reduce((sum, b) => sum + (Number(b.paid_amount) || Number(b.total_price) || 0), 0)
  const totalBookingsCount = bookings.length

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* TAB NAVIGATION BAR */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🏠 Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                📅 Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🧹 Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                💰 Financial Ledger
              </button>
            </div>
          </div>

          {/* GUEST DEMOGRAPHIC INTELLIGENCE PANEL */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="font-extrabold text-white text-base">📊 Guest Demographics & Intelligence</h3>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full">
                Automated Insights
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Top Purpose</span>
                <span className="text-sm font-black text-amber-400">Business (45%)</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Top Channel</span>
                <span className="text-sm font-black text-amber-400">TikTok (60%)</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Avg Occupancy</span>
                <span className="text-sm font-black text-white">2.1 Adults / 0.3 Child</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Recommendation</span>
                <span className="text-xs font-bold text-emerald-400">Add Workspace Desks</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">
              Loading operational data...
            </div>
          ) : (
            <>
              {/* 1. PROPERTIES TAB */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Managed Properties</h3>
                    <span className="text-xs text-neutral-400 font-bold">{properties.length} Active Listings</span>
                  </div>

                  {properties.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500 text-xs font-bold bg-neutral-900 rounded-2xl border border-neutral-800">
                      No properties found in your host account.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {properties.map((p) => (
                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                              {p.category || 'Apartment'}
                            </span>
                            <span className="text-xs font-black text-amber-400">${p.price || 50} / night</span>
                          </div>
                          <h4 className="font-black text-white text-base">{p.title}</h4>
                          <p className="text-xs text-neutral-400">📍 {p.location}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Guest Reservations</h3>
                    <span className="text-xs text-neutral-400 font-bold">{bookings.length} Total Bookings</span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500 text-xs font-bold bg-neutral-900 rounded-2xl border border-neutral-800">
                      No active or pending bookings found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bookings.map((b) => (
                        <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                              <span className="text-xs font-black text-amber-400">ID #{b.id}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                b.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {b.status || 'PAID'}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-black text-white text-base">{b.guest_name || 'Guest'}</h4>
                              <p className="text-xs text-neutral-400">📱 {b.phone}</p>
                            </div>

                            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                              <div className="flex justify-between text-neutral-300">
                                <span>Dates:</span>
                                <span className="font-bold text-white">{b.check_in} → {b.check_out}</span>
                              </div>
                              <div className="flex justify-between text-neutral-300">
                                <span>Guests:</span>
                                <span className="font-bold text-white">{b.adults || 1} Adult(s), {b.children || 0} Child(ren)</span>
                              </div>
                              <div className="flex justify-between text-neutral-300">
                                <span>Purpose:</span>
                                <span className="font-bold text-amber-400">{b.purpose || 'Leisure'}</span>
                              </div>
                              <div className="flex justify-between text-neutral-300">
                                <span>Source:</span>
                                <span className="font-bold text-neutral-400">{b.booking_source || 'Direct Website'}</span>
                              </div>
                              {b.door_code && (
                                <div className="flex justify-between text-neutral-300 border-t border-neutral-800 pt-1.5 mt-1.5">
                                  <span>Door Access Code:</span>
                                  <span className="font-black text-emerald-400">{b.door_code}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 space-y-3">
                            <div className="flex justify-between items-center border-t border-neutral-800 pt-2">
                              <span className="text-xs text-neutral-400 font-bold">Total Revenue:</span>
                              <span className="text-base font-black text-amber-400">${b.paid_amount || b.total_price || 0}</span>
                            </div>

                            {b.phone && (
                              <a
                                href={`https://api.whatsapp.com/send?phone=${b.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-center w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition"
                              >
                                Message Guest on WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. TASKS TAB */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Automated Housekeeping & Work Orders</h3>
                    <span className="text-xs text-neutral-400 font-bold">{tasks.length} Active Tasks</span>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500 text-xs font-bold bg-neutral-900 rounded-2xl border border-neutral-800">
                      No cleaning or inspection tasks generated yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map((t) => (
                        <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 shadow-xl">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{t.task_type || 'Cleaning'}</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                              t.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-base">{t.title}</h4>
                          <p className="text-xs text-neutral-400">Assigned To: <span className="text-white font-bold">{t.assignedTo || 'Aisha (Head Cleaner)'}</span></p>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleVerifyTask(t.id, 'VERIFIED')}
                              className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                            >
                              ✓ Verify Photos & Ready
                            </button>
                            <button
                              onClick={() => handleVerifyTask(t.id, 'REOPEN')}
                              className="w-1/2 py-2.5 bg-rose-950 border border-rose-900 text-rose-400 font-extrabold text-xs rounded-xl hover:bg-rose-900 transition cursor-pointer"
                            >
                              ✕ Re-Open Task
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. FINANCIAL LEDGER TAB */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white">Financial Ledger & Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold uppercase">Total Gross Revenue</span>
                      <p className="text-2xl font-black text-amber-400">${totalEarnings}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold uppercase">Paid Reservations</span>
                      <p className="text-2xl font-black text-white">{totalBookingsCount}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-1 shadow-xl">
                      <span className="text-xs text-neutral-400 font-bold uppercase">Avg Booking Value</span>
                      <p className="text-2xl font-black text-emerald-400">
                        ${totalBookingsCount > 0 ? Math.round(totalEarnings / totalBookingsCount) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}