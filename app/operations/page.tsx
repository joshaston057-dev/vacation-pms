'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'ledger' | 'upsells' | 'cohosts'>('properties')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [cohosts, setCohosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Entire Listing Modal State (Including Photos)
  const [showEditListingModal, setShowEditListingModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>({
    id: '',
    title: '',
    custom_name: '',
    price: '',
    location: '',
    category: 'Apartment',
    imagesText: ''
  })

  // Co-Host Add Modal State
  const [showCoHostModal, setShowCoHostModal] = useState(false)
  const [newCoHost, setNewCoHost] = useState({
    name: '',
    specialty: '',
    location: '',
    rating: '5.0',
    phone: '',
    bio: '',
    image_url: ''
  })

  // Upsell Modal State
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [newUpsell, setNewUpsell] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Service',
    icon: '✨'
  })

  // Booking & Expense Modals
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
      const [propsRes, bookRes, taskRes, upsellRes, expenseRes, cohostRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').order('id', { ascending: true }),
        supabase.from('expenses').select('*').order('id', { ascending: false }),
        supabase.from('co_hosts').select('*').order('id', { ascending: true })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
      if (expenseRes.data) setExpenses(expenseRes.data)
      if (cohostRes.data) setCohosts(cohostRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // FULL LISTING & PHOTO EDITOR
  const openEditListingModal = (property: any) => {
    const imgArray = Array.isArray(property.images) ? property.images : property.image_url ? [property.image_url] : []
    setEditingProperty({
      id: property.id,
      title: property.title || '',
      custom_name: property.custom_name || '',
      price: property.price || '',
      location: property.location || '',
      category: property.category || 'Apartment',
      imagesText: imgArray.join('\n')
    })
    setShowEditListingModal(true)
  }

  const handleSaveFullListing = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsedImages = editingProperty.imagesText
        ? editingProperty.imagesText.split('\n').map((url: string) => url.trim()).filter(Boolean)
        : []

      const { error } = await supabase
        .from('properties')
        .update({
          title: editingProperty.custom_name,
          custom_name: editingProperty.custom_name,
          price: parseFloat(editingProperty.price) || 0,
          location: editingProperty.location,
          category: editingProperty.category,
          images: parsedImages,
          image_url: parsedImages[0] || null
        })
        .eq('id', editingProperty.id)

      if (error) throw error

      alert('✅ Property listing and photos updated successfully!')
      setShowEditListingModal(false)
      fetchHostData()
    } catch (err: any) {
      alert('Error updating listing: ' + err.message)
    }
  }

  // CO-HOST MANAGEMENT
  const handleCreateCoHost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('co_hosts').insert([
        {
          name: newCoHost.name,
          specialty: newCoHost.specialty,
          location: newCoHost.location,
          rating: parseFloat(newCoHost.rating) || 5.0,
          phone: newCoHost.phone,
          bio: newCoHost.bio,
          image_url: newCoHost.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
        }
      ])
      if (error) throw error
      alert('✅ Co-host added to marketplace!')
      setShowCoHostModal(false)
      setNewCoHost({ name: '', specialty: '', location: '', rating: '5.0', phone: '', bio: '', image_url: '' })
      fetchHostData()
    } catch (err: any) {
      alert('Error adding co-host: ' + err.message)
    }
  }

  const handleDeleteCoHost = async (id: number) => {
    if (!confirm('Are you sure you want to remove this co-host from the marketplace?')) return
    try {
      const { error } = await supabase.from('co_hosts').delete().eq('id', id)
      if (error) throw error
      fetchHostData()
    } catch (err: any) {
      alert('Error removing co-host: ' + err.message)
    }
  }

  // UPSELL MANAGEMENT
  const handleCreateUpsell = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('upsell_services').insert([
        {
          title: newUpsell.title,
          description: newUpsell.description,
          price: parseFloat(newUpsell.price) || 0,
          price_usd: parseFloat(newUpsell.price) || 0,
          category: newUpsell.category,
          icon: newUpsell.icon || '✨'
        }
      ])
      if (error) throw error
      alert('✅ Add-on service created!')
      setShowUpsellModal(false)
      setNewUpsell({ title: '', description: '', price: '', category: 'Service', icon: '✨' })
      fetchHostData()
    } catch (err: any) {
      alert('Error creating upsell: ' + err.message)
    }
  }

  const handleDeleteUpsell = async (id: number) => {
    if (!confirm('Are you sure you want to delete this upsell service?')) return
    try {
      await supabase.from('upsell_services').delete().eq('id', id)
      fetchHostData()
    } catch (err: any) {
      alert('Error deleting upsell: ' + err.message)
    }
  }

  // BOOKING / EXPENSE / TASKS HELPERS
  const handleApproveBooking = async (booking: any) => {
    try {
      await supabase.from('bookings').update({ status: 'CONFIRMED' }).eq('id', booking.id)
      if (booking.property_id) {
        await supabase.from('properties').update({ status: 'OCCUPIED' }).eq('id', booking.property_id)
      }
      fetchHostData()
      alert('✅ Booking confirmed and property marked OCCUPIED!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Delete booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    fetchHostData()
  }

  const handleDeleteExpense = async (id: number) => {
    await supabase.from('expenses').delete().eq('id', id)
    fetchHostData()
  }

  const filteredProperties = properties.filter((p) =>
    (p.custom_name || p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (parseFloat(b.total_price) || 150), 0)
  const totalExpenses = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* QUICK SEARCH */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Quick search properties, guests, or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition shadow-lg"
            />
          </div>

          {/* TABS */}
          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2 scrollbar-none">
            <button onClick={() => setActiveTab('properties')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🏠 Properties ({properties.length})</button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>📅 Bookings ({bookings.length})</button>
            <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🧹 Dispatch ({tasks.length})</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>💰 Ledger</button>
            <button onClick={() => setActiveTab('upsells')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'upsells' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>✨ Upsells ({upsells.length})</button>
            <button onClick={() => setActiveTab('cohosts')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'cohosts' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🤝 Co-Hosts ({cohosts.length})</button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">Loading operations hub...</div>
          ) : (
            <>
              {/* PROPERTIES TAB */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProperties.map((p) => {
                      const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
                      const displayTitle = p.custom_name || p.title || 'Executive Apartment'
                      return (
                        <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                          <div className="relative aspect-[16/10] bg-neutral-950">
                            {gallery.length > 0 ? (
                              <img src={gallery[0]} alt={displayTitle} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                            )}
                            <span className="absolute top-3 left-3 bg-black/80 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                              {gallery.length} Photos
                            </span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-black text-white text-base truncate">{displayTitle}</h4>
                              <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                            </div>
                            <p className="text-xs text-neutral-400">📍 {p.location}</p>
                            <button
                              onClick={() => openEditListingModal(p)}
                              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              ✏️ Edit Entire Listing & Photos
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-white text-sm">{b.property_title || 'Stay'}</h4>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded border ${b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{b.status}</span>
                        </div>
                        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs space-y-1">
                          <p className="text-white font-bold">👤 {b.guest_name}</p>
                          <p className="text-amber-400 font-bold">${b.total_price}</p>
                        </div>
                        <div className="flex gap-2">
                          {b.status !== 'CONFIRMED' && (
                            <button onClick={() => handleApproveBooking(b)} className="w-1/2 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">Approve</button>
                          )}
                          <button onClick={() => handleDeleteBooking(b.id)} className="w-1/2 py-2 bg-rose-950 text-rose-400 font-black text-xs rounded-xl cursor-pointer">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tasks.map((t) => (
                      <div key={t.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                        <h4 className="font-black text-white text-sm">{t.title}</h4>
                        <p className="text-xs text-neutral-400">{t.description}</p>
                        <button onClick={async () => { await supabase.from('tasks').delete().eq('id', t.id); fetchHostData(); }} className="text-xs text-rose-400 font-bold cursor-pointer">Remove Task</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LEDGER TAB */}
              {activeTab === 'ledger' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-neutral-900 p-4 rounded-xl"><span className="text-xs text-neutral-400">Revenue</span><div className="text-xl font-black text-emerald-400">${totalRevenue}</div></div>
                    <div className="bg-neutral-900 p-4 rounded-xl"><span className="text-xs text-neutral-400">Expenses</span><div className="text-xl font-black text-rose-400">${totalExpenses}</div></div>
                    <div className="bg-neutral-900 p-4 rounded-xl"><span className="text-xs text-neutral-400">Net Profit</span><div className="text-xl font-black text-amber-400">${netProfit}</div></div>
                  </div>
                  <div className="space-y-2">
                    {expenses.map((e) => (
                      <div key={e.id} className="bg-neutral-900 p-3 rounded-xl flex justify-between items-center text-xs">
                        <span>{e.title} (-${e.amount})</span>
                        <button onClick={() => handleDeleteExpense(e.id)} className="text-rose-400 font-bold cursor-pointer">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPSELLS TAB */}
              {activeTab === 'upsells' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Upsell Services Catalog</h3>
                    <button onClick={() => setShowUpsellModal(true)} className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">➕ Add New Service</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upsells.map((u) => (
                      <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">{u.icon || '✨'}</span>
                            <span className="text-xs font-black text-amber-400">+${u.price || u.price_usd || 0}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm">{u.title}</h4>
                          <p className="text-xs text-neutral-400">{u.description}</p>
                        </div>
                        <button onClick={() => handleDeleteUpsell(u.id)} className="w-full py-2 bg-rose-950 text-rose-400 text-xs font-bold rounded-xl cursor-pointer">🗑️ Remove Service</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CO-HOST MARKETPLACE TAB */}
              {activeTab === 'cohosts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Co-Host Marketplace</h3>
                    <button onClick={() => setShowCoHostModal(true)} className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">➕ Add New Co-Host</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {cohosts.map((ch) => (
                      <div key={ch.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={ch.image_url} alt={ch.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/30" />
                            <div>
                              <h4 className="font-black text-white text-sm">{ch.name}</h4>
                              <span className="text-[11px] text-amber-400 font-bold">⭐ {ch.rating} Rating</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400">{ch.bio}</p>
                        </div>
                        <button onClick={() => handleDeleteCoHost(ch.id)} className="w-full py-2 bg-rose-950 hover:bg-rose-900 text-rose-400 font-black text-xs rounded-xl cursor-pointer">🗑️ Remove Co-Host</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* EDIT LISTING & PHOTOS MODAL */}
      {showEditListingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Edit Listing Details & Photos</h3>
              <button onClick={() => setShowEditListingModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleSaveFullListing} className="space-y-3">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Listing Title / Layout</label>
                <input type="text" required value={editingProperty.custom_name} onChange={(e) => setEditingProperty({ ...editingProperty, custom_name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Price ($/night)</label>
                  <input type="number" required value={editingProperty.price} onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-bold text-amber-400" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Location</label>
                  <input type="text" required value={editingProperty.location} onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Property Image URLs (One image URL per line)</label>
                <textarea rows={4} value={editingProperty.imagesText} onChange={(e) => setEditingProperty({ ...editingProperty, imagesText: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-[11px]" />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">⚡ Save Property & Photos</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CO-HOST MODAL */}
      {showCoHostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Add Co-Host to Marketplace</h3>
              <button onClick={() => setShowCoHostModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleCreateCoHost} className="space-y-3">
              <input type="text" required placeholder="Co-Host Name" value={newCoHost.name} onChange={(e) => setNewCoHost({ ...newCoHost, name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Specialty (e.g. Guest Comms)" value={newCoHost.specialty} onChange={(e) => setNewCoHost({ ...newCoHost, specialty: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Location (e.g. Entebbe)" value={newCoHost.location} onChange={(e) => setNewCoHost({ ...newCoHost, location: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="WhatsApp Phone (+256...)" value={newCoHost.phone} onChange={(e) => setNewCoHost({ ...newCoHost, phone: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" placeholder="Profile Photo URL" value={newCoHost.image_url} onChange={(e) => setNewCoHost({ ...newCoHost, image_url: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <textarea rows={2} placeholder="Short Bio" value={newCoHost.bio} onChange={(e) => setNewCoHost({ ...newCoHost, bio: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">⚡ Add Co-Host</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD UPSELL MODAL */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Create Add-On Service</h3>
              <button onClick={() => setShowUpsellModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleCreateUpsell} className="space-y-3">
              <input type="text" required placeholder="Service Title (e.g. Airport Transfer)" value={newUpsell.title} onChange={(e) => setNewUpsell({ ...newUpsell, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="number" required placeholder="Price ($)" value={newUpsell.price} onChange={(e) => setNewUpsell({ ...newUpsell, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <textarea rows={2} placeholder="Description" value={newUpsell.description} onChange={(e) => setNewUpsell({ ...newUpsell, description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">⚡ Save Service</button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}