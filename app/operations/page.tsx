'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function OperationsPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Property Form State
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
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = ''

      // Handle photo upload to Supabase storage bucket 'property-images'
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, selectedFile, { upsert: true })

        if (uploadError) {
          throw new Error('Upload Error: ' + uploadError.message)
        }

        const { data: publicURLData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)

        imageUrl = publicURLData.publicUrl
      }

      const { error: insertError } = await supabase.from('properties').insert([
        {
          title,
          location,
          price_per_night: parseFloat(pricePerNight) || 0,
          category,
          description,
          image_url: imageUrl,
        }
      ])

      if (insertError) throw insertError

      alert('Property published successfully!')
      setTitle('')
      setLocation('')
      setPricePerNight('')
      setDescription('')
      setSelectedFile(null)
      fetchProperties()
    } catch (err: any) {
      console.error('Error creating property:', err)
      alert(err.message || 'Failed to create property.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
      fetchProperties()
    } catch (err: any) {
      alert('Error deleting property: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 w-full flex flex-col justify-between">
      {/* Top Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Hub</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your properties, listings, and portfolio overview.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          View Public Stays ↗
        </a>
      </div>

      {/* Main Full-Screen Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">
        
        {/* Add Property Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 w-full shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-emerald-400">Add New Property Listing</h2>
          
          <form onSubmit={handleCreateProperty} className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Property Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Luxury 1 Bedroom Apartment"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kisaasi, Kampala"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Price ($ / night)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="45"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Standalone House">Standalone House</option>
                  <option value="Villa">Villa</option>
                  <option value="Mansion">Mansion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">Property Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe amenities, internet speed, security, etc..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">Property Photo (Upload from Device)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-400 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3 rounded-lg text-sm transition disabled:opacity-50 shadow-lg"
              >
                {uploading ? 'Uploading & Publishing...' : 'Publish Property'}
              </button>
            </div>
          </form>
        </div>

        {/* Portfolio Listing Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Active Property Portfolio ({properties.length})</h2>
          
          {loading ? (
            <div className="text-neutral-500 text-center py-20">Loading portfolio properties...</div>
          ) : properties.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
              No properties listed yet. Use the form above to add your first property.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
                  <div>
                    {prop.image_url ? (
                      <img src={prop.image_url} alt={prop.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm">No Image Available</div>
                    )}
                    <div className="p-5">
                      <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">{prop.category || 'Property'}</span>
                      <h3 className="text-lg font-bold mt-1 text-white">{prop.title}</h3>
                      <p className="text-neutral-400 text-xs mt-1">{prop.location}</p>
                      <p className="text-emerald-400 font-bold mt-4">${prop.price_per_night} <span className="text-xs text-neutral-400 font-normal">/ night</span></p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 font-medium py-2 rounded-lg text-xs transition"
                    >
                      Delete Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}