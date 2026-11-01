'use client'

import { useState, useEffect } from 'react'
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
  'High-Speed WiFi', 'Air Conditioning', 'Hot Water Shower', 'Smart TV / Netflix',
  'Standby Generator / Inverter', 'Fully Equipped Kitchen', 'Washing Machine',
  'Daily Housekeeping', 'Swimming Pool', 'Private Parking', '24/7 Security / CCTV',
  'Balcony / City View', 'Gym / Fitness Center', 'Elevator Access', 'Perimeter Wall / Gate', 'Dedicated Workspace'
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Property Form State
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
  
  // Robust Photo Selection & Preview State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    setProperties(data || [])
    setLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setSelectedFiles((prev) => [...prev, ...fileArray])

      const newPreviews = fileArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove))
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
      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < Math.min(selectedFiles.length, 5); i++) {
          const file = selectedFiles[i]
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const { data: uploadData } = await supabase.storage.from('property-images').upload(fileName, file)
          if (uploadData) {
            const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
            uploadedUrls.push(publicUrlData.publicUrl)
          }
        }
      }

      const { error } = await supabase.from('properties').insert([{
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
      }])

      if (error) {
        alert('Error publishing property: ' + error.message)
      } else {
        alert('Property published successfully!')
        setTitle('')
        setLocation('')
        setPricePerNight('')
        setDescription('')
        setSelectedAmenities([])
        setSelectedFiles([])
        setImagePreviews([])
        fetchProperties()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
          {/* PROPERTY CREATION FORM */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-extrabold text-amber-500 mb-4">Add New Property Listing</h2>
            
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text" required placeholder="Property Title"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                />
                <input
                  type="text" required placeholder="Location"
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="number" required placeholder="Price / Night ($)"
                  value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                />
                <select
                  value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Standalone House">Standalone House</option>
                  <option value="Villa">Villa</option>
                  <option value="Mansion">Mansion</option>
                </select>
                <select
                  value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                >
                  <option value="1">1 Bed</option>
                  <option value="2">2 Beds</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4+ Beds</option>
                </select>
                <input
                  type="number" placeholder="Guests"
                  value={guests} onChange={(e) => setGuests(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text" required placeholder="Host WhatsApp Number"
                  value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                />
                
                {/* PHOTO SELECTION INPUT */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-neutral-300">Upload Property Pictures (Up to 5)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-400 text-xs file:mr-4 file:py-1 file:px-3 files