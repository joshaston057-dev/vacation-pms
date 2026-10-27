'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OperationsPortal() {
  // Property Form State
  const [propertyTitle, setPropertyTitle] = useState('')
  const [propertyPrice, setPropertyPrice] = useState('')
  const [propertyLocation, setPropertyLocation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [propertyLoading, setPropertyLoading] = useState(false)
  const [propertyMsg, setPropertyMsg] = useState('')

  // Concierge Form State
  const [serviceTitle, setServiceTitle] = useState('')
  const [category, setCategory] = useState('Transport')
  const [servicePrice, setServicePrice] = useState('')
  const [description, setDescription] = useState('')
  const [serviceLoading, setServiceLoading] = useState(false)
  const [serviceMsg, setServiceMsg] = useState('')

  // Handle Property Submit
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setPropertyLoading(true)
    setPropertyMsg('')

    try {
      const { error } = await supabase.from('properties').insert([
        {
          title: propertyTitle,
          price_per_night: parseFloat(propertyPrice),
          location: propertyLocation,
          image_url: imageUrl,
        },
      ])

      if (error) throw error

      setPropertyMsg('✨ Property listed successfully!')
      setPropertyTitle('')
      setPropertyPrice('')
      setPropertyLocation('')
      setImageUrl('')
    } catch (err: any) {
      setPropertyMsg(`❌ Failed: ${err.message}`)
    } finally {
      setPropertyLoading(false)
    }
  }

  // Handle Concierge Service Submit
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceLoading(true)
    setServiceMsg('')

    try {
      const { error } = await supabase.from('concierge_services').insert([
        {
          title: serviceTitle,
          category,
          price: parseFloat(servicePrice),
          description,
        },
      ])

      if (error) throw error

      setServiceMsg('✨ Concierge service added successfully!')
      setServiceTitle('')
      setServicePrice('')
      setDescription('')
    } catch (err: any) {
      setServiceMsg(`❌ Failed: ${err.message}`)
    } finally {
      setServiceLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-amber-500">EstanciaOS Operations</h1>
          <p className="text-neutral-400 text-sm">Manage global property inventory and guest concierge offerings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Property Form */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add Vacation Property</h2>
            {propertyMsg && <p className="mb-4 p-3 bg-neutral-800 text-amber-500 rounded-lg text-sm">{propertyMsg}</p>}
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Sunset Villa"
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Price / Night ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miami, USA"
                    value={propertyLocation}
                    onChange={(e) => setPropertyLocation(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Main Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={propertyLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-sm transition"
              >
                {propertyLoading ? 'Listing Property...' : 'Publish Property'}
              </button>
            </form>
          </div>

          {/* Add Concierge Service Form */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add Concierge Service</h2>
            {serviceMsg && <p className="mb-4 p-3 bg-neutral-800 text-amber-500 rounded-lg text-sm">{serviceMsg}</p>}
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Airport Transfer"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Dining">Private Chef</option>
                    <option value="Excursions">Tours</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="75"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details about what the service includes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={serviceLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-sm transition"
              >
                {serviceLoading ? 'Adding Service...' : 'Publish Service'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}