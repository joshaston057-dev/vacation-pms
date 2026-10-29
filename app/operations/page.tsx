'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  title: string
  location: string
  price_per_night: number
  bedrooms: number
  bathrooms: number
  guests: number
  property_type: string
  whatsapp_number: string
  description: string
  amenities: string[]
  image_urls: string[]
  ical_url?: string
}

interface Booking {
  id: string
  property_title: string
  guest_name: string
  guest_phone: string
  check_in: string
  check_out: string
  total_price: number
  status: string
}

interface OperationalTask {
  id: string
  property_title: string
  task_type: string
  assigned_to: string
  due_date: string
  completed: boolean
}

interface UpsellService {
  id: string
  title: string
  category: string
  price_usd: number
  description: string
}

const AVAILABLE_AMENITIES = [
  'High-Speed WiFi',
  'Air Conditioning',
  'Hot Water Shower',
  'Smart TV / Netflix',
  'Standby Generator / Inverter',
  'Fully Equipped Kitchen',
  'Washing Machine',
  'Daily Housekeeping',
  'Swimming Pool',
  'Private Parking',
  '24/7 Security / CCTV',
  'Balcony / City View',
  'Gym / Fitness Center',
  'Elevator Access',
  'Perimeter Wall / Gate',
  'Dedicated Workspace'
]

