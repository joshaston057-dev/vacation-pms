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
  notes?: string
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
  'High-Speed WiFi', 'Air Conditioning', 'Hot Water Shower', 'Smart TV / Netflix',
  'Standby Generator / Inverter', 'Fully Equipped Kitchen', 'Washing Machine',
  'Daily Housekeeping', 'Swimming Pool', 'Private Parking', '24/7 Security / CCTV',
  'Balcony / City View', 'Gym / Fitness Center', 'Elevator Access', 'Perimeter Wall / Gate', 'Dedicated Workspace'
]

export default function OperationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'operations' | 'services'>('properties')
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tasks, setTasks] = useState<OperationalTask[]>([])
  const [services, setServices] = useState<UpsellService[]>([])

  // Property Form
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

  // Booking Form
  const [bPropertyId, setBPropertyId] = useState('')
  const [bPropertyTitle, setBPropertyTitle] = useState('')
  const [bGuestName, setBGuestName] = useState('')
  const [bGuestPhone, setBGuestPhone] = useState('')
  const [bCheckIn, setBCheckIn] = useState('')
  const [bCheckOut, setBCheckOut] = useState('')
  const [bNightlyRate, setBNightlyRate] = useState<number>(0)
  const [bTotalPrice, setBTotalPrice] = useState('')

  // Task & Service Forms
  const [tProperty, setTProperty] = useState('')
  const [tType, setTType] = useState('Housekeeping')
  const [tAssigned, setTAssigned] = useState('Cleaners')
  const [tDueDate, setTDueDate] = useState('')
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
    const { data: propsData } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    const { data: booksData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
    const { data: tasksData } = await supabase.from('operational_tasks').select('*').order('created_at', { ascending: false })
    const { data: servsData } = await supabase.from('upsell_services').select('*').order('created_at', { ascending: false })

    setProperties(propsData || [])
    setBookings(booksData || [])
    setTasks(tasksData || [])
    setServices(servsData || [])
  }

  useEffect(() => {
    if (bCheckIn && bCheckOut && bNightlyRate > 0) {
      const start = new Date(bCheckIn)
      const end = new Date(bCheckOut)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        setBTotalPrice((diffDays * bNightlyRate).toString())
      }
    }
  }, [bCheckIn, bCheckOut, bNightlyRate])

  const handleSelectPropertyForBooking = (propertyId: string) => {
    setBPropertyId(propertyId)
    const selectedProp = properties.find((p) => p.id === propertyId)
    if (selectedProp) {
      setBPropertyTitle(selectedProp.title)
      setBNightlyRate(selectedProp.price_per_night || 0)
      setBTotalPrice(selectedProp.price_per_night?.toString() || '0')
      if (selectedProp.whatsapp_number) setBGuestPhone(selectedProp.whatsapp_number)
    }
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
    if (error) alert('Error: ' + error.message)
    else { alert('iCal link updated successfully!'); fetchAllData() }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let uploadedUrls: string[] = []
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          const file = imageFiles[i]
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const { data: uploadData } = await supabase.storage.from('property-images').upload(fileName, file)
          if (uploadData) {
            const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
            uploadedUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      const { error } = await supabase.from('properties').insert([{
        title, location, price_per_night: parseFloat(pricePerNight) || 0,
        bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms), guests: parseInt(guests),
        property_type: propertyType, whatsapp_number: whatsappNumber, description,
        amenities: selectedAmenities, image_urls: uploadedUrls,
      }])

      if (error) alert('Error: ' + error.message)
      else {
        alert('Property published successfully!')
        setTitle(''); setLocation(''); setPricePerNight(''); setDescription(''); setSelectedAmenities([]); setImageFiles(null);
        fetchAllData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('bookings').insert([{
      property_title: bPropertyTitle || 'General Reservation',
      guest_name: bGuestName, guest_phone: bGuestPhone,
      check_in: bCheckIn, check_out: bCheckOut,
      total_price: parseFloat(bTotalPrice) || 0, status: 'Confirmed'
    }])
    alert('Reservation saved!')
    setBPropertyId(''); setBPropertyTitle(''); setBGuestName(''); setBGuestPhone('');
    setBCheckIn(''); setBCheckOut(''); setBTotalPrice(''); setBNightlyRate(0);
    fetchAllData()
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('operational_tasks').insert([{
      property_title: tProperty || properties[0]?.title || 'General Unit',
      task_type: tType, assigned_to: tAssigned, due_date: tDueDate || new Date().toISOString().split('T')[0]
    }])
    alert('Task added!')
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
    alert('Service added!')
    setSTitle(''); setSPrice(''); setSDesc('');
    fetchAllData()
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        <section className="bg-neutral-900 border-b border-neutral-800 py-6 px-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-amber-500">Host Operations Management System</h1>
            <button onClick={handleSignOut} className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl">Sign Out</button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-900 p-2 border border-neutral-800 rounded-2xl">
            <button onClick={() => setActiveTab('properties')} className={`py-2.5 rounded-xl text-xs font-bold ${activeTab === 'properties' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}>Properties</button>
            <button onClick={() => setActiveTab('bookings')} className={`py-2.5 rounded-xl text-xs font-bold ${activeTab === 'bookings' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}>Bookings & iCal</button>
            <button onClick={() => setActiveTab('operations')} className={`py-2.5 rounded-xl text-xs font-bold ${activeTab === 'operations' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}>Operations</button>
            <button onClick={() => setActiveTab('services')} className={`py-2.5 rounded-xl text-xs font-bold ${activeTab === 'services' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}>Services</button>
          </div>
        </section>

        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          {activeTab === 'properties' && (
            <div className="space-y-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Add New Property Listing</h2>
                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" required placeholder="Property Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                    <input type="text" required placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input type="number" required placeholder="Price / Night ($)" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs">
                      <option value="Apartment">Apartment</option>
                      <option value="Standalone House">Standalone House</option>
                      <option value="Villa">Villa</option>
                      <option value="Mansion">Mansion</option>
                    </select>
                    <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs">
                      <option value="1">1 Bed</option><option value="2">2 Beds</option><option value="3">3 Beds</option><option value="4">4+ Beds</option>
                    </select>
                    <input type="number" placeholder="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" required placeholder="Host WhatsApp Number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                    <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-400 text-xs" />
                  </div>
                  <textarea rows={3} required placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl">{submitting ? 'Publishing...' : 'Publish Listing'}</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-8">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Add Reservation</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select value={bPropertyId} onChange={(e) => handleSelectPropertyForBooking(e.target.value)} required className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs">
                    <option value="">Select Property</option>
                    {properties.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                  <input type="text" required placeholder="Guest Name" value={bGuestName} onChange={(e) => setBGuestName(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="text" required placeholder="Guest Contact" value={bGuestPhone} onChange={(e) => setBGuestPhone(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="date" required value={bCheckIn} onChange={(e) => setBCheckIn(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="date" required value={bCheckOut} onChange={(e) => setBCheckOut(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="number" required placeholder="Total Amount ($)" value={bTotalPrice} onChange={(e) => setBTotalPrice(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <button type="submit" className="sm:col-span-3 py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl">Save Reservation</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}