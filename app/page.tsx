"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Property {
  id: string;
  title: string;
  category: string;
  price?: number;
  nightly_rate?: number;
  rate?: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  guests?: number;
  image_url: string;
  images?: string[];
  description?: string;
  amenities?: string[] | string;
  is_active: boolean;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cardImageIndexes, setCardImageIndexes] = useState<Record<string, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<"about" | "blog" | null>(null);

  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [purposeOfStay, setPurposeOfStay] = useState("Leisure / Vacation");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    const fetchLiveProperties = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("properties").select("*");

      if (!error && data) {
        const liveOnly = data.filter((p: any) => p.is_active !== false);
        setProperties(liveOnly);
      }
      setLoading(false);
    };

    fetchLiveProperties();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveProperty(null);
        setInfoModal(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPropertyImages = (prop: Property): string[] => {
    if (Array.isArray(prop.images) && prop.images.length > 0) {
      return prop.images;
    }
    if (prop.image_url) {
      return [prop.image_url];
    }
    return ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"];
  };

  const getPropertyPrice = (prop: Property): number => {
    return Number(prop.price ?? prop.nightly_rate ?? prop.rate ?? 100);
  };

  const getAmenitiesList = (prop: Property): string[] => {
    if (Array.isArray(prop.amenities)) return prop.amenities;
    if (typeof prop.amenities === "string" && prop.amenities.trim().length > 0) {
      return prop.amenities.split(",").map((a) => a.trim());
    }
    return ["WiFi", "Kitchen", "Security", "Hot Shower", "Free Parking"];
  };

  const handleCycleCardImage = (e: React.MouseEvent, propId: string, total: number, dir: number) => {
    e.stopPropagation();
    setCardImageIndexes((prev) => {
      const current = prev[propId] || 0;
      const next = (current + dir + total) % total;
      return { ...prev, [propId]: next };
    });
  };

  const openBookingModal = (prop: Property) => {
    setActiveProperty(prop);
    setBookingSubmitted(false);
  };

  const calculateStayDetails = (startStr: string, endStr: string, rate: number) => {
    if (!startStr || !endStr) return { nights: 1, total: rate };
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return { nights, total: nights * rate };
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty) return;
    setSubmitting(true);

    const rate = getPropertyPrice(activeProperty);
    const stay = calculateStayDetails(checkIn, checkOut, rate);
    const totalGuests = Number(adultsCount) + Number(childrenCount);

    const bookingPayload = {
      id: crypto.randomUUID(),
      property_name: activeProperty.title,
      guest_name: guestName,
      phone: phone,
      nationality: nationality || "Standard",
      gender: gender || null,
      age_group: ageGroup || null,
      purpose_of_stay: purposeOfStay || "Leisure / Vacation",
      check_in: checkIn,
      check_out: checkOut,
      guests_count: totalGuests > 0 ? totalGuests : 1,
      adults_count: Number(adultsCount) || 1,
      children_count: Number(childrenCount) || 0,
      special_requests: specialRequests || "",
      status: "Pending",
      total_amount: stay.total,
    };

    if (supabase) {
      const { error } = await supabase.from("bookings").insert([bookingPayload]);
      if (error) {
        alert("Booking submission error: " + error.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setBookingSubmitted(true);
  };

  const handleWhatsAppConfirm = () => {
    if (!activeProperty) return;
    const rate = getPropertyPrice(activeProperty);
    const stay = calculateStayDetails(checkIn, checkOut, rate);
    const totalGuests = Number(adultsCount) + Number(childrenCount);
    const helplineNumber = "256757386946";
    const message = encodeURIComponent(
      `New Direct Booking Inquiry:\n\n*${activeProperty.title}*\n📍 Location: ${activeProperty.location}\n💰 Rate: $${rate}/night (${stay.nights} nights — Total: $${stay.total})\n\n👤 *Guest Profile*:\nName: ${guestName}\nWhatsApp: ${phone}\nNationality: ${nationality || "N/A"}\nGender: ${gender || "N/A"} | Age: ${ageGroup || "N/A"}\nPurpose: ${purposeOfStay || "Leisure / Vacation"}\nGuests: ${totalGuests} (${adultsCount} Adults, ${childrenCount} Kids)\n\n📅 *Dates*:\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nNotes: ${specialRequests || "None"}`
    );
    window.open(`https://wa.me/${helplineNumber}?text=${message}`, "_blank");
  };

  const filteredProperties =
    selectedCategory === "All"
      ? properties
      : properties.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
              LE
            </div>
            <div className="leading-tight">
              <span className="text-sm font-black tracking-wider text-white">LA ESTANCIA</span>
              <span className="block text-[9px] text-amber-400 font-semibold tracking-widest uppercase">
                Vacation Homes
              </span>
            </div>
          </a>

          <div className="flex items-center gap-5 relative">
            <a
              href="/api/ical"
              target="_blank"
              className="text-xs font-medium text-neutral-300 hover:text-amber-400 transition flex items-center gap-1.5"
            >
              <span>📅</span> iCal Sync
            </a>
            <a
              href="#upsells"
              className="text-xs font-medium text-neutral-300 hover:text-amber-400 transition"
            >
              Upsell Services
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-neutral-900 border border-neutral-800 text-amber-400 p-2.5 rounded-xl cursor-pointer hover:bg-neutral-800 transition"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-52 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl py-2 z-40 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setInfoModal("about");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-amber-400 transition cursor-pointer flex items-center gap-2"
                >
                  <span>🏛️</span> About Us
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInfoModal("blog");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-amber-400 transition cursor-pointer flex items-center gap-2"
                >
                  <span>📰</span> Blog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-900 py-5 text-center px-4 bg-gradient-to-b from-neutral-900/40 to-transparent">
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
          Explore our curated portfolio of short-stay apartments, standalone houses, mansions, and villas across Uganda. Swipe through property photos and book directly.
        </p>
      </div>

      <main id="properties" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Featured Properties</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Swipe or tap arrows on each card to view all property images.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Apartment", "Stand-Alone House", "Mansion", "Villa"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {cat === "All" ? "All Categories" : `${cat}s`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-xs text-neutral-400">Loading available properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-24 text-xs text-neutral-400 bg-neutral-900/40 rounded-2xl border border-neutral-800">
            No live properties available in this category right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const imgs = getPropertyImages(prop);
              const currentIdx = cardImageIndexes[prop.id] || 0;
              const rate = getPropertyPrice(prop);
              const amenities = getAmenitiesList(prop);

              return (
                <div
                  key={prop.id}
                  className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition group"
                >
                  <div>
                    <div className="relative h-60 w-full bg-neutral-950 overflow-hidden">
                      <img
                        src={imgs[currentIdx]}
                        alt={prop.title}
                        className="w-full h-full object-cover transition-all duration-300"
                      />

                      <span className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md text-amber-400 border border-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {prop.category}
                      </span>

                      <span className="absolute top-3 right-3 bg-neutral-950/85 backdrop-blur-md text-neutral-200 border border-neutral-800 text-[10px] font-medium px-2.5 py-1 rounded-lg">
                        📷 {currentIdx + 1} / {imgs.length}
                      </span>

                      {imgs.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleCycleCardImage(e, prop.id, imgs.length, -1)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-xs transition cursor-pointer shadow-lg"
                            aria-label="Previous photo"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCycleCardImage(e, prop.id, imgs.length, 1)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-xs transition cursor-pointer shadow-lg"
                            aria-label="Next photo"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-sm font-bold text-white leading-snug line-clamp-2">{prop.title}</h2>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-amber-400">${rate}</span>
                          <span className="text-[11px] text-neutral-400">/nt</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400">📍 {prop.location || "Kampala, Uganda"}</p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-1">
                        <span>🛏️ {prop.bedrooms || 1} Beds</span>
                        <span>🚿 {prop.bathrooms || 1} Baths</span>
                        <span>👥 {prop.guests || (prop.bedrooms || 1) * 2} Guests</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {amenities.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-300 px-2 py-0.5 rounded-md"
                          >
                            ✓ {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() => openBookingModal(prop)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                    >
                      <span>✨</span> Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Upsell Services Section */}
      <section id="upsells" className="border-t border-neutral-900 bg-neutral-900/30 py-16 px-4 sm:px-8 mt-16">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Standalone Upsell Services</h2>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto">
            Enhance your stay with La Estancia's auxiliary services, available upon request during your reservation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2">
              <div className="text-amber-400 text-lg">🚗</div>
              <div className="text-xs font-bold text-white">Airport Transfers</div>
              <p className="text-[11px] text-neutral-400">Reliable airport pickups and drop-offs directly to your property.</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2">
              <div className="text-amber-400 text-lg">🧹</div>
              <div className="text-xs font-bold text-white">Daily Housekeeping</div>
              <p className="text-[11px] text-neutral-400">Professional cleaning and linen refresh services during your stay.</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-2">
              <div className="text-amber-400 text-lg">🍳</div>
              <div className="text-xs font-bold text-white">Private Chef & Catering</div>
              <p className="text-[11px] text-neutral-400">Custom meal preparation by professional local chefs in your kitchen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us & Blog Modal */}
      {infoModal && (
        <div
          onClick={() => setInfoModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                {infoModal === "about" ? "About La Estancia Vacation Homes" : "La Estancia Travel & Stay Blog"}
              </h2>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {infoModal === "about" ? (
              <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
                <p>
                  <strong className="text-amber-400">La Estancia Vacation Homes</strong> is an independent short-stay property agency and co-hosting management company operating across Kampala, Entebbe, Munyonyo, Kira, and surrounding prime neighborhoods in Uganda.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-neutral-300">
                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">City Guide</span>
                  <h3 className="text-sm font-bold text-white">Top Neighborhoods for Short Stays in Kampala & Entebbe</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    From lakeside mansions in Munyonyo and Entebbe to modern apartments in Kira and Kisaasi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {activeProperty && (
        <div
          onClick={() => setActiveProperty(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-auto"
          >
            <div className="sticky top-0 z-20 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  {activeProperty.category} &bull; 📍 {activeProperty.location}
                </span>
                <h2 className="text-sm font-bold text-white truncate">
                  {activeProperty.title} (${getPropertyPrice(activeProperty)}/night)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProperty(null)}
                className="shrink-0 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 font-semibold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              {bookingSubmitted ? (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-5 text-xs text-center">
                  <div className="text-3xl">🎉</div>
                  <h3 className="text-sm font-bold text-white">Reservation & Guest Profile Logged!</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-md mx-auto">
                    Thank you, <strong className="text-white">{guestName}</strong>. Your booking and check-in profile have been recorded. Tap below to send your confirmation straight to our WhatsApp concierge.
                  </p>

                  <div className="space-y-2.5 pt-3">
                    <button
                      type="button"
                      onClick={handleWhatsAppConfirm}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <span>Confirm via WhatsApp →</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveProperty(null)}
                      className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold py-3 rounded-xl transition cursor-pointer text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleBookingSubmit}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 text-xs"
                >
                  <div className="font-bold text-white text-sm border-b border-neutral-800 pb-2">
                    📝 Traveler Demographic & Reservation Form
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Guest Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Phone Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="+256..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Nationality</label>
                      <input
                        type="text"
                        placeholder="e.g. Ugandan"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Age Group</label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      >
                        <option value="">Select</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-50">36-50</option>
                        <option value="51+">51+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Purpose of Stay</label>
                      <select
                        value={purposeOfStay}
                        onChange={(e) => setPurposeOfStay(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      >
                        <option value="Leisure / Vacation">Leisure / Vacation</option>
                        <option value="Business / Work">Business / Work</option>
                        <option value="Family Visit">Family Visit</option>
                        <option value="Medical">Medical</option>
                        <option value="Relocation / Long Stay">Relocation / Long Stay</option>
                        <option value="Event / Wedding">Event / Wedding</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Adults *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={adultsCount}
                        onChange={(e) => setAdultsCount(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Children</label>
                      <input
                        type="number"
                        min={0}
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Check-in Date *</label>
                      <input
                        type="date"
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Check-out Date *</label>
                      <input
                        type="date"
                        required
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Special Requests</label>
                    <input
                      type="text"
                      placeholder="e.g. Airport pickup, extra bedding"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveProperty(null)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? "Logging Reservation..." : "Submit Booking & Continue →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}