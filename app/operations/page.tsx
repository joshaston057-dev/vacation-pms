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
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Form States
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

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setCheckingAuth(false)
        fetchProperties()
      }
    }

    checkSession()
  }, [router])

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching properties:', error.message)
    else setProperties(data || [])
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

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let uploadedUrls: string[] = []

      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          const file = imageFiles[i]
          const fileName = `${Date.now()}-${file.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file)

          if (uploadError) {
            console.error('Image upload failed:', uploadError.message)
          } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName)
            uploadedUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      const { error } = await supabase.from('properties').insert([
        {
          title,
          location,
          price_per_night: parseFloat(pricePerNight) || 0,
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          guests: parseInt(guests),
          property_type: propertyType,
          whatsapp_number: whatsappNumber,
          description,
          amenities: selectedAmenities,
          image_urls: uploadedUrls,
        },
      ])

      if (error) {
        alert('Error adding property: ' + error.message)
      } else {
        alert('Property added successfully!')
        setTitle('')
        setLocation('')
        setPricePerNight('')
        setDescription('')
        setSelectedAmenities([])
        setImageFiles(null)
        fetchProperties()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) alert('Error deleting: ' + error.message)
    else fetchProperties()
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

        <section className="bg-neutral-900 border-b border-neutral-800 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-amber-500 text-center sm:text-left">
                Host Operations Portal
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1 text-center sm:text-left">
                Manage property portfolio, amenities, descriptions, and WhatsApp routing.
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

        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">✨ Add New Property Listing</h2>
            
            <form onSubmit={handleAddProperty} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Property Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Luxury Kololo Penthouse"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Location / Neighborhood</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Kololo, Kampala"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Price / Night ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Standalone House">Standalone House</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  >
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4+ Beds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Host WhatsApp Number for Inquiries</label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Upload Photos (Up to 5)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400"
                  />
                </div>
              </div>

              {/* Amenities Selection Grid */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Select Serviced Amenities Available
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 bg-neutral-950 border border-neutral-800 p-4 rounded-xl">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity)
                    return (
                      <label
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-xs font-medium transition ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-amber-500"
                        />
                        <span>{amenity}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Full Property Description & Guest Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the space, surroundings, check-in policies, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl transition shadow-lg"
              >
                {submitting ? 'Publishing Listing...' : 'Publish Property Listing'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">📋 Active Portfolio Listings</h2>
            {loading ? (
              <p className="text-xs text-neutral-400">Loading listings...</p>
            ) : properties.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No properties added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="h-40 bg-neutral-950 rounded-xl overflow-hidden mb-3">
                        <img src={p.image_urls?.[0] || '/placeholder.jpg'} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold text-white text-base">{p.title}</h3>
                      <p className="text-xs text-neutral-400">{p.location}</p>
                      <p className="text-amber-500 font-bold text-xs mt-1">${p.price_per_night} / night</p>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-semibold text-xs rounded-xl transition border border-red-800/50"
                    >
                      Delete Property
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}