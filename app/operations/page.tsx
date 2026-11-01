'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  title: string
  description: string
  price_per_night: number
  location: string
  category: string
  image_urls: string[]
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Property Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('Kampala')
  const [category, setCategory] = useState('Apartment')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setProperties(data || [])
    setLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5) // Max 5 pictures limit
      setImages(filesArray)
    }
  }

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      // 1. Upload up to 5 photos to Supabase Storage bucket 'property-images'
      for (const file of images) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrlData.publicUrl)
      }

      // 2. Save property record in Supabase Database
      const { error: dbError } = await supabase.from('properties').insert([
        {
          title,
          description,
          price_per_night: parseFloat(price),
          location,
          category,
          image_urls: uploadedUrls,
        },
      ])

      if (dbError) throw dbError

      // Reset Form & Close Modal
      setTitle('')
      setDescription('')
      setPrice('')
      setImages([])
      setShowModal(false)
      fetchProperties()
      alert('Property listed successfully!')
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
          {/* PAGE HEADER */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Short-Stay Properties</h1>
              <p className="text-xs text-neutral-400 mt-1">Browse and manage short-stay stays and furnished apartments.</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg cursor-pointer"
            >
              + Submit New Property
            </button>
          </div>

          {/* PROPERTY LISTINGS GRID */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : properties.length === 0 ? (
            <p className="text-center text-xs text-neutral-500 py-12 italic">No properties listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="h-48 bg-neutral-950 relative">
                    {property.image_urls && property.image_urls.length > 0 ? (
                      <img
                        src={property.image_urls[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-neutral-600">No Image Available</div>
                    )}
                    <span className="absolute top-3 right-3 bg-amber-500 text-black text-[11px] font-extrabold px-3 py-1 rounded-full shadow">
                      ${property.price_per_night} / night
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {property.category}
                    </span>
                    <h3 className="font-extrabold text-white text-base leading-tight">{property.title}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">{property.description}</p>
                    <p className="text-[11px] text-neutral-500 font-semibold">📍 {property.location}</p>

                    {/* DIRECT WHATSAPP INQUIRY BUTTON */}
                    <a
                      href={`https://wa.me/256757386946?text=${encodeURIComponent(`Hello La Estancia, I want to book: ${property.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow"
                    >
                      💬 Book via WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT PROPERTY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h2 className="text-base font-extrabold text-white">Add New Property Listing</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Furnished Apartment in Kampala"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Price Per Night ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="45"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Standalone House">Standalone House</option>
                    <option value="Mansion">Mansion</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe amenities, bedrooms, Wifi, parking..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Upload Photos (Up to 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-amber-500 hover:file:bg-neutral-700 cursor-pointer"
                />
                <p className="text-[10px] text-neutral-500 mt-1">{images.length} photo(s) selected.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow"
                >
                  {uploading ? 'Uploading...' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}