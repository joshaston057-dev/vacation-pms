'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const AVAILABLE_AMENITIES = [
  '📶 High-Speed Wi-Fi',
  '🏊 Swimming Pool',
  '⚡ Standby Generator / Inverter',
  '❄️ Air Conditioning',
  '🛡️ 24/7 Security / CCTV',
  '🌅 Balcony / City View',
  '🚗 Private Parking',
  '🍳 Fully Equipped Kitchen',
  '🧺 Washing Machine',
  '📺 Smart TV / Netflix',
  '🏋️ Gym / Fitness Center',
  '🧹 Daily Housekeeping',
  '💻 Dedicated Workspace',
  '🛗 Elevator Access',
  '🧱 Perimeter Wall / Gate'
]

export default function OperationsPage() {
  const [isLocked, setIsLocked] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [passError, setPassError] = useState(false)

  const [activeTab, setActiveTab] = useState('properties')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])

  // New Property State
  const [newPropTitle, setNewPropTitle] = useState('')
  const [newPropPrice, setNewPropPrice] = useState('')
  const [newPropLocation, setNewPropLocation] = useState('')
  const [newPropDesc, setNewPropDesc] = useState('')
  const [newPropAmenities, setNewPropAmenities] = useState<string[]>([])
  const [newPropImages, setNewPropImages] = useState<string[]>([])

  // Edit Property Modal State
  const [editingProp, setEditingProp] = useState<any | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editAmenities, setEditAmenities] = useState<string[]>([])
  const [editImages, setEditImages] = useState<string[]>([])

  // Booking Form State
  const [manualGuest, setManualGuest] = useState('')
  const [manualPhone, setManualPhone] = useState('256757386946')
  const [manualProp, setManualProp] = useState('')
  const [manualCheckIn, setManualCheckIn] = useState('')
  const [manualCheckOut, setManualCheckOut] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [manualIcal, setManualIcal] = useState('')

  // Tasks Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProp, setTaskProp] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskPhone, setTaskPhone] = useState('256757386946')
  const [taskDueDate, setTaskDueDate] = useState('')

  // Financials Form State
  const [expDesc, setExpDesc] = useState('')
  const [expCategory, setExpCategory] = useState('Rent')
  const [expAmount, setExpAmount] = useState('')

  // Upsell Services State
  const [serviceName, setServiceName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('Transportation')
  const [servicePrice, setServicePrice] = useState('')
  const [servicePhone, setServicePhone] = useState('256757386946')
  const [services, setServices] = useState<any[]>([
    { id: '1', category: 'Transportation', name: 'Airport Pickup & Dropoff', price: 45, whatsapp_number: '256757386946' },
    { id: '2', category: 'Dining', name: 'Private Chef Meal Prep', price: 60, whatsapp_number: '256780564778' },
    { id: '3', category: 'Cleaning', name: 'Mid-Stay Deep Cleaning', price: 25, whatsapp_number: '256757386946' },
  ])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: p } = await supabase.from('properties').select('*')
    const { data: b } = await supabase.from('bookings').select('*')
    const { data: t } = await supabase.from('tasks').select('*')
    const { data: e } = await supabase.from('expenses').select('*')

    if (p) setProperties(p)
    if (b) setBookings(b)
    if (t) setTasks(t)
    if (e) setExpenses(e)
  }

  const handleAmenityToggle = (amenity: string) => {
    if (newPropAmenities.includes(amenity)) {
      setNewPropAmenities(newPropAmenities.filter(a => a !== amenity))
    } else {
      setNewPropAmenities([...newPropAmenities, amenity])
    }
  }

  const handleEditAmenityToggle = (amenity: string) => {
    if (editAmenities.includes(amenity)) {
      setEditAmenities(editAmenities.filter(a => a !== amenity))
    } else {
      setEditAmenities([...editAmenities, amenity])
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(images => {
      setNewPropImages(images)
    })
  }

  const removeNewPhoto = (indexToRemove: number) => {
    setNewPropImages(newPropImages.filter((_, idx) => idx !== indexToRemove))
  }

  const handleEditPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(newImages => {
      setEditImages(prev => [...prev, ...newImages].slice(0, 10))
    })
  }

  const removeEditPhoto = (indexToRemove: number) => {
    setEditImages(editImages.filter((_, idx) => idx !== indexToRemove))
  }

  const addProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = { 
      id: Date.now().toString(), 
      title: newPropTitle, 
      price_per_night: parseFloat(newPropPrice) || 0, 
      location: newPropLocation || 'Kampala', 
      description: newPropDesc,
      amenities: newPropAmenities,
      is_occupied: false,
      images: newPropImages
    }
    setProperties([item, ...properties])
    await supabase.from('properties').insert([item])
    setNewPropTitle(''); setNewPropPrice(''); setNewPropLocation(''); setNewPropDesc(''); setNewPropAmenities([]); setNewPropImages([])
  }

  const openEditModal = (p: any) => {
    setEditingProp(p)
    setEditTitle(p.title || '')
    setEditPrice(p.price_per_night ? p.price_per_night.toString() : '')
    setEditLocation(p.location || '')
    setEditDesc(p.description || '')
    setEditAmenities(Array.isArray(p.amenities) ? p.amenities : [])
    setEditImages(Array.isArray(p.images) ? p.images : [])
  }

  const savePropertyEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProp) return

    const updatedData = {
      title: editTitle,
      price_per_night: parseFloat(editPrice) || 0,
      location: editLocation,
      description: editDesc,
      amenities: editAmenities,
      images: editImages
    }

    setProperties(properties.map(item => item.id === editingProp.id ? { ...item, ...updatedData } : item))
    
    const { error } = await supabase
      .from('properties')
      .update(updatedData)
      .eq('id', editingProp.id)

    if (error) {
      console.error('Supabase update error:', error.message)
      alert('Failed to save to database: ' + error.message)
    } else {
      setEditingProp(null)
    }
  }

  const deleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property listing?')) return
    setProperties(properties.filter(p => p.id !== id))
    await supabase.from('properties').delete().eq('id', id)
  }

  const toggleOccupancy = async (id: string, current: boolean) => {
    const next = !current
    setProperties(properties.map(item => item.id === id ? { ...item, is_occupied: next } : item))
    await supabase.from('properties').update({ is_occupied: next }).eq('id', id)
  }

  const addManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = { 
      id: Date.now().toString(), 
      guest_name: manualGuest, 
      phone_number: manualPhone,
      property_name: manualProp, 
      check_in: manualCheckIn, 
      check_out: manualCheckOut, 
      total_price: parseFloat(manualPrice) || 0, 
      status: 'Confirmed',
      ical_link: manualIcal
    }
    setBookings([item, ...bookings])
    await supabase.from('bookings').insert([item])
    setManualGuest(''); setManualProp(''); setManualCheckIn(''); setManualCheckOut(''); setManualPrice(''); setManualIcal('')
  }

  const addCustomService = (e: React.FormEvent) => {
    e.preventDefault()
    const item = {
      id: Date.now().toString(),
      name: serviceName,
      category: serviceCategory,
      price: parseFloat(servicePrice) || 0,
      whatsapp_number: servicePhone
    }
    setServices([item, ...services])
    setServiceName(''); setServicePrice('')
  }

  const confirmBooking = async (id: string) => {
    setBookings(bookings.map(item => item.id === id ? { ...item, status: 'Confirmed' } : item))
    await supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', id)
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this reservation?')) return
    setBookings(bookings.filter(item => item.id !== id))
    await supabase.from('bookings').delete().eq('id', id)
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = { id: Date.now().toString(), title: taskTitle, property_name: taskProp, assigned_to: taskAssignee, phone_number: taskPhone, due_date: taskDueDate, status: 'Unfinished' }
    setTasks([item, ...tasks])
    await supabase.from('tasks').insert([item])
    setTaskTitle(''); setTaskProp(''); setTaskAssignee(''); setTaskDueDate('')
  }

  const toggleTask = async (id: string, current: string) => {
    const next = current === 'Unfinished' ? 'Finished' : 'Unfinished'
    setTasks(tasks.map(t => t.id === id ? { ...t, status: next } : t))
    await supabase.from('tasks').update({ status: next }).eq('id', id)
  }

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = { id: Date.now().toString(), description: expDesc, category: expCategory, amount: parseFloat(expAmount) || 0, date: new Date().toISOString().split('T')[0] }
    setExpenses([item, ...expenses])
    await supabase.from('expenses').insert([item])
    setExpDesc(''); setExpAmount('')
  }

  const totalEarned = bookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + (b.total_price || 0), 0)
  const totalBills = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const netIncome = totalEarned - totalBills

  const unlockPortal = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPass = passcode.trim().toLowerCase()
    if (cleanPass === '1234' || cleanPass === 'admin' || cleanPass === '2026') {
      setIsLocked(false)
      setPassError(false)
    } else {
      setPassError(true)
    }
  }

  if (isLocked) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
        <HeaderNav />
        <div className="max-w-md mx-auto p-8 bg-neutral-900 border border-neutral-800 rounded-2xl my-20 space-y-4 text-center">
          <span className="text-4xl">🔒</span>
          <h2 className="text-xl font-extrabold text-white">Host Security Gateway</h2>
          <p className="text-xs text-neutral-400">Portal is currently locked. Enter passcode to access operations.</p>
          <form onSubmit={unlockPortal} className="space-y-3">
            <input 
              type="password" 
              placeholder="Enter passcode (1234)" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-center text-xs text-white"
            />
            {passError && <p className="text-xs text-red-400 font-bold">Incorrect passcode.</p>}
            <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Unlock Portal</button>
          </form>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <div>
              <h1 className="text-2xl font-extrabold text-white">La Estancia Host Operations Portal</h1>
              <p className="text-xs text-neutral-400 mt-1">Centralized PMS: Manage Properties, Bookings, Staff, Finances, and Services.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsLocked(true)} className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-amber-400 font-bold text-xs rounded-xl cursor-pointer">
                🔒 Lock Portal
              </button>
              <Link href="/properties" className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow">
                View Public Catalog
              </Link>
            </div>
          </div>

          {/* 5 TABS NAVIGATION */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
            {[
              { id: 'properties', label: '🏠 Properties & Photos' },
              { id: 'bookings', label: '📅 Bookings & iCal' },
              { id: 'tasks', label: '🧹 Tasks & Staff' },
              { id: 'financials', label: '💰 Financials & Ledger' },
              { id: 'services', label: '✨ Upsell Services' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                  activeTab === tab.id ? 'bg-amber-500 text-black shadow-lg scale-105' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={addProperty} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">+ Add New Property</h3>
                <input type="text" required placeholder="Title (e.g. 1 Bed Luxury Apartment)" value={newPropTitle} onChange={e => setNewPropTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="number" required placeholder="Price per night ($)" value={newPropPrice} onChange={e => setNewPropPrice(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" placeholder="Location (e.g. Kisaasi, Kampala)" value={newPropLocation} onChange={e => setNewPropLocation(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                
                {/* DESCRIPTION */}
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Property Description</label>
                  <textarea 
                    rows={3} 
                    placeholder="Describe the stay, views, neighborhood, and guest access..." 
                    value={newPropDesc} 
                    onChange={e => setNewPropDesc(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" 
                  />
                </div>

                {/* AMENITIES CHECKLIST */}
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Amenities Checklist</label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl p-2">
                    {AVAILABLE_AMENITIES.map(amenity => (
                      <label key={amenity} className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newPropAmenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="accent-amber-500 rounded"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                {/* PHOTOS UPLOAD WITH REMOVE BUTTONS */}
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Property Photos (Up to 5)</label>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-400" />
                  {newPropImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-1.5 mt-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                      {newPropImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-800">
                          <img src={img} className="w-full h-12 object-cover" alt={`Preview ${idx + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(idx)}
                            className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Save New Property</button>
              </form>

              {/* LIST OF MANAGED PROPERTIES WITH EDIT / DELETE BUTTONS */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                {properties.map(p => (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      {p.images && p.images.length > 0 && (
                        <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden mb-2">
                          {p.images.slice(0, 5).map((img: string, i: number) => (
                            <img key={i} src={img} className="h-16 w-full object-cover" alt="Property" />
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-white text-sm">{p.title}</h3>
                        <span className="text-amber-500 font-bold text-xs px-2 py-0.5 rounded bg-amber-500/10">${p.price_per_night}/n</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">📍 {p.location || 'Kampala'}</p>
                      
                      {p.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-2 italic mt-2">"{p.description}"</p>
                      )}

                      {p.amenities && p.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.amenities.map((a: string, idx: number) => (
                            <span key={idx} className="text-[9px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-3 border-t border-neutral-800">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${p.is_occupied ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {p.is_occupied ? '🔴 Occupied' : '🟢 Available'}
                        </span>
                        <button onClick={() => toggleOccupancy(p.id, p.is_occupied)} className="px-2.5 py-1 bg-neutral-800 text-amber-400 text-xs font-bold rounded-lg cursor-pointer">
                          Toggle Status
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button 
                          onClick={() => openEditModal(p)} 
                          className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-extrabold rounded-xl transition cursor-pointer"
                        >
                          ✏️ Edit Property
                        </button>
                        <button 
                          onClick={() => deleteProperty(p.id)} 
                          className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/40 text-xs font-extrabold rounded-xl transition cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT PROPERTY MODAL WITH PHOTO DELETE BUTTONS */}
          {editingProp && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <h3 className="font-extrabold text-amber-500 text-base">✏️ Edit Property Details</h3>
                  <button onClick={() => setEditingProp(null)} className="text-neutral-400 hover:text-white font-bold text-sm">✕ Close</button>
                </div>

                <form onSubmit={savePropertyEdit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Property Title</label>
                    <input type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Nightly Rate ($)</label>
                      <input type="number" required value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Location</label>
                      <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Description</label>
                    <textarea rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1 font-bold">Amenities Checklist</label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl p-2">
                      {AVAILABLE_AMENITIES.map(amenity => (
                        <label key={amenity} className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editAmenities.includes(amenity)}
                            onChange={() => handleEditAmenityToggle(amenity)}
                            className="accent-amber-500 rounded"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* MANAGE PHOTOS WITH ✕ BUTTON */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-neutral-400 font-bold">Current Photos ({editImages.length})</label>
                      <span className="text-[9px] text-amber-400">Click ✕ to remove photo</span>
                    </div>

                    {editImages.length > 0 ? (
                      <div className="grid grid-cols-5 gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                        {editImages.map((img, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-800">
                            <img src={img} className="w-full h-14 object-cover" alt={`Photo ${idx + 1}`} />
                            <button
                              type="button"
                              onClick={() => removeEditPhoto(idx)}
                              className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow"
                              title="Delete photo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 italic p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-center">No photos attached.</p>
                    )}

                    <div className="mt-2">
                      <label className="text-[10px] text-neutral-400 block mb-1 font-bold">+ Upload Additional Photos</label>
                      <input type="file" multiple accept="image/*" onChange={handleEditPhotoAdd} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-400" />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setEditingProp(null)} className="py-2.5 px-4 bg-neutral-800 text-neutral-300 font-extrabold text-xs rounded-xl cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={addManualBooking} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">+ Add Manual Booking</h3>
                <input type="text" required placeholder="Guest Name" value={manualGuest} onChange={e => setManualGuest(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="WhatsApp Contact" value={manualPhone} onChange={e => setManualPhone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="Property Name" value={manualProp} onChange={e => setManualProp(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" required value={manualCheckIn} onChange={e => setManualCheckIn(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <input type="date" required value={manualCheckOut} onChange={e => setManualCheckOut(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <input type="number" required placeholder="Agreed Rate ($)" value={manualPrice} onChange={e => setManualPrice(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="url" placeholder="iCal Link (Airbnb / VRBO Sync)" value={manualIcal} onChange={e => setManualIcal(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Save & Confirm</button>
              </form>

              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-sm font-bold text-white">All Reservations & iCal Feeds</h2>
                {bookings.map(b => (
                  <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm">{b.guest_name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {b.status || 'Pending Host Review'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">📅 {b.check_in} to {b.check_out} | 📍 {b.property_name}</p>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-amber-500 font-extrabold text-base">${b.total_price}</span>
                        <div className="flex items-center gap-2">
                          {b.status !== 'Confirmed' && (
                            <button onClick={() => confirmBooking(b.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer">Approve</button>
                          )}
                          <a href={`https://wa.me/${b.phone_number || '256757386946'}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                            💬 Message
                          </a>
                          <button onClick={() => deleteBooking(b.id)} className="px-2 py-1.5 bg-red-950 text-red-400 text-xs font-bold rounded-lg cursor-pointer">🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={addTask} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">Assign Staff Task</h3>
                <input type="text" required placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="Property Name" value={taskProp} onChange={e => setTaskProp(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="Staff Name" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="WhatsApp Contact" value={taskPhone} onChange={e => setTaskPhone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="date" required value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Assign Task</button>
              </form>
              <div className="lg:col-span-2 space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-white text-xs">{t.title}</h4>
                      <p className="text-xs text-neutral-400">{t.property_name} - Staff: {t.assigned_to}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${t.phone_number}?text=${encodeURIComponent(`Hello ${t.assigned_to}, task update: ${t.title}`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">💬 WhatsApp Staff</a>
                      <button onClick={() => toggleTask(t.id, t.status)} className="px-3 py-1.5 bg-neutral-800 text-amber-400 text-xs font-bold rounded-lg cursor-pointer">{t.status}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl"><span className="text-xs text-neutral-400">Revenue</span><h3 className="text-xl font-bold text-emerald-400">${totalEarned}</h3></div>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl"><span className="text-xs text-neutral-400">Bills</span><h3 className="text-xl font-bold text-red-400">${totalBills}</h3></div>
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl"><span className="text-xs text-neutral-400">Net Profit</span><h3 className="text-xl font-bold text-amber-400">${netIncome}</h3></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={addExpense} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                  <h3 className="font-extrabold text-amber-500 text-sm">Log Expense / Bill</h3>
                  <input type="text" required placeholder="Description (e.g. Rent)" value={expDesc} onChange={e => setExpDesc(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                    <option value="Rent">Rent</option>
                    <option value="Gas & Utilities">Gas & Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                  <input type="number" required placeholder="Amount ($)" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Log Expense</button>
                </form>
                <div className="lg:col-span-2 space-y-3">
                  {expenses.map(e => (
                    <div key={e.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                      <div><h4 className="font-bold text-white text-xs">{e.description}</h4><span className="text-[10px] text-amber-400">{e.category}</span></div>
                      <span className="text-red-400 font-bold text-xs">-${e.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UPSELL SERVICES */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={addCustomService} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 h-fit">
                <h3 className="font-extrabold text-amber-500 text-sm">+ Add Custom Service</h3>
                <p className="text-xs text-neutral-400 mb-2">Create custom upsell services for guests.</p>
                <input type="text" required placeholder="Service Name (e.g. Airport Pickup)" value={serviceName} onChange={e => setServiceName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white">
                  <option value="Transportation">Transportation</option>
                  <option value="Dining">Dining</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Concierge">Concierge</option>
                </select>
                <input type="number" required placeholder="Price ($)" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <input type="text" required placeholder="WhatsApp Contact" value={servicePhone} onChange={e => setServicePhone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl cursor-pointer">Add Service</button>
              </form>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                {services.map(s => (
                  <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{s.category}</span>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-amber-500 font-bold text-xs">${s.price}</p>
                    <a href={`https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(`Service request: ${s.name}`)}`} target="_blank" rel="noopener noreferrer" className="block text-center py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">💬 Contact Provider</a>
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