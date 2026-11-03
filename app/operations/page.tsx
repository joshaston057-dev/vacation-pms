'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPortal() {
  const [activeTab, setActiveTab] = useState('properties')

  const [services, setServices] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Edit / Add Property Modal State
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const [propTitle, setPropTitle] = useState('')
  const [propCategory, setPropCategory] = useState('Apartment')
  const [propPrice, setPropPrice] = useState('')
  const [propLocation, setPropLocation] = useState('')
  const [propDescription, setPropDescription] = useState('')
  const [propBedrooms, setPropBedrooms] = useState('')
  const [propBathrooms, setPropBathrooms] = useState('')
  const [propGuests, setPropGuests] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  useEffect(() => {
    fetchServices()
    fetchBookings()
    fetchProperties()
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

  // DIRECT DEVICE GALLERY UPLOAD TO SUPABASE BUCKET
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

      if (uploadError) {
        console.error('Error uploading image:', uploadError.message)
      } else {
        const { data } = supabase.storage.from('property-images').getPublicUrl(filePath)
        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl)
        }
      }
    }

    setUploading(false)
    return uploadedUrls
  }

  // OPEN EDIT MODAL
  const openEditModal = (property: any) => {
    setEditingProperty(property)
    setIsAddingNew(false)
    setPropTitle(property.title || '')
    setPropCategory(property.category || 'Apartment')
    setPropPrice(String(property.price_per_night || property.nightly_price || property.price || ''))
    setPropLocation(property.location || '')
    setPropDescription(property.description || '')
    setPropBedrooms(String(property.bedrooms || ''))
    setPropBathrooms(String(property.bathrooms || ''))
    setPropGuests(String(property.max_guests || ''))

    let imgs: string[] = []
    try {
      imgs = typeof property.images === 'string' ? JSON.parse(property.images) : (property.images || [])
    } catch (e) {
      imgs = []
    }
    setExistingImages(imgs)
    setSelectedFiles(null)
  }

  // OPEN ADD NEW PROPERTY MODAL
  const openAddModal = () => {
    setEditingProperty(null)
    setIsAddingNew(true)
    setPropTitle('')
    setPropCategory('Apartment')
    setPropPrice('')
    setPropLocation('')
    setPropDescription('')
    setPropBedrooms('')
    setPropBathrooms('')
    setPropGuests('')
    setExistingImages([])
    setSelectedFiles(null)
  }

  // SAVE PROPERTY (ADD OR UPDATE)
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
      bedrooms: parseInt(propBedrooms) || null,
      bathrooms: parseInt(propBathrooms) || null,
      max_guests: parseInt(propGuests) || null,
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
      console.error('Save property error:', error.message)
      alert('Failed to save property. Please check column names in Supabase.')
    } else {
      setEditingProperty(null)
      setIsAddingNew(false)
      fetchProperties()
    }
    setLoading(false)
  }

  // DELETE PROPERTY
  const handleDeleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property listing?')) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) {
      alert('Failed to delete property.')
    } else {
      setEditingProperty(null)
      fetchProperties()
    }
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
                onClick={openAddModal}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                + Add New Property
              </button>
            )}
          </div>

          {/* SUB-NAVIGATION TABS */}
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

        {/* 1. PROPERTIES & PHOTOS TAB */}
        {activeTab === 'properties' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-white">Managed Properties Catalog</h2>
              <a href="/properties" className="text-xs text-amber-400 font-bold hover:underline">View Public Catalog →</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map(p => {
                let imageList: string[] = []
                try {
                  imageList = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [])
                } catch (e) {
                  imageList = []
                }
                const mainImg = imageList.length > 0 ? imageList[0] : null
                const displayPrice = p.price_per_night || p.nightly_price || p.price || 0

                return (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 bg-neutral-950">
                        {mainImg ? (
                          <img src={mainImg} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-bold">📷 No Photos</div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          📷 {imageList.length} Photos
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-extrabold text-white text-sm line-clamp-1">{p.title}</h3>
                        <p className="text-xs text-neutral-400">📍 {p.location || 'Kampala, Uganda'}</p>
                        <p className="text-xs text-amber-500 font-extrabold">${displayPrice} / night</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => openEditModal(p)}
                        className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl border border-neutral-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ✏️ Edit Property & Photos
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* EDIT / ADD PROPERTY MODAL WITH GALLERY UPLOAD */}
        {(editingProperty || isAddingNew) && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="font-extrabold text-white text-base">
                  {isAddingNew ? 'Add New Property' : 'Edit Property & Photos'}
                </h3>
                <button
                  onClick={() => { setEditingProperty(null); setIsAddingNew(false); }}
                  className="text-neutral-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProperty} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">PROPERTY TITLE</label>
                  <input
                    type="text"
                    required
                    value={propTitle}
                    onChange={e => setPropTitle(e.target.value)}
                    placeholder="e.g. 2 Bedroom Luxury Apartment in Entebbe"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">CATEGORY</label>
                    <select
                      value={propCategory}
                      onChange={e => setPropCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Standalone House">Standalone House</option>
                      <option value="Mansion">Mansion</option>
                      <option value="Villa">Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold block mb-1">PRICE / NIGHT ($)</label>
                    <input
                      type="number"
                      required
                      value={propPrice}
                      onChange={e => setPropPrice(e.target.value)}
                      placeholder="60"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">LOCATION / AREA</label>
                  <input
                    type="text"
                    required
                    value={propLocation}
                    onChange={e => setPropLocation(e.target.value)}
                    placeholder="Entebbe / Kisaasi / Kampala"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={propDescription}
                    onChange={e => setPropDescription(e.target.value)}
                    placeholder="Provide full stay details..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* DIRECT DEVICE GALLERY UPLOADER */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="text-[10px] text-amber-500 font-extrabold block uppercase tracking-wider">
                    📷 Upload Photos From Device Gallery
                  </label>

                  <div className="border-2 border-dashed border-neutral-800 hover:border-amber-500 rounded-xl p-4 text-center bg-neutral-950 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => setSelectedFiles(e.target.files)}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                    />
                    <p className="text-[10px] text-neutral-500 mt-2">
                      Tap above to select photos directly from your phone gallery or computer.
                    </p>
                  </div>

                  {existingImages.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold">Existing Photos ({existingImages.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt="Thumb" className="w-12 h-12 object-cover rounded-lg border border-neutral-800" />
                            <button
                              type="button"
                              onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <p className="text-xs text-amber-500 font-bold text-center animate-pulse">
                      Uploading selected photos to server...
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                  {editingProperty ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteProperty(editingProperty.id)}
                      className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      🗑️ Delete Property
                    </button>
                  ) : <div />}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingProperty(null); setIsAddingNew(false); }}
                      className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer"
                    >
                      {loading || uploading ? 'Saving...' : 'Save Property'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  )
}