export default function OperationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'operations' | 'services'>('properties')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Data States
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tasks, setTasks] = useState<OperationalTask[]>([])
  const [services, setServices] = useState<UpsellService[]>([])
  const [loading, setLoading] = useState(true)

  // Property Form States
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [guests, setGuests] = useState('2')
  const [propertyType, setPropertyType] = useState('Apartment')
  const [whatsappNumber, setWhatsappNumber] = useState('+256757386946')
  const [description, setDescription] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Booking Form States
  const [bProperty, setBProperty] = useState('')
  const [bGuestName, setBGuestName] = useState('')
  const [bGuestPhone, setBGuestPhone] = useState('')
  const [bCheckIn, setBCheckIn] = useState('')
  const [bCheckOut, setBCheckOut] = useState('')
  const [bTotalPrice, setBTotalPrice] = useState('')

  // Task Form States
  const [tProperty, setTProperty] = useState('')
  const [tType, setTType] = useState('Housekeeping')
  const [tAssigned, setTAssigned] = useState('Cleaners')
  const [tDueDate, setTDueDate] = useState('')

  // Service Form States
  const [sTitle, setSTitle] = useState('')
  const [sCategory, setSCategory] = useState('Transport')
  const [sPrice, setSPrice] = useState('')
  const [sDesc, setSDesc] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setCheckingAuth(false)
        fetchAllData()
      }
    }
    checkSession()
  }, [router])

  const fetchAllData = async () => {
    setLoading(true)
    const { data: propsData } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    const { data: booksData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
    const { data: tasksData } = await supabase.from('operational_tasks').select('*').order('created_at', { ascending: false })
    const { data: servsData } = await supabase.from('upsell_services').select('*').order('created_at', { ascending: false })

    setProperties(propsData || [])
    setBookings(booksData || [])
    setTasks(tasksData || [])
    setServices(servsData || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity))
    } else {
      setSelectedAmenities([...selectedAmenities, amenity])
    }
  }

  const handleSaveIcal = async (propertyId: string, url: string) => {
    const { error } = await supabase.from('properties').update({ ical_url: url }).eq('id', propertyId)
    if (error) {
      alert('Error saving iCal link: ' + error.message)
    } else {
      alert('iCal link updated successfully!')
      fetchAllData()
    }
  }

  // Submit Handlers
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let uploadedUrls: string[] = []
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          const file = imageFiles[i]
          const fileName = `${Date.now()}-${file.name}`
          const { data: uploadData } = await supabase.storage.from('property-images').upload(fileName, file)
          if (uploadData) {
            const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
            uploadedUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      await supabase.from('properties').insert([{
        title, location, price_per_night: parseFloat(pricePerNight) || 0,
        bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms), guests: parseInt(guests),
        property_type: propertyType, whatsapp_number: whatsappNumber, description,
        amenities: selectedAmenities, image_urls: uploadedUrls,
      }])

      alert('Property published successfully!')
      setTitle(''); setLocation(''); setPricePerNight(''); setDescription(''); setSelectedAmenities([]); setImageFiles(null);
      fetchAllData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('bookings').insert([{
      property_title: bProperty || properties[0]?.title || 'General Booking',
      guest_name: bGuestName, guest_phone: bGuestPhone,
      check_in: bCheckIn, check_out: bCheckOut, total_price: parseFloat(bTotalPrice) || 0
    }])
    alert('Booking recorded!')
    setBGuestName(''); setBGuestPhone(''); setBCheckIn(''); setBCheckOut(''); setBTotalPrice('');
    fetchAllData()
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('operational_tasks').insert([{
      property_title: tProperty || properties[0]?.title || 'General Unit',
      task_type: tType, assigned_to: tAssigned, due_date: tDueDate || new Date().toISOString().split('T')[0]
    }])
    alert('Operational task added!')
    setTDueDate('');
    fetchAllData()
  }

  const handleToggleTask = async (id: string, currentCompleted: boolean) => {
    await supabase.from('operational_tasks').update({ completed: !currentCompleted }).eq('id', id)
    fetchAllData()
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('upsell_services').insert([{
      title: sTitle, category: sCategory, price_usd: parseFloat(sPrice) || 0, description: sDesc
    }])
    alert('Service/Upsell added!')
    setSTitle(''); setSPrice(''); setSDesc('');
    fetchAllData()
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-neutral-400">Verifying host credentials...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* Portal Top Header */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-500 text-center sm:text-left">
                Host Operations Management System
              </h1>
              <p className="text-neutral-400 text-xs mt-1 text-center sm:text-left">
                Manage property listings, guest reservations, iCal calendar sync, operational workflows, and concierge upsells.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 font-bold text-xs rounded-xl transition"
            >
              🔒 Sign Out
            </button>
          </div>
        </section>

        {/* 4-SECTION NAVIGATION TABS */}
        <section className="max-w-6xl mx-auto px-4 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-900 p-2 border border-neutral-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'properties' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              🏠 Property Listings
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              📅 Bookings & iCal Sync
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'operations' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              ⚙️ Day-to-Day Operations
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'services' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              💎 Services & Upsells
            </button>
          </div>
        </section>

        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          
          {/* TAB 1: PROPERTY LISTINGS */}
          {activeTab === 'properties' && (
            <div className="space-y-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">✨ Add New Property Listing</h2>
                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Property Title</label>
                      <input
                        type="text" required placeholder="Property Title (e.g., Luxury Kololo Penthouse)"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Neighborhood / Location</label>
                      <input
                        type="text" required placeholder="Neighborhood / Location (e.g., Kisaasi, Kampala)"
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Price / Night ($)</label>
                      <input
                        type="number" required placeholder="Price / Night ($)"
                        value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                      <select
                        value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Standalone House">Standalone House</option>
                        <option value="Villa">Villa</option>
                        <option value="Mansion">Mansion</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Bedrooms</label>
                      <select
                        value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      >
                        <option value="1">1 Bed</option>
                        <option value="2">2 Beds</option>
                        <option value="3">3 Beds</option>
                        <option value="4">4+ Beds</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Max Guests</label>
                      <input
                        type="number" placeholder="Max Guests"
                        value={guests} onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* EXPLICIT HOST WHATSAPP CONTACT FIELD WITH CLEAR LABEL */}
                    <div>
                      <label className="block text-xs font-semibold text-amber-500 mb-1">
                        📲 Host WhatsApp Contact Number
                      </label>
                      <input
                        type="text" required placeholder="e.g., +256757386946"
                        value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Upload Photos (Up to 5)</label>
                      <input
                        type="file" multiple accept="image/*"
                        onChange={(e) => setImageFiles(e.target.files)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-black font-semibold"
                      />
                    </div>
                  </div>

                  {/* Serviced Amenities Checkbox Section */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">Select Serviced Amenities Available</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-neutral-950 border border-neutral-800 p-3 rounded-xl max-h-48 overflow-y-auto">
                      {AVAILABLE_AMENITIES.map((amenity) => {
                        const isChecked = selectedAmenities.includes(amenity)
                        return (
                          <label
                            key={amenity} onClick={() => handleAmenityToggle(amenity)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer border text-[11px] font-medium transition ${
                              isChecked ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                            }`}
                          >
                            <input type="checkbox" checked={isChecked} onChange={() => {}} className="accent-amber-500" />
                            <span>{amenity}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Property Description & Guest Write-Up</label>
                    <textarea
                      rows={3} required placeholder="Full property write-up and details..."
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition"
                  >
                    {submitting ? 'Publishing...' : 'Publish Property Listing'}
                  </button>
                </form>
              </div>

              {/* Portfolio Grid */}
              <div>
                <h3 className="text-base font-bold text-white mb-3">Active Portfolio ({properties.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((p) => (
                    <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <img src={p.image_urls?.[0] || '/placeholder.jpg'} alt={p.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                        <h4 className="font-bold text-white text-sm">{p.title}</h4>
                        <p className="text-xs text-neutral-400">{p.location}</p>
                        <p className="text-amber-500 font-bold text-xs mt-1">${p.price_per_night} / night</p>
                        <p className="text-[11px] text-emerald-400 mt-1">💬 WhatsApp: {p.whatsapp_number}</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this listing?')) {
                            await supabase.from('properties').delete().eq('id', p.id)
                            fetchAllData()
                          }
                        }}
                        className="mt-3 py-1.5 bg-red-600/20 text-red-400 text-xs rounded-lg hover:bg-red-600 hover:text-white transition"
                      >
                        Delete Listing
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS & ICAL CALENDAR SYNC */}
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              
              {/* iCal Link Sync Management Box per Property */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📅 Property iCal Calendar Links</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Import external Airbnb or Booking.com calendar URLs to auto-block dates, or copy EstanciaOS iCal feeds.
                </p>

                <div className="space-y-3 pt-2">
                  {properties.map((prop) => (
                    <div key={prop.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h4 className="font-bold text-amber-500 text-xs">{prop.title}</h4>
                        <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded border border-neutral-800">
                          📍 {prop.location}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* External iCal URL Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                            Import Airbnb / Booking.com iCal URL:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              placeholder="https://www.airbnb.com/calendar/ical/..."
                              defaultValue={prop.ical_url || ''}
                              id={`ical-input-${prop.id}`}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white text-xs outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => {
                                const inputEl = document.getElementById(`ical-input-${prop.id}`) as HTMLInputElement
                                handleSaveIcal(prop.id, inputEl.value)
                              }}
                              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg transition flex-shrink-0"
                            >
                              Save Link
                            </button>
                          </div>
                        </div>

                        {/* Direct Export iCal Feed Link */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                            Export EstanciaOS iCal Feed:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`https://vacation-pms.vercel.app/api/ical/${prop.id}`}
                              className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg p-2 text-neutral-400 text-xs outline-none"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`https://vacation-pms.vercel.app/api/ical/${prop.id}`)
                                alert('EstanciaOS iCal link copied to clipboard!')
                              }}
                              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs rounded-lg transition flex-shrink-0"
                            >
                              📋 Copy Feed
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Manual Reservation Box */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">📌 Add New Reservation</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={bProperty} onChange={(e) => setBProperty(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="">Select Property</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                  <input
                    type="text" required placeholder="Guest Name" value={bGuestName} onChange={(e) => setBGuestName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="text" required placeholder="Guest Phone / WhatsApp" value={bGuestPhone} onChange={(e) => setBGuestPhone(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="date" required value={bCheckIn} onChange={(e) => setBCheckIn(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="date" required value={bCheckOut} onChange={(e) => setBCheckOut(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="number" required placeholder="Total Amount Paid ($)" value={bTotalPrice} onChange={(e) => setBTotalPrice(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <button type="submit" className="sm:col-span-3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition">
                    Save Reservation
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3">Recorded Guest Reservations ({bookings.length})</h3>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                      <tr>
                        <th className="p-3">Property</th>
                        <th className="p-3">Guest Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Check-In</th>
                        <th className="p-3">Check-Out</th>
                        <th className="p-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-neutral-950/50">
                          <td className="p-3 font-semibold text-white">{b.property_title}</td>
                          <td className="p-3">{b.guest_name}</td>
                          <td className="p-3">{b.guest_phone}</td>
                          <td className="p-3 text-emerald-400">{b.check_in}</td>
                          <td className="p-3 text-amber-400">{b.check_out}</td>
                          <td className="p-3 font-bold text-amber-500">${b.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAY-TO-DAY OPERATIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">⚙️ Log Daily Operational Task</h2>
                <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <select
                    value={tProperty} onChange={(e) => setTProperty(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="">Select Property Unit</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                  <select
                    value={tType} onChange={(e) => setTType(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="Housekeeping">Housekeeping / Cleaning</option>
                    <option value="Key Handover">Key Handover / Check-in</option>
                    <option value="Maintenance">Maintenance & AC Repair</option>
                    <option value="Restocking">Linen & Toiletries Restock</option>
                  </select>
                  <input
                    type="text" placeholder="Assigned Staff (e.g., Sarah)" value={tAssigned} onChange={(e) => setTAssigned(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    type="date" value={tDueDate} onChange={(e) => setTDueDate(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <button type="submit" className="sm:col-span-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition">
                    Create Operational Task
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3">Daily Operations Checklist ({tasks.length})</h3>
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t.id, t.completed)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        t.completed ? 'bg-neutral-950 border-emerald-900/50 opacity-60' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-lg ${t.completed ? 'text-emerald-500' : 'text-neutral-500'}`}>
                          {t.completed ? '✓' : '⭕'}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${t.completed ? 'line-through text-neutral-400' : 'text-white'}`}>{t.property_title} — {t.task_type}</p>
                          <p className="text-[10px] text-neutral-400">Assigned: {t.assigned_to} | Due: {t.due_date}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${t.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                        {t.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES & UPSELLS SECTION */}
          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">💎 Add Concierge Service / Upsell</h2>
                <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text" required placeholder="Service Title (e.g., Airport Transfer)" value={sTitle} onChange={(e) => setSTitle(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <select
                    value={sCategory} onChange={(e) => setSCategory(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="Transport">Transport / Airport Transfer</option>
                    <option value="Culinary">Private Chef & Catering</option>
                    <option value="Housekeeping">Deep Cleaning / Laundry</option>
                    <option value="Excursions">City Tour & Car Hire</option>
                  </select>
                  <input
                    type="number" required placeholder="Price ($ USD)" value={sPrice} onChange={(e) => setSPrice(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <textarea
                    rows={2} placeholder="Service description..." value={sDesc} onChange={(e) => setSDesc(e.target.value)}
                    className="sm:col-span-3 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                  <button type="submit" className="sm:col-span-3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition">
                    Publish Upsell Service
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3">Active Guest Concierge Services ({services.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {services.map((s) => (
                    <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase">{s.category}</span>
                        <h4 className="font-bold text-white text-sm mt-2">{s.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{s.description}</p>
                      </div>
                      <p className="text-amber-500 font-extrabold text-sm mt-3">${s.price_usd}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  )
}