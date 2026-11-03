'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPortal() {
  const [activeTab, setActiveTab] = useState('properties')

  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [financials, setFinancials] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Property Modal State
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [propTitle, setPropTitle] = useState('')
  const [propCategory, setPropCategory] = useState('Apartment')
  const [propPrice, setPropPrice] = useState('')
  const [propLocation, setPropLocation] = useState('')
  const [propDescription, setPropDescription] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  // Tasks Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProperty, setTaskProperty] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskStaffPhone, setTaskStaffPhone] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [taskDueDate, setTaskDueDate] = useState('')

  // Financial Ledger Form State
  const [transTitle, setTransTitle] = useState('')
  const [transType, setTransType] = useState('Expense')
  const [transCategory, setTransCategory] = useState('Rent')
  const [transAmount, setTransAmount] = useState('')
  const [transDate, setTransDate] = useState('')
  const [transProperty, setTransProperty] = useState('')

  // Upsell Service Form State
  const [serviceName, setServiceName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('Transportation')
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [serviceLocation, setServiceLocation] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [whatsappContact, setWhatsappContact] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    const [propRes, bookRes, taskRes, finRes, servRes] = await Promise.all([
      supabase.from('properties').select('*').order('id', { ascending: false }),
      supabase.from('bookings').select('*').order('id', { ascending: false }),
      supabase.from('tasks').select('*').order('id', { ascending: false }),
      supabase.from('financials').select('*').order('id', { ascending: false }),
      supabase.from('services').select('*').order('id', { ascending: false })
    ])

    if (propRes.data) setProperties(propRes.data)
    if (bookRes.data) setBookings(bookRes.data)
    if (taskRes.data) setTasks(taskRes.data)
    if (finRes.data) setFinancials(finRes.data)
    if (servRes.data) setServices(servRes.data)
    setLoading(false)
  }

  // PROPERTY ACTIONS
  const uploadGalleryPhotos = async (files: FileList): Promise<string[]> => {
    setUploading(true)
    const uploadedUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `properties/${fileName}`
      const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(filePath)
        if (data?.publicUrl) uploadedUrls.push(data.publicUrl)
      }
    }
    setUploading(false)
    return uploadedUrls
  }

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let finalImages = [...existingImages]
    if (selectedFiles && selectedFiles.length > 0) {
      const newUrls = await uploadGalleryPhotos(selectedFiles)
      finalImages = [...finalImages, ...newUrls]
    }

    const payload = {
      title: propTitle,
      category: propCategory,
      price_per_night: parseFloat(propPrice) || 0,
      location: propLocation,
      description: propDescription,
      images: JSON.stringify(finalImages)
    }

    let error
    if (isAddingNew) {
      const res = await supabase.from('properties').insert([payload])
      error = res.error
    } else if (editingProperty) {
      const res = await supabase.from('properties').update(payload).eq('id', editingProperty.id)
      error = res.error
    }

    if (error) alert('Failed to save property.')
    else {
      setEditingProperty(null)
      setIsAddingNew(false)
      fetchAllData()
    }
    setLoading(false)
  }

  const handleDeleteProperty = async (id: number) => {
    if (!confirm('Delete this property?')) return
    await supabase.from('properties').delete().eq('id', id)
    setEditingProperty(null)
    fetchAllData()
  }

  // BOOKING ACTIONS
  const handleUpdateBookingStatus = async (id: number, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchAllData()
  }

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Delete booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    fetchAllData()
  }

  // TASK ACTIONS
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('tasks').insert([{
      title: taskTitle, property_name: taskProperty, assignee_name: taskAssignee,
      staff_phone: taskStaffPhone, priority: taskPriority, due_date: taskDueDate, status: 'Pending'
    }])
    setTaskTitle(''); setTaskProperty(''); setTaskAssignee(''); setTaskStaffPhone('')
    fetchAllData()
  }

  const handleDeleteTask = async (id: number) => {
    await supabase.from('tasks').delete().eq('id', id)
    fetchAllData()
  }

  // FINANCIAL ACTIONS
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('financials').insert([{
      title: transTitle, type: transType, category: transCategory,
      amount: parseFloat(transAmount) || 0, date: transDate || new Date().toISOString().split('T')[0],
      property_name: transProperty
    }])
    setTransTitle(''); setTransAmount(''); setTransProperty('')
    fetchAllData()
  }

  const handleDeleteTransaction = async (id: number) => {
    await supabase.from('financials').delete().eq('id', id)
    fetchAllData()
  }

  // SERVICE ACTIONS
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('services').insert([{
      service_name: serviceName, category: serviceCategory, company_name: companyName,
      company_logo: companyLogo, description: serviceDescription, location: serviceLocation,
      price: parseFloat(servicePrice) || 0, whatsapp_contact: whatsappContact
    }])
    setServiceName(''); setCompanyName(''); setCompanyLogo(''); setServiceDescription('')
    setServiceLocation(''); setServicePrice(''); setWhatsappContact('')
    fetchAllData()
  }

  const totalIncome = financials.filter(f => f.type === 'Income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalExpenses = financials.filter(f => f.type === 'Expense').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* PORTAL HEADER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                La Estancia Host Operations Portal
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Centralized PMS: Manage Properties, Bookings, Staff, Finances, and Upsell Services.
              </p>
            </div>
            {activeTab === 'properties' && (
              <button
                onClick={() => {
                  setEditingProperty(null); setIsAddingNew(true); setPropTitle(''); setPropCategory('Apartment');
                  setPropPrice(''); setPropLocation(''); setPropDescription(''); setExistingImages([]); setSelectedFiles(null);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                + Add New Property
              </button>
            )}
          </div>

          {/* TAB BAR */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🏠 Properties & Photos ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              📅 Bookings & iCal ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🧹 Tasks & Staff ({tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'financials' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              💰 Financials & Ledger (${netProfit.toLocaleString()})
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'services' ? 'bg-amber-500 text-black shadow-lg font-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              ✨ Upsell Services ({services.length})
            </button>
          </div>
        </section>

        {/* 1. PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-white">Managed Properties Catalog</h2>
              <a href="/properties" className="text-xs text-amber-400 font-bold hover:underline">View Public Catalog →</a>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                No properties found. Click "+ Add New Property" above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {properties.map(p => {
                  let imageList: string[] = []
                  try {
                    imageList = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [])
                  } catch (e) {
                    imageList = []
                  }
                  const mainImg = imageList.length > 0 ? imageList[0] : null
                  const displayPrice = p.price_per_night || p.nightly_price || p.price || 0

                  return (
                    <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="relative h-48 bg-neutral-950">
                          {mainImg ? (
                            <img src={mainImg} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-bold">📷 No Photos</div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            📷 {imageList.length} Photos
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="font-extrabold text-white text-sm line-clamp-1">{p.title}</h3>
                          <p className="text-xs text-neutral-400">📍 {p.location || 'Kampala, Uganda'}</p>
                          <p className="text-xs text-amber-500 font-extrabold">${displayPrice} / night</p>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          onClick={() => {
                            setEditingProperty(p); setIsAddingNew(false); setPropTitle(p.title || '');
                            setPropCategory(p.category || 'Apartment'); setPropPrice(String(p.price_per_night || p.price || ''));
                            setPropLocation(p.location || ''); setPropDescription(p.description || ''); setExistingImages(imageList);
                          }}
                          className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl border border-neutral-700 transition cursor-pointer"
                        >
                          ✏️ Edit Property & Photos
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* 2. BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <h2 className="text-base font-extrabold text-white">Guest Reservation Requests</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                No reservation requests submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map(b => {
                  const status = b.status || 'Pending Host Review'
                  const isApproved = status.toLowerCase().includes('confirm') || status.toLowerCase().includes('approv')
                  return (
                    <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-white text-sm">{b.property_name}</h3>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                          isApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-300 space-y-1">
                        <p>👤 <strong className="text-white">Guest:</strong> {b.guest_name}</p>
                        <p>💬 <strong className="text-white">WhatsApp:</strong> {b.phone_number}</p>
                        <p>📅 <strong className="text-white">Dates:</strong> {b.check_in} to {b.check_out}</p>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => {
                            const cleanPhone = (b.phone_number || '').replace(/[^0-9]/g, '')
                            window.open(`https://wa.me/${cleanPhone}?text=Hello%20${b.guest_name},%20regarding%20your%20stay%20at%20La%20Estancia...`, '_blank')
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl"
                        >
                          💬 Message Guest on WhatsApp
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, isApproved ? 'Pending Host Review' : 'Confirmed')}
                            className="py-1.5 bg-neutral-800 text-xs font-bold text-neutral-300 rounded-xl"
                          >
                            {isApproved ? '↩︎ Mark Pending' : '✓ Approve'}
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl"
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
          </section>
        )}

        {/* 3. TASKS TAB */}
        {activeTab === 'tasks' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit shadow-xl">
                <h2 className="text-sm font-extrabold text-white">Dispatch Task</h2>
                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">TASK</label>
                    <input type="text" required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Cleaning & Linens" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">PROPERTY</label>
                    <input type="text" required value={taskProperty} onChange={e => setTaskProperty(e.target.value)} placeholder="Entebbe Villa" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">STAFF</label>
                      <input type="text" required value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} placeholder="John" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">WHATSAPP</label>
                      <input type="text" required value={taskStaffPhone} onChange={e => setTaskStaffPhone(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">PRIORITY</label>
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">DUE DATE</label>
                      <input type="date" required value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl">Add Task</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Active Tasks</h2>
                {tasks.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">No tasks added.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map(t => (
                      <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                        <h3 className="font-extrabold text-white text-sm">{t.title}</h3>
                        <p className="text-xs text-neutral-400">🏠 {t.property_name} • 👤 {t.assignee_name}</p>
                        <div className="flex gap-2">
                          <button onClick={() => window.open(`https://wa.me/${(t.staff_phone||'').replace(/[^0-9]/g,'')}?text=Task:%20${t.title}`, '_blank')} className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">WhatsApp Staff</button>
                          <button onClick={() => handleDeleteTask(t.id)} className="py-2 px-3 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 4. FINANCIALS TAB */}
        {activeTab === 'financials' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-bold">Total Income</span>
                <p className="text-2xl font-black text-emerald-400">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-bold">Total Expenses</span>
                <p className="text-2xl font-black text-red-400">${totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs text-neutral-400 font-bold">Net Profit</span>
                <p className="text-2xl font-black text-amber-500">${netProfit.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit">
                <h2 className="text-sm font-extrabold text-white">Add Financial Entry</h2>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">TITLE</label>
                    <input type="text" required value={transTitle} onChange={e => setTransTitle(e.target.value)} placeholder="UMEME Token" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">TYPE</label>
                      <select value={transType} onChange={e => setTransType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                        <option value="Expense">Expense</option>
                        <option value="Income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">CATEGORY</label>
                      <select value={transCategory} onChange={e => setTransCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                        <option value="Rent">Rent</option>
                        <option value="UMEME">UMEME</option>
                        <option value="Gas">Gas</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">AMOUNT ($)</label>
                      <input type="number" required value={transAmount} onChange={e => setTransAmount(e.target.value)} placeholder="40" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">DATE</label>
                      <input type="date" required value={transDate} onChange={e => setTransDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl">Save Entry</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Ledger History</h2>
                {financials.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">No entries recorded.</div>
                ) : (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
                    {financials.map(f => (
                      <div key={f.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-xs">{f.title} <span className="text-[10px] text-neutral-400">({f.category})</span></p>
                          <p className="text-[10px] text-neutral-500">{f.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-sm ${f.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {f.type === 'Income' ? '+' : '-'}${f.amount}
                          </span>
                          <button onClick={() => handleDeleteTransaction(f.id)} className="text-neutral-500 hover:text-red-400">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. SERVICES TAB */}
        {activeTab === 'services' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit">
                <h2 className="text-sm font-extrabold text-white">Add Upsell Service</h2>
                <form onSubmit={handleAddService} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">SERVICE TITLE</label>
                    <input type="text" required value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="Airport Pickup" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">CATEGORY</label>
                    <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                      <option value="Transportation">Transportation</option>
                      <option value="Dining & Meals">Dining & Meals</option>
                      <option value="Cleaning & Laundry">Cleaning & Laundry</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">COMPANY</label>
                      <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ewright Cabs" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">PRICE ($)</label>
                      <input type="number" required value={servicePrice} onChange={e => setServicePrice(e.target.value)} placeholder="45" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">WHATSAPP CONTACT</label>
                    <input type="text" required value={whatsappContact} onChange={e => setWhatsappContact(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl">Publish Service</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Active Upsell Services</h2>
                {services.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">No services added yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(s => (
                      <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{s.category}</span>
                          <span className="font-black text-amber-500">${s.price}</span>
                        </div>
                        <h3 className="font-extrabold text-white text-sm">{s.service_name}</h3>
                        <p className="text-xs text-neutral-400">{s.company_name}</p>
                        <button onClick={() => window.open(`https://wa.me/${(s.whatsapp_contact||'').replace(/[^0-9]/g,'')}?text=I%20want%20to%20book%20${s.service_name}`, '_blank')} className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">Book via WhatsApp</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* EDIT / ADD PROPERTY MODAL */}
      {(editingProperty || isAddingNew) && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="font-extrabold text-white text-base">{isAddingNew ? 'Add Property' : 'Edit Property'}</h3>
              <button onClick={() => { setEditingProperty(null); setIsAddingNew(false); }} className="text-neutral-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] text-neutral-400 font-bold block mb-1">TITLE</label>
                <input type="text" required value={propTitle} onChange={e => setPropTitle(e.target.value)} placeholder="Luxury Villa" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">CATEGORY</label>
                  <select value={propCategory} onChange={e => setPropCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                    <option value="Apartment">Apartment</option>
                    <option value="Standalone House">Standalone House</option>
                    <option value="Mansion">Mansion</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">PRICE / NIGHT ($)</label>
                  <input type="number" required value={propPrice} onChange={e => setPropPrice(e.target.value)} placeholder="100" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 font-bold block mb-1">LOCATION</label>
                <input type="text" required value={propLocation} onChange={e => setPropLocation(e.target.value)} placeholder="Entebbe" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 font-bold block mb-1">DESCRIPTION</label>
                <textarea rows={3} value={propDescription} onChange={e => setPropDescription(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white resize-none" />
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="text-[10px] text-amber-500 font-extrabold block uppercase">Upload Gallery Photos</label>
                <input type="file" multiple accept="image/*" onChange={e => setSelectedFiles(e.target.files)} className="w-full text-xs text-neutral-400 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-500 file:text-black font-bold cursor-pointer" />
                {uploading && <p className="text-xs text-amber-500 animate-pulse">Uploading...</p>}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                {editingProperty ? (
                  <button type="button" onClick={() => handleDeleteProperty(editingProperty.id)} className="text-xs text-red-500 font-bold">Delete Property</button>
                ) : <div />}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditingProperty(null); setIsAddingNew(false); }} className="px-4 py-2 bg-neutral-800 text-xs text-white rounded-xl">Cancel</button>
                  <button type="submit" disabled={loading || uploading} className="px-5 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}