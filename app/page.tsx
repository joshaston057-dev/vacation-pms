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

        {/* Mobile Dropdown Menu */}
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
                      <div className="w-full h-full flex items-center justify-center text-neutral-60