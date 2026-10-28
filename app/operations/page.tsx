'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Property {
  id: string
  title: string
  location: string
  price_per_night?: number
  price?: number
  bedrooms?: number
  bathrooms?: number
  guests?: number
  image_url?: string
  owner_id?: string
}

export default function EstanciaOSOperations() {
  const router = useRouter()
  const [loadingSession, setLoadingSession] = useState(true)
  const [activeTab, setActiveTab] = useState<'daily' | 'bookings' | 'concierge' | 'properties'>('daily')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // --- Daily Operations State ---
  const [dailyNotes, setDailyNotes] = useState('')
  const [cleaningStatus, setCleaningStatus] = useState('Pending')
  const [selectedProp, setSelectedProp] = useState('')
  const [dailyMsg, setDailyMsg] = useState('')

  // --- Bookings / iCal State ---
  const [guestName, setGuestName] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [icalUrl, setIcalUrl] = useState('')
  const [bookingMsg, setBookingMsg] = useState('')

  // --- Concierge State ---
  const [serviceTitle, setServiceTitle] = useState('')
  const [category, setCategory] = useState('Transport')
  const [servicePrice, setServicePrice] = useState('')
  const [description, setDescription] = useState('')
  const [serviceMsg, setServiceMsg] = useState('')

  // --- Property Portfolio State ---
  const [propertiesList, setPropertiesList] = useState<Property[]>([])
  const [loadingProps, setLoadingProps] = useState(false)
  const [propertyTitle, setPropertyTitle] = useState('')
  const [location, setLocation] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [maxGuests, setMaxGuests] = useState('2')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [propMsg, setPropMsg] = useState('')

  // --- HARD AUTHENTICATION GUARD ---
  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
      } else {
        setUserEmail(session.user.email ?? null)
        setLoadingSession(false)
      }
    }
    verifyAuth()
  }, [router])

  // --- Fetch Properties for Owner ---
  const fetchProperties = async () => {
    setLoadingProps(true)
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error.message)
      } else if (data) {
        setPropertiesList(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoadingProps(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'properties' && !loadingSession) {
      fetchProperties()
    }
  }, [activeTab, loadingSession])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // --- Handlers ---
  const handleLogDailyOp = async (e: React.FormEvent) => {
    e.preventDefault()
    setDailyMsg('✨ Daily operation status updated!')
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingMsg('')
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          guest_name: guestName,
          check_in: checkIn,
          check_out: checkOut,
          ical_url: icalUrl,
          property_title: selectedProp,
        },
      ])
      if (error) throw error
      setBookingMsg('✨ Booking & iCal sync logged successfully!')
      setGuestName('')
      setCheckIn('')
      setCheckOut('')
      setIcalUrl('')
    } catch (err: any) {
      setBookingMsg(`❌ Error: ${err.message}`)
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceMsg('')
    try {
      const { error } = await supabase.from('concierge_services').insert([
        {
          title: serviceTitle,
          category,
          price: parseFloat(servicePrice),
          description,
        },
      ])
      if (error) throw error
      setServiceMsg('✨ Concierge service published live!')
      setServiceTitle('')
      setServicePrice('')
      setDescription('')
    } catch (err: any) {
      setServiceMsg(`❌ Error: ${err.message}`)
    }
  }

  // Device file upload helper
  const uploadPropertyImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `listings/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error.message)
      return null
    }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setPropMsg('')
    setUploadingImage(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPropMsg('❌ Session expired. Please log in again.')
        router.replace('/login')
        return
      }

      let finalImageUrl = ''
      if (selectedFile) {
        const uploadedUrl = await uploadPropertyImage(selectedFile)
        if (!uploadedUrl) {
          setPropMsg('❌ Image upload failed. Please try again.')
          setUploadingImage(false)
          return
        }
        finalImageUrl = uploadedUrl
      }

      const { error } = await supabase.from('properties').insert([
        {
          title: propertyTitle,
          location,
          price_per_night: parseFloat(pricePerNight),
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          guests: parseInt(maxGuests),
          image_url: finalImageUrl,
          owner_id: user.id,
        },
      ])

      if (error) throw error

      setPropMsg('✨ Vacation property published live to catalogue!')
      setPropertyTitle('')
      setLocation('')
      setPricePerNight('')
      setMaxGuests('2')
      setBedrooms('1')
      setBathrooms('1')
      setSelectedFile(null)
      fetchProperties()
    } catch (err: any) {
      setPropMsg(`❌ Error: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteProperty = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
      setPropMsg(`🗑️ Deleted "${title}" successfully.`)
      fetchProperties()
    } catch (err: any) {
      setPropMsg(`❌ Error deleting property: ${err.message}`)
    }
  }

  // --- Loading Guard ---
  if (loadingSession) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-neutral-400 font-medium">Verifying Host Authorization...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          
          {/* Header & User Session Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-neutral-800 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-amber-500 tracking-tight">EstanciaOS Host Operations</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Logged in as: <span className="text-white font-medium">{userEmail}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-red-400 text-xs font-semibold rounded-xl transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* ALL 4 NAVIGATION TABS RESTORED */}
          <div className="flex flex-wrap bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl gap-1 mb-8">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'daily' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Daily Operations
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bookings & iCal
            </button>
            <button
              onClick={() => setActiveTab('concierge')}
              className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'concierge' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Concierge Services
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'properties' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Property Portfolio
            </button>
          </div>

          {/* --- TAB 1: DAILY OPERATIONS MONITOR --- */}
          {activeTab === 'daily' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Daily Host Operations Monitor</h2>
                <p className="text-neutral-400 text-sm mb-6">Log housekeeping, turn-key inspections, and guest arrivals for today.</p>

                {dailyMsg && <p className="mb-4 p-3 bg-neutral-950 border border-neutral-800 text-amber-500 rounded-xl text-sm">{dailyMsg}</p>}

                <form onSubmit={handleLogDailyOp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Select Property</label>
                    <input
                      type="text"
                      placeholder="e.g. Kololo Luxury Apartment"
                      value={selectedProp}
                      onChange={(e) => setSelectedProp(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Housekeeping / Turn Status</label>
                      <select
                        value={cleaningStatus}
                        onChange={(e) => setCleaningStatus(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      >
                        <option value="Pending">Pending Cleaning</option>
                        <option value="InProgress">Cleaning In Progress</option>
                        <option value="Inspected">Inspected & Ready</option>
                        <option value="Occupied">Guest Checked In</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Keylock / Access Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Code #4821 Active"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Daily Log / Operations Notes</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Guest requested late check-in at 8 PM. Linen restocked."
                      value={dailyNotes}
                      onChange={(e) => setDailyNotes(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition">
                    Save Daily Monitor Entry
                  </button>
                </form>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
                  <div>
                    <p className="text-xs text-neutral-400">Direct Guest Dispatch</p>
                    <p className="text-sm font-semibold text-white">{selectedProp || 'Selected Property'}</p>
                  </div>
                  <a
                    href={`https://wa.me/256757386946?text=Hi!%20This%20is%20La%20Estancia%20Vacation%20Homes.%20Here%20are%20your%20check-in%20details%20and%20access%20information%20for%20${encodeURIComponent(selectedProp || 'your upcoming stay')}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2"
                  >
                    💬 WhatsApp Guest Arrival
                  </a>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Live Status Overview</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
                      <span className="text-xs text-neutral-400">Housekeeping</span>
                      <span className="text-xs font-bold text-amber-500">{cleaningStatus}</span>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
                      <span className="text-xs text-neutral-400">iCal Sync Engine</span>
                      <span className="text-xs font-bold text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: BOOKINGS & ICAL SYNC --- */}