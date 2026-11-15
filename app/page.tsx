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
  amenities: string[];
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

  // Review states for the selected property modal
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setSubmitting(true);
    setSuccessMsg("");

    const { error } = await supabase.from("reviews").insert([
      {
        property_id: selectedProperty.id,
        guest_name: guestName,
        rating: Number(rating),
        comment,
      },
    ]);

    if (!error) {
      setGuestName("");
      setRating(5);
      setComment("");
      setSuccessMsg("Thank you! Your review has been posted successfully.");
      fetchReviews(selectedProperty.id);
    }
    setSubmitting(false);
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
      {/* Public Header (iCal Sync Removed) */}
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

          <div className="flex items-center gap-4">
            <Link
              href="/portal"
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Host Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Curated Luxury & Comfort in Uganda
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
          Explore our curated portfolio of short-stay apartments, standalone houses, mansions, and villas across Uganda. Click any property to view details and guest reviews.
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
                onClick={() => setSelectedProperty(property)}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/40 transition group cursor-pointer"
              >
                <div className="h-48 bg-neutral-800 relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                      No Image Available
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {property.category || "Property"}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                      {property.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">📍 {property.location}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-300">
                    <span>🛏️ {property.bedrooms || 1} Beds</span>
                    <span>🚿 {property.bathrooms || 1} Baths</span>
                    <span className="text-amber-400 font-bold text-sm">${property.price_per_night}/nt</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Property Details & Reviews Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-5 right-5 bg-neutral-800 hover:bg-neutral-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="space-y-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {selectedProperty.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedProperty.title}</h2>
              <p className="text-xs text-neutral-400">📍 {selectedProperty.location}</p>
            </div>

            {/* Image Preview */}
            <div className="h-64 rounded-2xl overflow-hidden bg-neutral-800">
              {selectedProperty.images && selectedProperty.images.length > 0 ? (
                <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">No image</div>
              )}
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

            {/* Reviews Section */}
            <div className="space-y-6 border-t border-neutral-800 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Guest Reviews & Ratings</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {reviews.length} review{reviews.length === 1 ? "" : "s"} • Rating:{" "}
                    <span className="text-amber-400 font-bold">{avgRating} ★</span>
                  </p>
                </div>
              </div>

              {/* Review Feed */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {reviewsLoading ? (
                  <p className="text-xs text-neutral-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No reviews yet. Be the first guest to leave feedback!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{rev.guest_name}</span>
                        <span className="text-amber-400 text-[11px] font-bold">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Leave a Review</h4>
                {successMsg && (
                  <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-2.5 rounded-lg text-xs">
                    {successMsg}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name (e.g. Sarah M.)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={5}>5 Stars - Exceptional</option>
                    <option value={4}>4 Stars - Great</option>
                    <option value={3}>3 Stars - Good</option>
                    <option value={2}>2 Stars - Fair</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="How was your experience?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-lg text-xs transition cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}