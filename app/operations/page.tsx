'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPortal() {
  // Tabs: 'properties' | 'bookings' | 'tasks' | 'financials' | 'services'
  const [activeTab, setActiveTab] = useState('tasks')

  // Core Data States
  const [services, setServices] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [financials, setFinancials] = useState<any[]>([])

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
  const [transType, setTransType] = useState('Expense') // 'Income' or 'Expense'
  const [transCategory, setTransCategory] = useState('Rent') // Rent, Gas, UMEME, Internet, Maintenance, Guest Payout
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
    fetchServices()
    fetchBookings()
    fetchProperties()
    fetchTasks()
    fetchFinancials()
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

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: false })
    if (data) setTasks(data)
  }

  const fetchFinancials = async () => {
    const { data } = await supabase.from('financials').select('*').order('id', { ascending: false })
    if (data) setFinancials(data)
  }

  // TASK MANAGEMENT
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newTask = {
      title: taskTitle,
      property_name: taskProperty,
      assignee_name: taskAssignee,
      staff_phone: taskStaffPhone,
      priority: taskPriority,
      due_date: taskDueDate,
      status: 'Pending Assignment'
    }

    const { error } = await supabase.from('tasks').insert([newTask])

    if (error) {
      alert('Failed to add task. Make sure a "tasks" table exists in Supabase or run migration.')
    } else {
      setTaskTitle('')
      setTaskProperty('')
      setTaskAssignee('')
      setTaskStaffPhone('')
      setTaskPriority('Medium')
      setTaskDueDate('')
      fetchTasks()
    }
    setLoading(false)
  }

  const handleUpdateTaskStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    if (!error) fetchTasks()
  }

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) fetchTasks()
  }

  // FINANCIAL LEDGER MANAGEMENT
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newTransaction = {
      title: transTitle,
      type: transType,
      category: transCategory,
      amount: parseFloat(transAmount) || 0,
      date: transDate || new Date().toISOString().split('T')[0],
      property_name: transProperty
    }

    const { error } = await supabase.from('financials').insert([newTransaction])

    if (error) {
      alert('Failed to add record. Make sure a "financials" table exists in Supabase.')
    } else {
      setTransTitle('')
      setTransAmount('')
      setTransProperty('')
      setTransDate('')
      fetchFinancials()
    }
    setLoading(false)
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Delete this financial entry?')) return
    const { error } = await supabase.from('financials').delete().eq('id', id)
    if (!error) fetchFinancials()
  }

  // CALCULATE FINANCIAL SUMMARY
  const totalIncome = financials.filter(f => f.type === 'Income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalExpenses = financials.filter(f => f.type === 'Expense').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const netProfit = totalIncome - totalExpenses

  // PROPERTY GALLERY UPLOADER
  const uploadGalleryPhotos = async (files: FileList): Promise<string[]> => {
    setUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `properties/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file)

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

    const propertyPayload = {
      title: propTitle,
      category: propCategory,
      price_per_night: parseFloat(propPrice) || 0,
      location: propLocation,
      description: propDescription,
      images: JSON.stringify(finalImages)
    }

    let error
    if (isAddingNew) {
      const res = await supabase.from('properties').insert([propertyPayload])
      error = res.error
    } else if (editingProperty) {
      const res = await supabase.from('properties').update(propertyPayload).eq('id', editingProperty.id)
      error = res.error
    }

    if (error) {
      alert('Failed to save property.')
    } else {
      setEditingProperty(null)
      setIsAddingNew(false)
      fetchProperties()
    }
    setLoading(false)
  }

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

          {/* MAIN PMS SUB-NAVIGATION BAR */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🏠 Properties & Photos ({properties.length})
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              📅 Bookings & iCal ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              🧹 Tasks & Staff ({tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'financials'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              💰 Financials & Ledger (${netProfit.toLocaleString()})
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              ✨ Upsell Services ({services.length})
            </button>
          </div>
        </section>

        {/* 1. TASKS & STAFF MODULE */}
        {activeTab === 'tasks' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* ADD TASK FORM */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit shadow-xl">
                <h2 className="text-sm font-extrabold text-white">Dispatch New Operational Task</h2>
                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">TASK DESCRIPTION</label>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      placeholder="e.g. Turn-over cleaning & fresh linens"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">ASSIGN PROPERTY</label>
                    <input
                      type="text"
                      required
                      value={taskProperty}
                      onChange={e => setTaskProperty(e.target.value)}
                      placeholder="e.g. Entebbe Villa / Kisaasi Apt"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">STAFF MEMBER</label>
                      <input
                        type="text"
                        required
                        value={taskAssignee}
                        onChange={e => setTaskAssignee(e.target.value)}
                        placeholder="John Cleaners"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">STAFF WHATSAPP</label>
                      <input
                        type="text"
                        required
                        value={taskStaffPhone}
                        onChange={e => setTaskStaffPhone(e.target.value)}
                        placeholder="+256..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">PRIORITY</label>
                      <select
                        value={taskPriority}
                        onChange={e => setTaskPriority(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Low">🟢 Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">DUE DATE</label>
                      <input
                        type="date"
                        required
                        value={taskDueDate}
                        onChange={e => setTaskDueDate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer mt-2"
                  >
                    Dispatch Task
                  </button>
                </form>
              </div>

              {/* TASKS LIST GRID */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Active Staff Tasks</h2>

                {tasks.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                    No active tasks dispatched. Create a task to assign work to turnover staff.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map(task => {
                      const isDone = task.status === 'Completed'
                      return (
                        <div key={task.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md border ${
                                task.priority === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}>
                                {task.priority} Priority
                              </span>
                              <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md ${
                                isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {task.status}
                              </span>
                            </div>

                            <h3 className="font-extrabold text-white text-sm">{task.title}</h3>
                            <div className="text-xs text-neutral-400 space-y-1">
                              <p>🏠 <strong className="text-neutral-200">Property:</strong> {task.property_name}</p>
                              <p>👤 <strong className="text-neutral-200">Assignee:</strong> {task.assignee_name}</p>
                              <p>📅 <strong className="text-neutral-200">Due:</strong> {task.due_date}</p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-neutral-800">
                            <button
                              onClick={() => {
                                const cleanPhone = (task.staff_phone || '').replace(/[^0-9]/g, '')
                                const msg = encodeURIComponent(`Hello ${task.assignee_name}, you have a new task assigned for ${task.property_name}: ${task.title}. Due date: ${task.due_date}. Please confirm.`)
                                window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
                              }}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
                            >
                              💬 Dispatch via WhatsApp
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, isDone ? 'Pending' : 'Completed')}
                                className="py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 rounded-xl"
                              >
                                {isDone ? 'Mark Pending' : '✓ Mark Done'}
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl"
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
              </div>

            </div>
          </section>
        )}

        {/* 2. FINANCIAL PLANNING & LEDGER MODULE */}
        {activeTab === 'financials' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            
            {/* METRICS SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">Total Revenue / Income</span>
                <p className="text-2xl font-black text-emerald-400">${totalIncome.toLocaleString()}</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">Operational Bills & Costs</span>
                <p className="text-2xl font-black text-red-400">${totalExpenses.toLocaleString()}</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block mb-1">Net Host Profit</span>
                <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
                  ${netProfit.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* ADD ENTRY FORM */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 h-fit shadow-xl">
                <h2 className="text-sm font-extrabold text-white">Add Financial Entry / Bill</h2>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">ENTRY DESCRIPTION</label>
                    <input
                      type="text"
                      required
                      value={transTitle}
                      onChange={e => setTransTitle(e.target.value)}
                      placeholder="e.g. UMEME Power Token / Gas Refill / Rent"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">ENTRY TYPE</label>
                      <select
                        value={transType}
                        onChange={e => setTransType(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Expense">🔻 Expense / Bill</option>
                        <option value="Income">🟢 Income / Payout</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">CATEGORY</label>
                      <select
                        value={transCategory}
                        onChange={e => setTransCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Rent">Rent Payout</option>
                        <option value="UMEME">UMEME Electricity</option>
                        <option value="Gas">Gas Refill</option>
                        <option value="Internet">Internet / WiFi</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Guest Payout">Guest Booking Income</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">AMOUNT ($)</label>
                      <input
                        type="number"
                        required
                        value={transAmount}
                        onChange={e => setTransAmount(e.target.value)}
                        placeholder="50"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold block mb-1">DATE</label>
                      <input
                        type="date"
                        required
                        value={transDate}
                        onChange={e => setTransDate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">PROPERTY NAME</label>
                    <input
                      type="text"
                      value={transProperty}
                      onChange={e => setTransProperty(e.target.value)}
                      placeholder="e.g. Entebbe Villa"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer mt-2"
                  >
                    Save Financial Entry
                  </button>
                </form>
              </div>

              {/* FINANCIAL LEDGER TABLE */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-extrabold text-white">Operations Ledger & Expenses</h2>

                {financials.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                    No financial transactions recorded. Log operational costs like UMEME, rent, or gas above.
                  </div>
                ) : (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="divide-y divide-neutral-800">
                      {financials.map(item => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-950/50 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                item.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {item.category}
                              </span>
                              <h3 className="font-bold text-white text-xs">{item.title}</h3>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              📍 {item.property_name || 'General Operations'} • 📅 {item.date}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`font-black text-sm ${item.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {item.type === 'Income' ? '+' : '-'}${Number(item.amount).toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDeleteTransaction(item.id)}
                              className="text-neutral-500 hover:text-red-400 text-xs font-bold p-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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