'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPage() {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form states for Property
  const [propTitle, setPropTitle] = useState('')
  const [propLocation, setPropLocation] = useState('')
  const [propPrice, setPropPrice] = useState('')
  const [propBeds, setPropBeds] = useState('1')
  const [propBaths, setPropBaths] = useState('1')
  const [propGuests, setPropGuests] = useState('2')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form states for Service
  const [servTitle, setServTitle] = useState('')
  const [servCategory, setServCategory] = useState('Transport')
  const [servPrice, setServPrice] = useState('')
  const [servPriceType, setServPriceType] = useState('per trip')
  const [servDesc, setServDesc] = useState('')

  // Lists for preview
  const [propertiesList, setPropertiesList] = useState<any[]>([])
  const [servicesList, setServicesList] = useState<any[]>([])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === 'estancia2026') {
      setIsAuthenticated(true)
      setErrorMsg('')
      fetchDashboardData()
    } else {
      setErrorMsg('Invalid passcode. Access denied.')
    }
  }

  const fetchDashboardData = async () => {
    const { data: propsData } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    const { data: servsData } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    if (propsData) setPropertiesList(propsData)
    if (servsData) setServicesList(servsData)
  }

  // Upload image to Supabase Storage and return public URL
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `properties/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      let publicImageUrl = ''
      if (imageFile) {
        publicImageUrl = await uploadImage(imageFile)
      }

      const { error } = await supabase.from('properties').insert([
        {
          title: propTitle,
          location: propLocation,
          price_per_night: parseFloat(propPrice),
          bedrooms: parseInt(propBeds),
          bathrooms: parseInt(propBaths),
          guests: parseInt(propGuests),
          image_url: publicImageUrl
        }
      ])

      if (error) throw error

      alert('Property created successfully!')
      setPropTitle('')
      setPropLocation('')
      setPropPrice('')
      setImageFile(null)
      fetchDashboardData()
    } catch (err: any) {
      alert(`Error saving property: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('services').insert([
        {
          title: servTitle,
          category: servCategory,
          price: parseFloat(servPrice),
          price_type: servPriceType,
          description: servDesc
        }
      ])

      if (error) throw error

      alert('Service created successfully!')
      setServTitle('')
      setServPrice('')
      setServDesc('')
      fetchDashboardData()
    } catch (err: any) {
      alert(`Error saving service: ${err.message}`)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchDashboardData()
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    fetchDashboardData()
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h1 className="text-2xl font-bold text-amber-500 mb-2">Host OS Operations</h1>
            <p className="text-sm text-neutral-400 mb-6">Enter your administrative passcode to manage properties and concierge services.</p>
            
            <input 
              type="password" 
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg mb-4 text-white focus:outline-none focus:border-amber-500"
            />
            
            {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}
            
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition">
              Unlock Portal
            </button>
          </form>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-neutral-800">
            <div>
              <h1 className="text-3xl font-extrabold text-amber-500">EstanciaOS Host Portal</h1>
              <p className="text-neutral-400 text-sm mt-1">Manage vacation properties, concierge pricing, and live content.</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="mt-4 md:mt-0 px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white rounded-lg text-sm"
            >
              🔒 Lock Portal
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* PROPERTY FORM */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4"> Add New Property</h2>
              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Property Title</label>
                  <input required type="text" placeholder="e.g. Kololo Luxury Apartment" value={propTitle} onChange={e=>setPropTitle(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Location</label>
                  <input required type="text" placeholder="e.g. Kololo, Kampala" value={propLocation} onChange={e=>setPropLocation(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Price per Night ($)</label>
                    <input required type="number" placeholder="150" value={propPrice} onChange={e=>setPropPrice(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Max Guests</label>
                    <input required type="number" value={propGuests} onChange={e=>setPropGuests(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Bedrooms</label>
                    <input required type="number" value={propBeds} onChange={e=>setPropBeds(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Bathrooms</label>
                    <input required type="number" value={propBaths} onChange={e=>setPropBaths(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Property Photo (Supabase Storage)</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700" />
                </div>
                <button disabled={uploading} type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition disabled:opacity-50">
                  {uploading ? 'Uploading Photo & Saving...' : 'Publish Property'}
                </button>
              </form>
            </div>

            {/* SERVICE FORM */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4"> Add Concierge Service / Upsell</h2>
              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Service Title</label>
                  <input required type="text" placeholder="e.g. VIP Airport Transfer" value={servTitle} onChange={e=>setServTitle(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Category</label>
                    <select value={servCategory} onChange={e=>setServCategory(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white">
                      <option value="Transport">Transport</option>
                      <option value="Dining">Dining & Private Chef</option>
                      <option value="Experiences">Safari & Experiences</option>
                      <option value="Wellness">Wellness & Spa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Price ($)</label>
                    <input required type="number" placeholder="45" value={servPrice} onChange={e=>setServPrice(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Billing Type</label>
                  <input required type="text" placeholder="e.g. per trip, per day, per stay" value={servPriceType} onChange={e=>setServPriceType(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Description</label>
                  <textarea required rows={3} placeholder="Brief summary of what's included..." value={servDesc} onChange={e=>setServDesc(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition">
                  Publish Concierge Offer
                </button>
              </form>
            </div>
          </div>

          {/* ACTIVE MANAGEMENT TABLES */}
          <div className="mt-12 space-y-8">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Active Properties ({propertiesList.length})</h3>
              {propertiesList.length === 0 ? (
                <p className="text-xs text-neutral-500">No properties in database.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="text-xs uppercase bg-neutral-950 text-neutral-500">
                      <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Price/Night</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertiesList.map(p => (
                        <tr key={p.id} className="border-b border-neutral-800">
                          <td className="p-3 font-semibold text-white">{p.title}</td>
                          <td className="p-3">{p.location}</td>
                          <td className="p-3 text-amber-500">${p.price_per_night}</td>
                          <td className="p-3">
                            <button onClick={()=>handleDeleteProperty(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}