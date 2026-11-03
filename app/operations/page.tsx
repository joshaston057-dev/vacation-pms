'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

const AVAILABLE_AMENITIES = [
  'Free High-Speed WiFi',
  'Swimming Pool',
  'Standby Generator / Inverter',
  'Air Conditioning',
  'Fully Equipped Kitchen',
  'Private Parking',
  '24/7 Security / CCTV',
  'Washing Machine',
  'Smart TV / Netflix',
  'Balcony / City View',
  'Gym / Fitness Center',
  'Elevator Access'
]

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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
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

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity))
    } else {
      setSelectedAmenities([...selectedAmenities, amenity])
    }
  }

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

    // Pass amenities as a direct array to support Supabase text[] column
    const payload: any = {
      title: propTitle,
      category: propCategory,
      price_per_night: parseFloat(propPrice) || 0,
      location: propLocation,
      description: propDescription,
      images: JSON.stringify(finalImages),
      amenities: selectedAmenities
    }

    let res = isAddingNew
      ? await supabase.from('properties').insert([payload])
      : await supabase.from('properties').update(payload).eq('id', editingProperty.id)

    let error = res.error

    // Fallback if 'amenities' column doesn't exist or requires JSON string
    if (error && error.message.toLowerCase().includes('amenities')) {
      payload.amenities = JSON.stringify(selectedAmenities)
      let retry = isAddingNew
        ? await supabase.from('properties').insert([payload])
        : await supabase.from('properties').update(payload).eq('id', editingProperty.id)
      error = retry.error
    }

    if (error) {
      alert('Error saving property: ' + error.message)
    } else {
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

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchAllData()
  }

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Delete booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    fetchAllData()
  }

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
                  setPropPrice(''); setPropLocation(''); setPropDescription(''); setSelectedAmenities([]); setExistingImages([]); setSelectedFiles(null);
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
            ></button>