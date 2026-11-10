'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Property {
  id: string
  title: string
  category: 'Apartment' | 'Villa' | 'Mansion' | 'House'
  location: string
  price: number
  image_url: string
  description: string
}

const UPSELL_OPTIONS = [
  { id: 'transfer', name: '🚗 Airport VIP Transfer', price: 50 },
  { id: 'chef', name: '👨‍🍳 Private Chef Service', price: 80 },
  { id: 'tours', name: '🗺️ Guided City Tour', price: 100 },
  { id: 'grocery', name: '🛒 Welcome Grocery Stocking', price: 40 },
]

export default function FreshLaEstanciaLanding() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All Properties')
  const [loading, setLoading] = useState(true)

  // Accommodation Booking Modal States
  const [activeProperty, setActiveProperty] = useState<Property | null>(null)
  const [travelerName, setTravelerName] = useState('')
  const [isCouple, setIsCouple] = useState(false)
  const [hasKids, setHasKids] = useState(false)
  const [kidsAges, setKidsAges] = useState('')
  const [totalGuests, setTotalGuests] = useState(1)
  const [travelReason, setTravelReason] = useState<'Fun' | 'Business' | 'Party'>('Fun')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [originRegion, setOriginRegion] = useState('USA')
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([])
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  // Standalone Upsell Modal States
  const [showStandaloneUpsellModal, setShowStandaloneUpsellModal] = useState(false)
  const [upsellClientName, setUpsellClientName] = useState('')
  const [upsellClientPhone, setUpsellClientPhone] = useState('')
  const [standaloneSelected, setStandaloneSelected] = useState<string[]>([])
  const [upsellSubmitted, setUpsellSubmitted] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      const { data, error } = await supabase.from('properties').select('*')
      if (error) throw error
      if (data) setProperties(data)
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  // Accommodation Calculation
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  const nights = calculateNights()
  const nightlyRate = activeProperty ? activeProperty.price : 0
  const accommodationCost = nights * nightlyRate

  const upsellsTotal = selectedUpsells.reduce((sum, id) => {
    const item = UPSELL_OPTIONS.find(u => u.id === id)
    return sum + (item ? item.price : 0)
  }, 0)

  const grandTotal = accommodationCost + upsellsTotal

  // Standalone Upsell Total Calculation
  const standaloneTotal = standaloneSelected.reduce((sum, id) => {
    const item = UPSELL_OPTIONS.find(u => u.id === id)
    return sum + (item ? item.price : 0)
  }, 0)

  const toggleUpsell = (id: string, isStandalone = false) => {
    if (isStandalone) {
      setStandaloneSelected(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      )
    } else {
      setSelectedUpsells(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      )
    }
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeProperty) return

    try {
      const { error } = await supabase.from('bookings').insert([
        {
          property_id: activeProperty.id,
          property_title: activeProperty.title,
          traveler_name: travelerName,
          is_couple: isCouple,
          has_kids: hasKids,
          kids_ages: kidsAges,
          total_guests: totalGuests,
          travel_reason: travelReason,
          check_in: checkIn,
          check_out: checkOut,
          origin_region: originRegion,
          upsells_chosen: selectedUpsells.join(', '),
          total_cost: grandTotal,
          status: 'Confirmed',
          created_at: new Date().toISOString()
        }
      ])

      if (error) throw error
      setBookingSubmitted(true)
    } catch (err) {
      console.error('Error creating booking:', err)
      alert('Error submitting booking. Please try again.')
    }
  }

  async function handleStandaloneUpsellSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          property_title: 'STANDALONE UPSELL SERVICE',
          traveler_name: upsellClientName,
          traveler_phone: upsellClientPhone,
          upsells_chosen: standaloneSelected.join(', '),
          total_cost: standaloneTotal,
          status: 'Upsell Only',
          created_at: new Date().toISOString()
        }
      ])

      if (error) throw error
      setUpsellSubmitted(true)
    } catch (err) {
      console.error('Error submitting standalone upsell:', err)
      alert('Error submitting upsell order. Please try again.')
    }
  }

  const filteredProperties = selectedCategory === 'All Properties'
    ? properties
    : properties.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-wider text-amber-400">
            LA ESTANCIA
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowStandaloneUpsellModal(true)
                setStandaloneSelected([])
                setUpsellSubmitted(false)
              }}
              className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-semibold hover:border-amber-500 hover:text-amber-400 transition-colors"
            >
              ✨ Book Upsells Only
            </button>
            <Link 
              href="/portal"
              className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
            >
              Host Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Global Short-Stay <span className="text-amber-400">Vacation Homes</span>
        </h1>
        <p className="text-neutral-400 text-base max-w-xl mx-auto mb-8">
          Curated apartments, villas, mansions, and stand-alone houses.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['All Properties', 'Apartment', 'Villa', 'Mansion', 'House'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Properties Section */}
      <section className="px-6 pb-24 max-w-7xl mx-auto w-full flex-1">
        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-sm animate-pulse">Loading listings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
                <div className="relative h-60 w-full bg-neutral-800">
                  <img src={property.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} alt={property.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-neutral-950/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 border border-amber-500/20">
                    {property.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{property.title}</h3>
                    <p className="text-xs text-neutral-400">{property.location}</p>
                    <p className="text-xs text-neutral-300 mt-2 line-clamp-2">{property.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-semibold">${property.price} / night</span>
                    <button
                      onClick={() => {
                        setActiveProperty(property)
                        setSelectedUpsells([])
                        setBookingSubmitted(false)
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Standalone Upsell Booking Modal */}
      {showStandaloneUpsellModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl my-8">
            <button 
              onClick={() => setShowStandaloneUpsellModal(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {upsellSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                <h3 className="text-xl font-bold text-white mb-2">Upsell Order Created!</h3>
                <p className="text-xs text-neutral-400 mb-6">Your standalone service request has been sent to the Host Portal.</p>
                <button onClick={() => setShowStandaloneUpsellModal(false)} className="bg-neutral-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl">Close</button>
              </div>
            ) : (
              <form onSubmit={handleStandaloneUpsellSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-1">Book Standalone Upsell Services</h3>
                <p className="text-xs text-neutral-400 mb-4">Request VIP transfers, chefs, or tours without booking accommodation.</p>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name</label>
                  <input type="text" required value={upsellClientName} onChange={(e) => setUpsellClientName(e.target.value)} placeholder="Full Name" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Phone Number / WhatsApp</label>
                  <input type="text" required value={upsellClientPhone} onChange={(e) => setUpsellClientPhone(e.target.value)} placeholder="+256..." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <label className="block text-xs font-bold text-amber-400 mb-2">✨ Select Services</label>
                  <div className="space-y-2">
                    {UPSELL_OPTIONS.map((upsell) => (
                      <div 
                        key={upsell.id}
                        onClick={() => toggleUpsell(upsell.id, true)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          standaloneSelected.includes(upsell.id)
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <input 
                            type="checkbox" 
                            checked={standaloneSelected.includes(upsell.id)} 
                            onChange={() => {}} 
                            className="rounded bg-neutral-950 border-neutral-800 text-amber-500" 
                          />
                          {upsell.name}
                        </div>
                        <span className="text-xs font-bold text-amber-400">+${upsell.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Total Service Cost</span>
                  <span className="text-xl font-extrabold text-white">${standaloneTotal}</span>
                </div>

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                  Submit Upsell Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Accommodation Booking Modal (With Integrated Upsells) */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-8 relative shadow-2xl my-8">
            <button 
              onClick={() => setActiveProperty(null)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {bookingSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                <h3 className="text-xl font-bold text-white mb-2">Booking Card Created!</h3>
                <p className="text-xs text-neutral-400 mb-6">Successfully sent to the Host Portal bookings ledger with chosen upsells.</p>
                <button onClick={() => setActiveProperty(null)} className="bg-neutral-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl">Close</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-1">Book Stay & Select Upsells</h3>
                <p className="text-xs text-amber-400 font-semibold mb-4">{activeProperty.title} (${activeProperty.price}/night)</p>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Traveler Name</label>
                  <input type="text" required value={travelerName} onChange={(e) => setTravelerName(e.target.value)} placeholder="Full Name" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Place of Origin</label>
                  <select value={originRegion} onChange={(e) => setOriginRegion(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white">
                    <option value="USA">USA</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Africa">Africa</option>
                    <option value="Other">Other International</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Check-In</label>
                    <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Check-Out</label>
                    <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Total Travelers</label>
                    <input type="number" min="1" value={totalGuests} onChange={(e) => setTotalGuests(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Reason for Travel</label>
                    <select value={travelReason} onChange={(e) => setTravelReason(e.target.value as any)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white">
                      <option value="Fun">Fun / Vacation</option>
                      <option value="Business">Business</option>
                      <option value="Party">Party / Event</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 py-1">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input type="checkbox" checked={isCouple} onChange={(e) => setIsCouple(e.target.checked)} className="rounded bg-neutral-950 border-neutral-800 text-amber-500" />
                    Traveling as a Couple
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input type="checkbox" checked={hasKids} onChange={(e) => setHasKids(e.target.checked)} className="rounded bg-neutral-950 border-neutral-800 text-amber-500" />
                    Have Kids
                  </label>
                </div>

                {hasKids && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Ages of Kids</label>
                    <input type="text" value={kidsAges} onChange={(e) => setKidsAges(e.target.value)} placeholder="e.g. 5, 8 years old" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-800">
                  <label className="block text-xs font-bold text-amber-400 mb-2">✨ Choose Add-On Upsell Services</label>
                  <div className="space-y-2">
                    {UPSELL_OPTIONS.map((upsell) => (
                      <div 
                        key={upsell.id}
                        onClick={() => toggleUpsell(upsell.id, false)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedUpsells.includes(upsell.id)
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <input 
                            type="checkbox" 
                            checked={selectedUpsells.includes(upsell.id)} 
                            onChange={() => {}} 
                            className="rounded bg-neutral-950 border-neutral-800 text-amber-500" 
                          />
                          {upsell.name}
                        </div>
                        <span className="text-xs font-bold text-amber-400">+${upsell.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Stay ({nights} nights @ ${nightlyRate}/n):</span>
                    <span>${accommodationCost}</span>
                  </div>
                  {upsellsTotal > 0 && (
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Upsell Add-ons:</span>
                      <span>${upsellsTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800/80">
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Grand Total Cost</span>
                    <span className="text-xl font-extrabold text-white">${grandTotal}</span>
                  </div>
                </div>

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                  Confirm Booking & Create Card
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}