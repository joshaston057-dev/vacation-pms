'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [nightlyPrice, setNightlyPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [icalUrl, setIcalUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const whatsappNumber = '256757386946'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchProperties = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', user.id)

      if (!error && data) {
        setProperties(data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('properties').insert([
        {
          title: title,
          location: location,
          nightly_price: parseFloat(nightlyPrice) || 120,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
          ical_url: icalUrl || null,
          host_id: user.id,
        },
      ])

      if (!error) {
        setTitle('')
        setLocation('')
        setNightlyPrice('')
        setImageUrl('')
        setIcalUrl('')
        setIsModalOpen(false)
        fetchProperties()
      } else {
        alert('Failed to add property: ' + error.message)
      }
    }
    setSubmitting(false)
  }

  const getWhatsAppLink = (propertyTitle: string, location: string, price: number) => {
    const message = encodeURIComponent(
      `Hello La Estancia Vacation Homes! I am interested in booking *${propertyTitle}* located in *${location}* ($${price}/night). Please share availability and payment details.`
    )
    return `https://wa.me/${whatsappNumber}?text=${message}`
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
              LA ESTANCIA PORTFOLIO
            </p>
            <h1 className="text-3xl font-bold mt-1">Managed Properties</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition"
            >
              + Add Property
            </button>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="bg-[#131c2e] border border-gray-800 text-amber-400 font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition"
            >
              📅 Sync iCal Calendars
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#0e1626] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <p className="text-sm text-gray-400 font-medium">Active Listings</p>
            <p className="text-3xl font-bold text-amber-500 mt-1">
              {properties.length}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#131c2e] px-4 py-2.5 rounded-lg border border-gray-800 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Direct WhatsApp Bookings: <strong className="text-emerald-400">+256 757 386 946</strong>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading property listings...
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-[#0e1626] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">
              No properties found in your database.
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Click "+ Add Property" above to list your first home and start accepting WhatsApp direct bookings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-[#0e1626] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-amber-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full bg-gray-800 relative overflow-hidden">
                    <img
                      src={prop.image_url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow">
                      Active
                    </span>
                  </div>
                  
                  <div className="p-5 space-y-2">
                    <h3 className="text-xl font-bold text-white">{prop.title}</h3>
                    <p className="text-sm text-amber-400/90 font-medium">📍 {prop.location}</p>
                    <p className="text-sm font-semibold text-gray-300 pt-2">
                      💰 ${prop.nightly_price || 120} <span className="text-xs text-gray-500 font-normal">/ night</span>
                    </p>
                    <div className="pt-2 text-xs text-gray-400 border-t border-gray-800/80 flex items-center justify-between">
                      <span>Calendar Sync:</span>
                      {prop.ical_url ? (
                        <span className="text-emerald-400 font-medium">Connected</span>
                      ) : (
                        <span className="text-gray-500">Not configured</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <a
                    href={getWhatsAppLink(prop.title, prop.location, prop.nightly_price || 120)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    💬 Book via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1626] border border-gray-800 rounded-xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-xl font-bold text-white">Add New Property</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Standalone House"
                  className="w-full bg-[#131c2e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kyanja, Kampala"
                  className="w-full bg-[#131c2e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nightly Price ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={nightlyPrice}
                  onChange={(e) => setNightlyPrice(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full bg-[#131c2e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#131c2e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  iCal Feed URL (Airbnb / Booking.com)
                </label>
                <input
                  type="url"
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  className="w-full bg-[#131c2e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Paste your Airbnb or Booking.com export calendar link here.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync iCal Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1626] border border-gray-800 rounded-xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-xl font-bold text-white">📅 iCal Calendar Sync Overview</h3>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <p>Below are your registered properties and their connected calendar feed URLs:</p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {properties.map((p) => (
                  <div key={p.id} className="bg-[#131c2e] p-3.5 rounded-lg border border-gray-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-white">{p.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${p.ical_url ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {p.ical_url ? 'Connected' : 'Missing iCal Link'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {p.ical_url || 'No iCal URL added yet.'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300 space-y-1">
                <p className="font-semibold">💡 How iCal Sync works:</p>
                <p>
                  When you copy your Airbnb or Booking.com Export Calendar URL into EstanciaOS, incoming external reservations will automatically synchronize to prevent double-bookings.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}