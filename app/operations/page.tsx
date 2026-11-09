'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function OperationsPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')

  // Property Form State (Add / Edit)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [category, setCategory] = useState('Apartment')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase.from('properties').select('*')
      if (error) throw error
      if (data) setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (property: any) => {
    setEditingId(property.id)
    setTitle(property.title || '')
    setLocation(property.location || '')
    setPricePerNight(property.price_per_night?.toString() || '')
    setCategory(property.category || 'Apartment')
    setDescription(property.description || '')
    setSelectedFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setLocation('')
    setPricePerNight('')
    setCategory('Apartment')
    setDescription('')
    setSelectedFile(null)
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
      alert('Property deleted successfully!')
      fetchProperties()
    } catch (error: any) {
      alert('Error deleting property: ' + error.message)
    }
  }

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = ''

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: publicURLData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)

        imageUrl = publicURLData.publicUrl
      }

      if (editingId) {
        // Update existing property
        const updateData: any = {
          title,
          location,
          price_per_night: parseFloat(pricePerNight),
          category,
          description,
        }
        if (imageUrl) updateData.image_url = imageUrl

        const { error: updateError } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', editingId)

        if (updateError) throw updateError

        alert('Property updated successfully!')
      } else {
        // Insert new property
        const { error: insertError } = await supabase.from('properties').insert([
          {
            title,
            location,
            price_per_night: parseFloat(pricePerNight),
            category,
            description,
            image_url: imageUrl,
          },
        ])

        if (insertError) throw insertError

        alert('Property added successfully!')
      }

      handleCancelEdit()
      fetchProperties()
    } catch (error: any) {
      console.error('Error saving property:', error.message)
      alert('Error saving property: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white pb-16">
      {/* Compact Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Operations Hub</h1>
        <p className="text-neutral-400 text-sm mt-1">Manage your properties, bookings, tasks, and financials from one command center.</p>
      </div>

      {/* Operations Hub Tab Navigation Bar & Search */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Search Bar */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Quick search properties, guests, or tasks..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        {/* Tab Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'properties' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            🏠 Properties ({properties.length})
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'bookings' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            📅 Bookings (2)
          </button>
          <button 
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'dispatch' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            ⚡ Dispatch / Tasks (1)
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'ledger' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            💰 Ledger
          </button>
          <button 
            onClick={() => setActiveTab('upsells')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'upsells' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            ⭐ Upsells (4)
          </button>
          <button 
            onClick={() => setActiveTab('cohosts')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'cohosts' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            🤝 Co-Hosts (0)
          </button>
        </div>

        {/* Dynamic Tab Content Display */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl min-h-[400px]">
          
          {activeTab === 'properties' && (
            <div className="space-y-8">
              {/* Add / Edit Property Form */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white">
                    {editingId ? 'Edit Property Details' : 'Add New Property Listing'}
                  </h2>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handlePropertySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Property Title</label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g. Luxury Entebbe Villa" 
                        required 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Location</label>
                      <input 
                        type="text" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="e.g. Entebbe, Uganda" 
                        required 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Price Per Night ($)</label>
                      <input 
                        type="number" 
                        value={pricePerNight} 
                        onChange={(e) => setPricePerNight(e.target.value)} 
                        placeholder="150" 
                        required 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Villa">Villa</option>
                        <option value="Mansion">Mansion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Description</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Describe the property highlights, amenities, and features..." 
                      rows={3} 
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Property Image {editingId && '(Leave blank to keep existing)'}</label>
                    <input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading} 
                    className="w-full bg-white text-black font-medium py-2.5 rounded-xl text-sm hover:bg-neutral-200 transition"
                  >
                    {uploading ? 'Saving Property...' : editingId ? 'Update Property Details' : 'Publish Property Listing'}
                  </button>
                </form>
              </div>

              {/* Property Inventory Display with Edit & Delete Actions */}
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Live Property Portfolio</h2>
                <p className="text-neutral-400 text-sm mb-6">Review, edit, or remove your active listings loaded from Supabase.</p>
                {loading ? (
                  <p className="text-neutral-500 text-sm">Loading properties...</p>
                ) : properties.length === 0 ? (
                  <div className="text-neutral-400 text-sm py-8 text-center bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                    No properties added yet. Use the form above to add your first listing.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                      <div key={property.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          {property.image_url && (
                            <img src={property.image_url} alt={property.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                          )}
                          <h3 className="font-bold text-white text-sm">{property.title}</h3>
                          <p className="text-neutral-400 text-xs mt-1">{property.location}</p>
                          <p className="text-emerald-400 font-semibold text-xs mt-2">${property.price_per_night} / night</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-800">
                          <button 
                            onClick={() => handleEditClick(property)}
                            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs py-1.5 rounded-lg font-medium transition"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProperty(property.id)}
                            className="flex-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 text-xs py-1.5 rounded-lg font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Reservations & Bookings Ledger</h2>
              <p className="text-neutral-400 text-sm mb-6">Monitor confirmed stays, guest details, and pending inquiries.</p>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Sample Booking Card matching your exact structure */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 relative">
                  {/* Top Row: Property & Confirmed Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-neutral-400 uppercase tracking-wider">Property Inquiry</span>
                      <h3 className="text-white font-bold text-base mt-0.5">2 bedroom fully furnished Airbnb apartment for rent in Ntinda</h3>
                    </div>
                    <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 text-xs px-2.5 py-1 rounded-full font-medium">
                      Confirmed
                    </span>
                  </div>

                  {/* Guest Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-neutral-300 my-4 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/60">
                    <div>
                      <span className="text-neutral-500 block">Guest Name</span>
                      <strong className="text-white">Linton Ayebare</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Phone / WhatsApp</span>
                      <strong className="text-white">+256780564778</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Guests & Demo</span>
                      <strong className="text-white">2 Guests (Solo Business)</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Dates</span>
                      <strong className="text-white">Nov 12 - Nov 19</strong>
                    </div>
                  </div>

                  {/* Highlighted Guest Notes */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300 mb-4">
                    <span className="text-neutral-500 block mb-1 font-medium">Guest Notes</span>
                    Requesting early check-in around 10:00 AM if possible. Airport pickup needed.
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-neutral-800/80">
                    <button 
                      onClick={() => alert('Marking booking as processed / approved')}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs py-2 rounded-lg font-medium transition"
                    >
                      ✓ Mark Processed
                    </button>
                    <button 
                      onClick={() => alert('Deleting booking record')}
                      className="flex-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 text-xs py-2 rounded-lg font-medium transition"
                    >
                      Delete Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Operational Tasks & Dispatch</h2>
              <p className="text-neutral-400 text-sm mb-6">Assign cleaning, maintenance, and check-in checklists with priority levels.</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/60 text-sm">
                  <span className="text-neutral-200">Deep cleaning scheduled for upcoming turnover</span>
                  <span className="text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md text-xs border border-amber-900/40">High Priority</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Financial Ledger & Expenses</h2>
              <p className="text-neutral-400 text-sm mb-6">Track monthly earnings, utility bills, rent, and operational costs.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                  <span className="text-xs text-neutral-400">Total Revenue (MTD)</span>
                  <p className="text-2xl font-bold text-white mt-1">$4,850</p>
                </div>
                <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                  <span className="text-xs text-neutral-400">Operational Bills (Rent/Gas)</span>
                  <p className="text-2xl font-bold text-rose-400 mt-1">$1,200</p>
                </div>
                <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                  <span className="text-xs text-neutral-400">Net Profit</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">$3,650</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upsells' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Guest Upsells & Services</h2>
              <p className="text-neutral-400 text-sm mb-6">Configure airport pickups, private chef bookings, and extra guest services.</p>
              <div className="text-neutral-400 text-sm py-8 text-center bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                Upsells configuration active.
              </div>
            </div>
          )}

          {activeTab === 'cohosts' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Co-Host & Property Marketing Services</h2>
              <p className="text-neutral-400 text-sm mb-6">Manage external client property listings, landing page requests, and co-hosting agreements.</p>
              <div className="text-neutral-400 text-sm py-8 text-center bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                Co-hosting pipelines active.
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  )
}