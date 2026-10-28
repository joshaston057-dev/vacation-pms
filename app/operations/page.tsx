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

  // --- Property State ---
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

  // Fetch properties
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

  // --- Direct Device File Upload Helper ---
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

  // --- Show Loading Guard While Auth Check Finishes ---
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

          {/* Navigation Tabs */}
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
              onClick={() => setActiveTab('properties')}
              className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'properties' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Property Portfolio
            </button>
          </div>

          {/* --- TAB: PROPERTY PORTFOLIO WITH DIRECT DEVICE UPLOAD --- */}
          {activeTab === 'properties' && (
            <div className="space-y-8">
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Add New Vacation Property</h2>
                <p className="text-neutral-400 text-sm mb-6">Publish apartments or villas directly to your public properties catalogue.</p>

                {propMsg && <p className="mb-4 p-3 bg-neutral-950 border border-neutral-800 text-amber-500 rounded-xl text-sm">{propMsg}</p>}

                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Property Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kololo Luxury Apartment"
                      value={propertyTitle}
                      onChange={(e) => setPropertyTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Location</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kololo, Kampala"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Price per Night ($ USD)</label>
                      <input
                        type="number"
                        required
                        placeholder="150"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        required
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        required
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Max Guests</label>
                      <input
                        type="number"
                        required
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* DIRECT DEVICE PHOTO SELECTOR */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Upload Photo from Device</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {uploadingImage ? 'Uploading Image & Saving...' : 'Publish Property Live'}
                  </button>
                </form>
              </div>

              {/* Portfolio List */}
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Manage & Delete Active Listings</h2>
                {loadingProps ? (
                  <p className="text-neutral-500 text-sm py-4">Loading properties...</p>
                ) : propertiesList.length === 0 ? (
                  <p className="text-neutral-500 text-sm py-4">No active properties found.</p>
                ) : (
                  <div className="space-y-4">
                    {propertiesList.map((prop) => (
                      <div key={prop.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {prop.image_url ? (
                            <img src={prop.image_url} alt={prop.title} className="w-14 h-14 object-cover rounded-lg" />
                          ) : (
                            <div className="w-14 h-14 bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-neutral-500">No Img</div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{prop.title}</p>
                            <p className="text-xs text-neutral-400">{prop.location} • ${prop.price_per_night ?? prop.price ?? 0} / night</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteProperty(prop.id, prop.title)}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-lg text-xs font-semibold transition"
                        >
                          🗑️ Delete Listing
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  )
}