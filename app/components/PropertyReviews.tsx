"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Review {
  id: string;
  guest_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function PropertyReviews({ propertyId }: { propertyId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert([
      {
        property_id: propertyId,
        guest_name: guestName,
        rating: Number(rating),
        comment,
      },
    ]);

    if (!error) {
      setGuestName("");
      setRating(5);
      setComment("");
      setSuccessMsg("Thank you! Your review has been posted.");
      fetchReviews();
    }
    setSubmitting(false);
  };

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "No reviews yet";

  return (
    <div className="space-y-8 mt-10 border-t border-neutral-800 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Guest Reviews & Ratings</h3>
          <p className="text-xs text-neutral-400 mt-1">
            {reviews.length} verified review{reviews.length === 1 ? "" : "s"} • Overall Rating:{" "}
            <span className="text-amber-400 font-bold">{avgRating} ★</span>
          </p>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-neutral-500">Loading reviews...</p>
        ​) : reviews.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">Be the first guest to leave a review for this property!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{rev.guest_name}</span>
                <span className="text-amber-400 text-xs font-bold">
                  {"★".repeat(rev.rating)}
                  {"☆".repeat(5 - rev.rating)}
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{rev.comment}</p>
              <span className="text-[10px] text-neutral-500">
                {new Date(rev.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white">Leave a Review</h4>
        {successMsg && (
          <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs">
            {successMsg}
          </div>
        )}
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sarah M."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Rating</label>
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
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Your Review</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your stay at La Estancia?"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer"
          >
            {submitting ? "Submitting..." : "Post Review"}
          </button>
        </form>
      </div>
    </div>
  );
}