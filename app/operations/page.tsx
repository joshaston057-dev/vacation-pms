'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'ledger'>('properties')
  const [tasks, setTasks] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const { data: tData } = await supabase.from('tasks').select('*').order('id', { ascending: false })
      const { data: bData } = await supabase.from('bookings').select('*').order('id', { ascending: false })

      if (tData) setTasks(tData)
      if (bData) setBookings(bData)
    } catch (err) {
      console.error('Error fetching host data:', err)
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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* TOP NAV TABS */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'properties' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                🏠 Properties
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'bookings' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                📅 Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'tasks' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                🧹 Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ledger' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                💰 Financial Ledger
              </button>
            </div>
          </div>

          {/* DEMOGRAPHIC ANALYTICS CARD */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="font-extrabold text-white text-base">📊 Guest Demographics & Intelligence</h3>
              <span className="text-[10px] font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">Automated Insights</span>
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

          {/* TASKS TAB & CLEANER VERIFICATION WORKFLOW */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-white">Automated Staff Tasks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((t) => (
                  <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-amber-400">{t.task_type || 'Cleaning'}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        t.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{t.title}</h4>
                    <p className="text-xs text-neutral-400">Assigned To: {t.assignedTo || 'Aisha (Head Cleaner)'}</p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleVerifyTask(t.id, 'VERIFIED')}
                        className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                      >
                        ✓ Verify Photos & Ready
                      </button>
                      <button
                        onClick={() => handleVerifyTask(t.id, 'REOPEN')}
                        className="w-1/2 py-2 bg-rose-950 border border-rose-900 text-rose-400 font-extrabold text-xs rounded-xl hover:bg-rose-900 transition cursor-pointer"
                      >
                        ✕ Re-Open Task
                      </button>
                    </div>
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