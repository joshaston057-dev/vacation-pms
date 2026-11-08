'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function HostOperationsHub() {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'tasks' | 'ledger' | 'upsells' | 'cohosts'>('properties')
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [cohosts, setCohosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Entire Listing Modal State (Photos & Amenities)
  const [showEditListingModal, setShowEditListingModal] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>({
    id: '',
    title: '',
    custom_name: '',
    price: '',
    location: '',
    category: 'Apartment',
    images: [],
    amenities: []
  })
  const [amenityInput, setAmenityInput] = useState('')

  // Modals for other tabs
  const [showCoHostModal, setShowCoHostModal] = useState(false)
  const [newCoHost, setNewCoHost] = useState({ name: '', specialty: '', location: '', rating: '5.0', phone: '', bio: '', image_url: '' })

  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [newUpsell, setNewUpsell] = useState({ title: '', description: '', price: '', category: 'Service', icon: '✨' })

  useEffect(() => {
    fetchHostData()
  }, [])

  const fetchHostData = async () => {
    setLoading(true)
    try {
      const [propsRes, bookRes, taskRes, upsellRes, expenseRes, cohostRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('tasks').select('*').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').order('id', { ascending: true }),
        supabase.from('expenses').select('*').order('id', { ascending: false }),
        supabase.from('co_hosts').select('*').order('id', { ascending: true })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (bookRes.data) setBookings(bookRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
      if (expenseRes.data) setExpenses(expenseRes.data)
      if (cohostRes.data) setCohosts(cohostRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // OPEN EDIT LISTING
  const openEditListingModal = (property: any) => {
    const imgArray = Array.isArray(property.images) ? property.images : property.image_url ? [property.image_url] : []
    const amenitiesArray = Array.isArray(property.amenities) ? property.amenities : ['High-Speed WiFi', 'Air Conditioning', 'Smart TV', 'Kitchen', 'Free Parking']
    
    setEditingProperty({
      id: property.id,
      title: property.title || '',
      custom_name: property.custom_name || '',
      price: property.price || '',
      location: property.location || '',
      category: property.category || 'Apartment',
      images: imgArray,
      amenities: amenitiesArray
    })
    setShowEditListingModal(true)
  }

  // DIRECT FILE UPLOAD TO SUPABASE STORAGE
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    try {
      const uploadedUrls: string[] = [...editingProperty.images]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36.substring(2))}-${Date.now()}.${fileExt}`
        const filePath = `listings/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl)
        }
      }

      setEditingProperty({ ...editingProperty, images: uploadedUrls })
      alert('✅ Photos uploaded successfully from your device!')
    } catch (err: any) {
      alert('Error uploading files: ' + err.message + '. Make sure your Supabase storage bucket "property-images" is created and public.')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = editingProperty.images.filter((_: any, idx: number) => idx !== indexToRemove)
    setEditingProperty({ ...editingProperty, images: updated })
  }

  // AMENITIES HANDLERS
  const handleAddAmenity = () => {
    if (!amenityInput.trim()) return
    setEditingProperty({
      ...editingProperty,
      amenities: [...editingProperty.amenities, amenityInput.trim()]
    })
    setAmenityInput('')
  }

  const handleRemoveAmenity = (indexToRemove: number) => {
    const updated = editingProperty.amenities.filter((_: any, idx: number) => idx !== indexToRemove)
    setEditingProperty({ ...editingProperty, amenities: updated })
  }

  const handleSaveFullListing = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: editingProperty.custom_name,
          custom_name: editingProperty.custom_name,
          price: parseFloat(editingProperty.price) || 0,
          location: editingProperty.location,
          category: editingProperty.category,
          images: editingProperty.images,
          image_url: editingProperty.images[0] || null,
          amenities: editingProperty.amenities
        })
        .eq('id', editingProperty.id)

      if (error) throw error

      alert('✅ Property listing, photos, and amenities updated successfully!')
      setShowEditListingModal(false)
      fetchHostData()
    } catch (err: any) {
      alert('Error updating listing: ' + err.message)
    }
  }

  // CO-HOST & UPSELL HANDLERS
  const handleCreateCoHost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await supabase.from('co_hosts').insert([newCoHost])
      alert('✅ Co-host added!')
      setShowCoHostModal(false)
      setNewCoHost({ name: '', specialty: '', location: '', rating: '5.0', phone: '', bio: '', image_url: '' })
      fetchHostData()
    } catch (err: any) { alert('Error: ' + err.message) }
  }

  const handleDeleteCoHost = async (id: number) => {
    if (!confirm('Remove co-host?')) return
    await supabase.from('co_hosts').delete().eq('id', id)
    fetchHostData()
  }

  const handleCreateUpsell = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await supabase.from('upsell_services').insert([{ ...newUpsell, price_usd: parseFloat(newUpsell.price) || 0 }])
      alert('✅ Upsell added!')
      setShowUpsellModal(false)
      setNewUpsell({ title: '', description: '', price: '', category: 'Service', icon: '✨' })
      fetchHostData()
    } catch (err: any) { alert('Error: ' + err.message) }
  }

  const handleDeleteUpsell = async (id: number) => {
    await supabase.from('upsell_services').delete().eq('id', id)
    fetchHostData()
  }

  const filteredProperties = properties.filter((p) =>
    (p.custom_name || p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* SEARCH */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Quick search properties, guests, or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition shadow-lg"
            />
          </div>

          {/* TABS */}
          <div className="flex items-center border-b border-neutral-800 pb-4 overflow-x-auto gap-2 scrollbar-none">
            <button onClick={() => setActiveTab('properties')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'properties' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🏠 Properties ({properties.length})</button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'bookings' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>📅 Bookings ({bookings.length})</button>
            <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'tasks' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🧹 Dispatch ({tasks.length})</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'ledger' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>💰 Ledger</button>
            <button onClick={() => setActiveTab('upsells')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'upsells' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>✨ Upsells ({upsells.length})</button>
            <button onClick={() => setActiveTab('cohosts')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${activeTab === 'cohosts' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}>🤝 Co-Hosts ({cohosts.length})</button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500 animate-pulse">Loading operations hub...</div>
          ) : (
            <>
              {/* PROPERTIES TAB */}
              {activeTab === 'properties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProperties.map((p) => {
                    const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
                    const displayTitle = p.custom_name || p.title || 'Executive Apartment'
                    return (
                      <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="relative aspect-[16/10] bg-neutral-950">
                          {gallery.length > 0 ? (
                            <img src={gallery[0]} alt={displayTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">No Image</div>
                          )}
                          <span className="absolute top-3 left-3 bg-black/80 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded uppercase">
                            {gallery.length} Photos
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-black text-white text-base truncate">{displayTitle}</h4>
                            <span className="text-amber-400 font-black text-base">${p.price || 0}/night</span>
                          </div>
                          <p className="text-xs text-neutral-400">📍 {p.location}</p>
                          <button
                            onClick={() => openEditListingModal(p)}
                            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            ✏️ Edit Listing, Photos & Amenities
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* UPSELLS TAB */}
              {activeTab === 'upsells' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Upsell Services Catalog</h3>
                    <button onClick={() => setShowUpsellModal(true)} className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">➕ Add New Service</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upsells.map((u) => (
                      <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl">{u.icon || '✨'}</span>
                            <span className="text-xs font-black text-amber-400">+${u.price || u.price_usd || 0}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm">{u.title}</h4>
                          <p className="text-xs text-neutral-400">{u.description}</p>
                        </div>
                        <button onClick={() => handleDeleteUpsell(u.id)} className="w-full py-2 bg-rose-950 text-rose-400 text-xs font-bold rounded-xl cursor-pointer">🗑️ Remove Service</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CO-HOSTS TAB */}
              {activeTab === 'cohosts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-white">Co-Host Marketplace</h3>
                    <button onClick={() => setShowCoHostModal(true)} className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer">➕ Add New Co-Host</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {cohosts.map((ch) => (
                      <div key={ch.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={ch.image_url} alt={ch.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/30" />
                            <div>
                              <h4 className="font-black text-white text-sm">{ch.name}</h4>
                              <span className="text-[11px] text-amber-400 font-bold">⭐ {ch.rating} Rating</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400">{ch.bio}</p>
                        </div>
                        <button onClick={() => handleDeleteCoHost(ch.id)} className="w-full py-2 bg-rose-950 text-rose-400 font-black text-xs rounded-xl cursor-pointer">🗑️ Remove Co-Host</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OTHER TABS PLACEHOLDERS (Bookings, Tasks, Ledger) */}
              {activeTab === 'bookings' && <div className="text-neutral-400 text-xs">Bookings management active.</div>}
              {activeTab === 'tasks' && <div className="text-neutral-400 text-xs">Tasks dispatch active.</div>}
              {activeTab === 'ledger' && <div className="text-neutral-400 text-xs">Ledger financials active.</div>}
            </>
          )}
        </div>
      </div>

      {/* EDIT LISTING, PHOTOS (DIRECT UPLOAD) & AMENITIES MODAL */}
      {showEditListingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-5 text-xs my-8">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Edit Listing, Photos & Amenities</h3>
              <button onClick={() => setShowEditListingModal(false)} className="text-neutral-400">✕</button>
            </div>

            <form onSubmit={handleSaveFullListing} className="space-y-4">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Listing Title / Layout</label>
                <input type="text" required value={editingProperty.custom_name} onChange={(e) => setEditingProperty({ ...editingProperty, custom_name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Price ($/night)</label>
                  <input type="number" required value={editingProperty.price} onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-bold text-amber-400" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Location</label>
                  <input type="text" required value={editingProperty.location} onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              {/* DIRECT PHOTO UPLOAD FROM DEVICE */}
              <div className="space-y-2">
                <label className="block text-neutral-400 font-bold">Property Photos (Direct Computer Upload)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
                {uploadingImages && <p className="text-amber-400 font-bold">Uploading images to storage...</p>}

                {/* THUMBNAILS PREVIEW */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {editingProperty.images.map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 group">
                      <img src={url} alt="listing" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AMENITIES EDITOR */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-neutral-400 font-bold">Property Amenities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add amenity (e.g. Swimming Pool)"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                  <button type="button" onClick={handleAddAmenity} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl cursor-pointer">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editingProperty.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-neutral-300 flex items-center gap-2">
                      {amenity}
                      <button type="button" onClick={() => handleRemoveAmenity(idx)} className="text-rose-400 font-bold">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl cursor-pointer">⚡ Save Listing Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CO-HOST MODAL */}
      {showCoHostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Add Co-Host</h3>
              <button onClick={() => setShowCoHostModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleCreateCoHost} className="space-y-3">
              <input type="text" required placeholder="Name" value={newCoHost.name} onChange={(e) => setNewCoHost({ ...newCoHost, name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Specialty" value={newCoHost.specialty} onChange={(e) => setNewCoHost({ ...newCoHost, specialty: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Location" value={newCoHost.location} onChange={(e) => setNewCoHost({ ...newCoHost, location: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" required placeholder="Phone (+256...)" value={newCoHost.phone} onChange={(e) => setNewCoHost({ ...newCoHost, phone: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="text" placeholder="Photo URL" value={newCoHost.image_url} onChange={(e) => setNewCoHost({ ...newCoHost, image_url: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <textarea rows={2} placeholder="Bio" value={newCoHost.bio} onChange={(e) => setNewCoHost({ ...newCoHost, bio: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">Save Co-Host</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD UPSELL MODAL */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white">Add Upsell Service</h3>
              <button onClick={() => setShowUpsellModal(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleCreateUpsell} className="space-y-3">
              <input type="text" required placeholder="Service Title" value={newUpsell.title} onChange={(e) => setNewUpsell({ ...newUpsell, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <input type="number" required placeholder="Price ($)" value={newUpsell.price} onChange={(e) => setNewUpsell({ ...newUpsell, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <textarea rows={2} placeholder="Description" value={newUpsell.description} onChange={(e) => setNewUpsell({ ...newUpsell, description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
              <button type="submit" className="w-full py-3 bg-amber-500 text-black font-black rounded-xl cursor-pointer">Save Service</button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}