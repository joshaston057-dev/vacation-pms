'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
import { supabase } from '@/lib/supabase'

export default function GuestHomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // INDIVIDUAL GALLERY MODAL
  const [activeGalleryImages, setActiveGalleryImages] = useState<string[] | null>(null)
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0)

  // RESERVATION MODAL
  const [selectedProp, setSelectedProp] = useState<any | null>(null)

  // DESCRIPTION TOGGLE
  const [expandedDesc, setExpandedDesc] = useState<{ [key: string]: boolean }>({})

  // FORM INPUTS
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [adults, setAdults] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)
  const [childAges, setChildAges] = useState('')
  const [nationality, setNationality] = useState('Uganda')
  const [purpose, setPurpose] = useState('Solo Business Traveler')
  const [source, setSource] = useState('TikTok')
  const [guestNotes, setGuestNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPageData()
  }, [])

  const fetchPageData = async () => {
    setLoading(true)
    try {
      const [propsRes, upsellRes] = await Promise.all([
        supabase.from('properties').select('*').order('id', { ascending: false }),
        supabase.from('upsell_services').select('*').eq('active', true).order('id', { ascending: true })
      ])

      if (propsRes.data) setProperties(propsRes.data)
      if (upsellRes.data) setUpsells(upsellRes.data)
    } catch (err) {
      console.error('Error fetching page data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDescription = (id: string) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredProperties =
    selectedCategory === 'All'
      ? properties
      : properties.filter(
          (p) => (p.category || 'Apartment').toLowerCase() === selectedCategory.toLowerCase()
        )

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
    return diff > 0 ? diff : 1
  }

  const nights = calculateNights()
  const baseRate = selectedProp ? selectedProp.price || 0 : 0
  const cleaningFee = selectedProp?.cleaning_fee || 0
  const partyDeposit = purpose === 'Party / Event' ? selectedProp?.party_security_deposit || 0 : 0
  const grandTotal = nights * baseRate + cleaningFee + partyDeposit

  const handleSendInquiryRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkIn || !checkOut || !guestName || !guestPhone) {
      alert('Please fill in all required stay fields.')
      return
    }

    setSubmitting(true)

    try {
      const txnRef = `LE-INQ-${Math.floor(100000 + Math.random() * 900000)}`

      const { data: booking, error: bErr } = await supabase
        .from('bookings')
        .insert([
          {
            property_id: selectedProp.id,
            host_id: selectedProp.host_id,
            property_title: selectedProp.title,
            guest_name: guestName,
            phone: guestPhone,
            adults: adults,
            children: childrenCount,
            child_ages: childAges,
            nationality: nationality,
            purpose: purpose,
            booking_source: source,
            guest_notes: guestNotes,
            check_in: checkIn,
            check_out: checkOut,
            total_price: grandTotal,
            paid_amount: 0,
            security_deposit_paid: partyDeposit,
            transaction_ref: txnRef,
            status: 'PENDING'
          }
        ])
        .select()
        .single()

      if (bErr) throw bErr

      const hostWhatsApp = '+256757386946'
      const whatsappText = encodeURIComponent(
        `🛎️ NEW BOOKING INQUIRY - LA ESTANCIA\n\n` +
        `👤 Guest Name: ${guestName}\n` +
        `📞 Phone: ${guestPhone}\n` +
        `🏡 Property: ${selectedProp.title}\n` +
        `🌍 Nationality: ${nationality}\n` +
        `👥 Demographic: ${purpose} (${adults} Adults, ${childrenCount} Kids)\n` +
        `📅 Dates: ${checkIn} → ${checkOut} (${nights} nights)\n` +
        `💰 Total Stay: $${grandTotal} (30% Deposit Due: $${Math.round(grandTotal * 0.3)})\n` +
        `📝 Notes: ${guestNotes || 'None'}\n` +
        `🔖 Ref: ${txnRef}\n\n` +
        `👉 Please chat with guest to verify terms before approving payment.`
      )

      window.open(`https://api.whatsapp.com/send?phone=${hostWhatsApp.replace(/[^0-9]/g, '')}&text=${whatsappText}`, '_blank')

      setSelectedProp(null)
      alert('🎉 Inquiry submitted successfully! Our host has received your details and will connect with you shortly.')
    } catch (err: any) {
      alert('Error submitting inquiry: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            La Estancia Vacation Homes
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Global Short-Stay Vacation Homes
          </h1>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto">
            Curated apartments, villas, mansions, and stand-alone houses available for international travelers.
          </p>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['All', 'Apartment', 'Villa', 'Mansion', 'House'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-lg'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? '✨ All Properties' : cat}
              </button>
            ))}
          </div>
        </section>

        {/* CATALOG */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              <span className="text-amber-400">🏡</span> {selectedCategory} Stays ({filteredProperties.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-500 animate-pulse text-center py-12">Loading listings...</p>
          ) : filteredProperties.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs font-bold bg-neutral-900/50 rounded-2xl border border-neutral-800">
              No properties found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((p) => {
                const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
                const isExpanded = expandedDesc[p.id] || false

                return (
                  <div
                    key={p.id}
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden shadow-2xl transition flex flex-col justify-between group"
                  >
                    <div>
                      <div
                        onClick={() => {
                          if (gallery.length > 0) {
                            setActiveGalleryImages(gallery)
                            setCurrentGalleryIdx(0)
                          }
                        }}
                        className="relative aspect-[16/10] bg-neutral-950 overflow-hidden cursor-pointer group/img"
                      >
                        {gallery.length > 0 ? (
                          <img
                            src={gallery[0]}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold">
                            No Photo Available
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {p.category || 'Apartment'}
                          </span>
                        </div>

                        {gallery.length > 0 && (
                          <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-neutral-700 flex items-center gap-1">
                            📷 View {gallery.length} Photo{gallery.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className="font-black text-white text-base leading-tight truncate">{p.title}</h3>
                          <div className="text-right shrink-0">
                            <span className="text-amber-400 font-black text-base">${p.price || 0}</span>
                            <span className="text-[10px] text-neutral-400 font-medium"> /night</span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          <span>📍</span> {p.location}
                        </p>

                        {p.description && (
                          <div className="space-y-1">
                            <button
                              onClick={() => toggleDescription(p.id)}
                              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? '▾ Hide Description' : '▸ Show Description'}</span>
                            </button>
                            {isExpanded && (
                              <p className="text-[11px] text-neutral-300 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 leading-relaxed">
                                {p.description}
                              </p>
                            )}
                          </div>
                        )}

                        {p.amenities && p.amenities.length > 0 && (
                          <div className="border-t border-neutral-800 pt-2 space-y-1.5">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                              Amenities & Features
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {p.amenities.map((item: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-neutral-950 border border-neutral-800 text-[10px] font-bold text-neutral-300 px-2.5 py-1 rounded-lg"
                                >
                                  ✓ {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-2">
                      <button
                        onClick={() => setSelectedProp(p)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition duration-200 cursor-pointer active:scale-[0.98]"
                      >
                        Book Now / Inquire
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* UPSELL SERVICES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 border-t border-neutral-900 mt-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
              VIP Guest Experience
            </span>
            <h2 className="text-xl font-black text-white">Add-On Hospitality Services</h2>
            <p className="text-xs text-neutral-400">Enhance your stay with our exclusive in-house services.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upsells.map((u) => (
              <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl">{u.icon || '✨'}</span>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      +${u.price}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm">{u.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{u.description}</p>
                </div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block pt-2 border-t border-neutral-800">
                  {u.category} • Available for your stay
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* GALLERY MODAL */}
      {activeGalleryImages && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4">
          <div className="w-full max-w-4xl flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-400">
              Photo {currentGalleryIdx + 1} of {activeGalleryImages.length}
            </span>
            <button
              onClick={() => setActiveGalleryImages(null)}
              className="text-neutral-400 hover:text-white font-black text-base cursor-pointer px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-xl"
            >
              ✕ Close
            </button>
          </div>

          <div className="relative max-w-4xl w-full flex-1 flex items-center justify-center my-4">
            <img
              src={activeGalleryImages[currentGalleryIdx]}
              alt="Gallery"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-neutral-800"
            />

            {activeGalleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentGalleryIdx((prev) => (prev === 0 ? activeGalleryImages.length - 1 : prev - 1))}
                  className="absolute left-2 bg-black/80 hover:bg-neutral-800 border border-neutral-700 text-white font-black p-3 rounded-2xl cursor-pointer text-lg"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentGalleryIdx((prev) => (prev === activeGalleryImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 bg-black/80 hover:bg-neutral-800 border border-neutral-700 text-white font-black p-3 rounded-2xl cursor-pointer text-lg"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* INQUIRY MODAL */}
      {selectedProp && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Direct Host Inquiry</span>
                <h3 className="text-lg font-black text-white">{selectedProp.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProp(null)}
                className="text-neutral-400 hover:text-white font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInquiryRequest} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">1. Select Stay Dates</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Check-In</label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 mb-1">Check-Out</label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  2. Guest Demographics & Contact
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Linton"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">WhatsApp Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+256700000000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Adults (18+)</label>
                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(parseInt(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Child Ages</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 yrs"
                      value={childAges}
                      onChange={(e) => setChildAges(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Demographic / Stay Type</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold"
                    >
                      <option value="Solo Business Traveler">Solo Business Traveler</option>
                      <option value="Couple with Kids">Couple with Kids</option>
                      <option value="Leisure Vacation">Leisure Vacation</option>
                      <option value="Party / Event">Party / Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold">Nationality</label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-2.5 rounded-xl font-bold"
                    >
                      <option value="Uganda">Uganda</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Other">Other International</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-bold">Note to Host</label>
                  <input
                    type="text"
                    placeholder="e.g. I have a playing board or special requests"
                    value={guestNotes}
                    onChange={(e) => setGuestNotes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white p-3 rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between font-black text-sm text-white">
                  <span>Total Stay Estimate:</span>
                  <span className="text-amber-400">${grandTotal}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-400">
                  <span>30% Deposit Due After Talking:</span>
                  <span className="text-emerald-400">${Math.round(grandTotal * 0.3)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer text-center"
              >
                {submitting ? 'Sending Inquiry...' : '💬 Send Inquiry via WhatsApp to Host'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}