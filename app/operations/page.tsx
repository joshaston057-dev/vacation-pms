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

{/* Operations Hub Tab Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search Bar */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Quick search properties, guests, or tasks..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        {/* Tab Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'properties' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            🏠 Properties
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'bookings' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            📅 Bookings
          </button>
          <button 
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'dispatch' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            ⚡ Dispatch / Tasks
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
            ⭐ Upsells
          </button>
          <button 
            onClick={() => setActiveTab('cohosts')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${activeTab === 'cohosts' ? 'bg-neutral-800 text-white border-neutral-700 shadow-lg' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-900'}`}
          >
            🤝 Co-Hosts
          </button>
        </div>

        {/* Dynamic Tab Content Display */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl min-h-[350px]">
          
          {activeTab === 'properties' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Property Management & Creation</h2>
              <p className="text-neutral-400 text-sm mb-6">Use your property creation form above to add listings, or manage existing inventory.</p>
              <div className="text-neutral-400 text-sm py-8 text-center bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                Property management view active.
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Reservations & Bookings Ledger</h2>
              <p className="text-neutral-400 text-sm mb-6">Monitor confirmed stays, guest details, and pending inquiries.</p>
              <div className="text-neutral-400 text-sm py-8 text-center bg-neutral-950/50 rounded-xl border border-neutral-800/60">
                Bookings management active.
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
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Financial Ledger & Expenses</h2>
            <p className="text-neutral-400 text-sm">Track monthly earnings, utility bills, rent, and operational costs.</p>
          </div>
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

        {/* 5. Guest Upsells & Services */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Guest Upsells & Services</h2>
            <p className="text-neutral-400 text-sm">Configure airport pickups, private chef bookings, and extra guest services.</p>
          </div>
        </div>

        {/* 6. Co-Host & Property Marketing Services */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Co-Host & Property Marketing Services</h2>
            <p className="text-neutral-400 text-sm">Manage external client property listings, landing page requests, and co-hosting agreements.</p>
          </div>
        </div>

      </div>
        {/* Reservations & Operational Ledger Module */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 border-t border-neutral-800 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Reservations & Operational Ledger</h2>
            <p className="text-neutral-400 text-sm mt-1">Track guest bookings, status updates, and operational tasks.</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">Incoming & Confirmed Bookings</h3>
          <div className="text-neutral-400 text-sm py-8 text-center bg-neutral-950/50 rounded-xl border border-neutral-800/60">
            Booking tracking ledger active. View guest contact, check-in dates, and payment statuses here.
          </div>
        </div>
      </div>

      </div>
    </main>
  )
}