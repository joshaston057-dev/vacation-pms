"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Property {
  id: string;
  title: string;
  category: string;
  location: string;
  price_per_night: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
  description?: string;
  owner_id?: string;
}

interface Review {
  id: string;
  guest_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function PublicHomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredCategory, setFilteredCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);
  const [expandedAmenitiesId, setExpandedAmenitiesId] = useState<string | null>(null);

  // Modal tab: "booking" or "reviews"
  const [modalTab, setModalTab] = useState<"booking" | "reviews">("booking");

  // Booking Form States
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nationality, setNationality] = useState("Ugandan");
  const [ageGroup, setAgeGroup] = useState("25-34");
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [childAgeBracket, setChildAgeBracket] = useState("None / No Children");
  const [purposeOfStay, setPurposeOfStay] = useState("Vacation / Leisure");
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchReviews(selectedProperty.id);
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    const { data, error } = await supabase.from("properties").select("*");
    if (!error && data) {
      setProperties(data);
    }
    setLoading(false);
  };

  const fetchReviews = async (propertyId: string) => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setReviewsLoading(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setBookingSubmitting(true);

    const totalGuests = adultsCount + childrenCount;
    const childInfo = childrenCount > 0 ? ` | Children Age: ${childAgeBracket}` : "";

    const newBooking = {
      property_name: selectedProperty.title,
      guest_name: guestName,
      phone: phone,
      nationality: nationality,
      age_group: ageGroup,
      purpose_of_stay: `${purposeOfStay}${childInfo}`,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: totalGuests,
      adults_count: adultsCount,
      children_count: childrenCount,
      special_requests: specialRequests,
      status: "Pending",
      owner_id: selectedProperty.owner_id || null,
    };

    const { error } = await supabase.from("bookings").insert([newBooking]);

    if (!error) {
      setBookingSuccess(true);
    } else {
      alert("Failed to submit booking: " + error.message);
    }
    setBookingSubmitting(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setReviewSubmitting(true);
    setReviewSuccess("");

    const { error } = await supabase.from("reviews").insert([
      {
        property_id: selectedProperty.id,
        guest_name: reviewName,
        rating: Number(rating),
        comment,
      },
    ]);

    if (!error) {
      setReviewName("");
      setRating(5);
      setComment("");
      setReviewSuccess("Thank you! Your review has been posted successfully.");
      fetchReviews(selectedProperty.id);
    }
    setReviewSubmitting(false);
  };

  const categories = ["All", "Apartment", "Stand-Alone House", "Mansions", "Villas"];

  const filteredProperties =
    filteredCategory === "All"
      ? properties
      : properties.filter(
          (p) => p.category?.toLowerCase() === filteredCategory.toLowerCase()
        );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "No reviews yet";

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Header with Host Portal Button + Mobile Hamburger */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              LE
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">LA ESTANCIA</span>
              <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">Vacation Homes</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-6">
            <a href="#about" className="text-xs text-neutral-300 hover:text-amber-400 transition">About Us</a>
            <a href="#blog" className="text-xs text-neutral-300 hover:text-amber-400 transition">Blog</a>
            <a href="#upsells" className="text-xs text-neutral-300 hover:text-amber-400 transition">Upsell Services</a>
            <a href="#contact" className="text-xs text-neutral-300 hover:text-amber-400 transition">Contact Us</a>
            <Link
              href="/portal"
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Host Portal →
            </Link>
          </div>

          {/* Mobile Right Side: Host Portal Button + Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/portal"
              className="bg-amber-500 text-neutral-950 font-bold px-3 py-2 rounded-xl text-[11px]"
            >
              Host Portal →
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded-xl text-sm font-bold cursor-pointer"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Contact Us replaced with Upsell Services) */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-4 space-y-1 text-center text-xs shadow-2xl">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition"
            >
              About Us
            </a>
            <a
              href="#blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition"
            >
              Blog
            </a>
            <a
              href="#upsells"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-amber-400 font-bold hover:bg-neutral-800/50 rounded-lg transition"
            >
              Upsell Services
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition"
            >
              Contact Us
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Curated Luxury & Comfort in Uganda
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
          Explore our curated portfolio of short-stay apartments, standalone houses, mansions, and villas across Uganda. Book your stay or read guest reviews below.
        </p>
      </section>

      {/* Category Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilteredCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filteredCategory === cat
                  ? "bg-amber-500 text-neutral-950 font-bold"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
              }`}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Property Grid */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 pb-20 flex-1">
        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-xs">Loading available properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs">No properties found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Horizontal Scrollable Image Gallery */}
                  <div className="h-48 bg-neutral-800 relative overflow-hidden group">
                    {Array.isArray(property.images) && property.images.length > 0 ? (
                      <div className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
                        {property.images.map((imgUrl, idx) => (
                          <div key={idx} className="min-w-full h-full flex-shrink-0 snap-center relative">
                            <img
                              src={imgUrl}
                              alt={`${property.title} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 right-2 bg-neutral-950/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                              {idx + 1} / {property.images.length}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                        No Image Available
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 pointer-events-none">
                      {property.category || "Property"}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{property.title}</h3>
                      <span className="text-amber-400 font-black text-sm shrink-0">${property.price_per_night}/nt</span>
                    </div>
                    <p className="text-xs text-neutral-400">📍 {property.location}</p>

                    <div className="flex gap-3 text-[11px] text-neutral-300 pt-1">
                      <span>🛏️ {property.bedrooms || 1} Beds</span>
                      <span>🚿 {property.bathrooms || 1} Baths</span>
                    </div>

                    {/* Amenities Toggle Dropdown */}
                    {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedAmenitiesId(expandedAmenitiesId === property.id ? null : property.id)}
                          className="text-[11px] text-amber-400 hover:underline font-medium cursor-pointer"
                        >
                          {expandedAmenitiesId === property.id ? "▲ Hide Amenities" : "▼ Show Amenities"}
                        </button>
                        {expandedAmenitiesId === property.id && (
                          <div className="flex flex-wrap gap-1 bg-neutral-950 p-3 rounded-xl border border-neutral-800 mt-2">
                            {property.amenities.map((am, i) => (
                              <span key={i} className="bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 px-2.5 py-1 rounded-md">
                                ✓ {am}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description Toggle */}
                    {property.description && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedDescId(expandedDescId === property.id ? null : property.id)}
                          className="text-[11px] text-amber-400 hover:underline font-medium cursor-pointer"
                        >
                          {expandedDescId === property.id ? "▲ Hide Description" : "▼ Show Description"}
                        </button>
                        {expandedDescId === property.id && (
                          <p className="text-[11px] text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800 mt-2 leading-relaxed">
                            {property.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => {
                      setModalTab("reviews");
                      setSelectedProperty(property);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    Reviews
                  </button>
                  <button
                    onClick={() => {
                      setModalTab("booking");
                      setBookingSuccess(false);
                      setSelectedProperty(property);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upsell Services Section */}
      <section id="upsells" className="border-t border-neutral-900 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
              ENHANCE YOUR STAY
            </span>
            <h2 className="text-2xl font-bold text-white">Guest Upsell Services</h2>
            <p className="text-sm text-neutral-400">
              Make your stay at La Estancia unforgettable with our exclusive concierge and luxury add-on services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="text-2xl">🚗</div>
              <h3 className="text-xs font-bold text-white">Airport Pickup & Dropoff</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Hassle-free private transit from Entebbe International Airport directly to your doorstep.
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="text-2xl">👨‍🍳</div>
              <h3 className="text-xs font-bold text-white">Private Chef Services</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Enjoy custom-prepared local and international meals cooked right in your apartment or villa kitchen.
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="text-2xl">🧭</div>
              <h3 className="text-xs font-bold text-white">Guided Tours & Safaris</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Explore Kampala city highlights, Jinja source of the Nile, or wildlife safaris with trusted guides.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/256757386946?text=Hello%20La%20Estancia,%20I%20would%20like%20to%20inquire%20about%20your%20upsell%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition items-center gap-2"
            >
              <span>💬 Book Upsell Services via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-neutral-900/50 border-t border-neutral-900 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">About La Estancia Vacation Homes</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            La Estancia is a premier short-stay property agency and co-hosting platform based in Uganda. We manage and market a handpicked portfolio of luxury apartments, standalone houses, mansions, and villas, offering travelers unmatched comfort and homeowners seamless property management.
          </p>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="border-t border-neutral-900 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Host & Traveler Blog</h2>
          <p className="text-sm text-neutral-400">
            Discover travel tips, neighborhood guides across Kampala and beyond, and expert advice for short-stay property hosting.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-xs text-neutral-400 italic">
            New articles coming soon! Stay tuned for updates on Uganda&apos;s hospitality scene.
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="bg-neutral-900/50 border-t border-neutral-900 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Contact Us</h2>
          <p className="text-sm text-neutral-400">
            Get in touch for direct bookings, co-hosting inquiries, or property viewings.
          </p>
          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <a
              href="https://wa.me/256757386946"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition"
            >
              💬 WhatsApp: +256 757 386946
            </a>
            <a
              href="tel:+256780564778"
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition"
            >
              📞 Call: +256 780 564778
            </a>
          </div>
        </div>
      </section>

      {/* Property Details, Booking & Reviews Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-5 right-5 bg-neutral-800 hover:bg-neutral-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer z-10"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="py-6 space-y-6 text-center">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                    GUEST REGISTRATION & RESERVATION
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Book: {selectedProperty.title}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    📍 {selectedProperty.location} | ${selectedProperty.price_per_night}/night
                  </p>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4">
                  <div className="text-4xl">🎉</div>
                  <h4 className="text-sm font-bold text-white">Reservation & Guest Profile Logged!</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
                    Thank you, <span className="text-white font-semibold">{guestName}</span>. Your booking and check-in profile have been recorded. Tap below to send your confirmation straight to our WhatsApp concierge.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <a
                    href={`https://wa.me/256757386946?text=${encodeURIComponent(
                      `Hello La Estancia, I have submitted a booking request for *${selectedProperty.title}*.\n\n👤 Name: ${guestName}\n📞 Phone: ${phone}\n🌍 Nationality: ${nationality} (${ageGroup})\n📅 Dates: ${checkIn} to${checkOut}\n👥 Guests: ${adultsCount} Adults,${childrenCount} Children\n🎯 Purpose: ${purposeOfStay}\n📝 Notes: ${specialRequests || "None"}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    Confirm via WhatsApp →
                  </a>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold py-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="space-y-2">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {selectedProperty.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedProperty.title}</h2>
                  <p className="text-xs text-neutral-400">📍 {selectedProperty.location}</p>
                </div>

                {/* Property Specs */}
                <div className="grid grid-cols-3 gap-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800 text-center text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-1">Bedrooms</span>
                    <span className="font-bold text-white">{selectedProperty.bedrooms || 1}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-1">Bathrooms</span>
                    <span className="font-bold text-white">{selectedProperty.bathrooms || 1}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-1">Price / Night</span>
                    <span className="font-bold text-amber-400">${selectedProperty.price_per_night}</span>
                  </div>
                </div>

                {/* Modal Tab Switcher */}
                <div className="flex border-b border-neutral-800">
                  <button
                    onClick={() => setModalTab("booking")}
                    className={`flex-1 pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                      modalTab === "booking" ? "border-amber-500 text-amber-400" : "border-transparent text-neutral-400"
                    }`}
                  >
                    📅 Book This Property
                  </button>
                  <button
                    onClick={() => setModalTab("reviews")}
                    className={`flex-1 pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                      modalTab === "reviews" ? "border-amber-500 text-amber-400" : "border-transparent text-neutral-400"
                    }`}
                  >
                    ★ Guest Reviews ({reviews.length})
                  </button>
                </div>

                {/* BOOKING TAB CONTENT */}
                {modalTab === "booking" ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white">Reserve Your Stay</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. David Mugisha"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">WhatsApp / Phone Number</label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+256..."
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Check-in Date</label>
                        <input
                          type="date"
                          required
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Check-out Date</label>
                        <input
                          type="date"
                          required
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Traveler Nationality</label>
                        <select
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Ugandan">Ugandan</option>
                          <option value="Kenyan">Kenyan</option>
                          <option value="Tanzanian">Tanzanian</option>
                          <option value="Rwandan">Rwandan</option>
                          <option value="British">British</option>
                          <option value="American">American</option>
                          <option value="European">European</option>
                          <option value="Other International">Other International</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Guest Age Bracket</label>
                        <select
                          value={ageGroup}
                          onChange={(e) => setAgeGroup(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="18-24">18 - 24 Years</option>
                          <option value="25-34">25 - 34 Years</option>
                          <option value="35-44">35 - 44 Years</option>
                          <option value="45-54">45 - 54 Years</option>
                          <option value="55+">55+ Years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Purpose of Stay</label>
                        <select
                          value={purposeOfStay}
                          onChange={(e) => setPurposeOfStay(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Vacation / Leisure">Vacation / Leisure</option>
                          <option value="Business Trip">Business Trip</option>
                          <option value="Family Stay">Family Stay</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Adults</label>
                        <input
                          type="number"
                          min={1}
                          value={adultsCount}
                          onChange={(e) => setAdultsCount(Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Children</label>
                        <input
                          type="number"
                          min={0}
                          value={childrenCount}
                          onChange={(e) => setChildrenCount(Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-400 mb-1">Children Age Bracket</label>
                        <select
                          value={childAgeBracket}
                          onChange={(e) => setChildAgeBracket(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="None / No Children">None / No Children</option>
                          <option value="0-3 Years (Infant / Toddler)">0-3 Years (Infant / Toddler)</option>
                          <option value="4-12 Years (Young Child)">4-12 Years (Young Child)</option>
                          <option value="13-17 Years (Teenager)">13-17 Years (Teenager)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-neutral-400 mb-1">Special Requests / Notes</label>
                      <textarea
                        rows={2}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requests or arrival notes..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      {bookingSubmitting ? "Submitting Reservation..." : "Submit Booking Request"}
                    </button>
                  </form>
                ) : (
                  /* REVIEWS TAB CONTENT */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
                      <div>
                        <h3 className="text-xs font-bold text-white">Guest Rating</h3>
                        <p className="text-[10px] text-neutral-400">Based on verified stays</p>