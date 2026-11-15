"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Booking {
  id: string;
  property_name: string;
  guest_name: string;
  phone: string;
  nationality?: string;
  gender?: string;
  age_group?: string;
  purpose_of_stay?: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  adults_count?: number;
  children_count?: number;
  special_requests?: string;
  status: string;
  nightly_rate?: number;
  total_amount?: number;
  owner_id?: string;
}

export default function BookingsPortalPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Get the currently logged-in owner session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 2. Fetch ONLY bookings belonging to this specific logged-in owner account
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const calculateStayDetails = (checkIn: string, checkOut: string, rate: number = 100) => {
    if (!checkIn || !checkOut) return { nights: 1, total: rate, deposit: Math.round(rate * 0.3) };
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const total = nights * rate;
    return { nights, total, deposit: Math.round(total * 0.3) };
  };

  const handleApprovePayment = async (booking: Booking) => {
    if (!supabase) {
      alert("Supabase client is not configured.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to approve bookings.");
      return;
    }

    setApprovingId(booking.id);

    const stay = calculateStayDetails(booking.check_in, booking.check_out, booking.nightly_rate || 100);

    // 1. Confirm booking and save total_amount in Supabase
    const { error } = await supabase
      .from("bookings")
      .update({ 
        status: "Confirmed",
        total_amount: stay.total 
      })
      .eq("id", booking.id);

    if (error) {
      alert("BOOKINGS TABLE ERROR: " + error.message);
      setApprovingId(null);
      return;
    }

    // 2. Automatically dispatch the turnover cleaning task linked to this owner
    const checkoutTime = new Date(booking.check_out).getTime();
    const hoursUntilCheckout = (checkoutTime - Date.now()) / (1000 * 60 * 60);
    const autoUrgency = hoursUntilCheckout <= 48 ? "Critical" : "High";

    const autoTask = {
      id: crypto.randomUUID(),
      title: `Turnover Cleaning (Guest: ${booking.guest_name})`,
      property_name: booking.property_name || "La Estancia Property",
      task_type: "Auto-Booking",
      category: "Cleaning",
      operator_name: "Sarah Namukasa",
      operator_whatsapp: "+256780564778",
      scheduled_date: booking.check_out,
      scheduled_time: "11:00",
      recurrence: "One-Time",
      urgency: autoUrgency,
      status: "Pending",
      notes: `Auto-dispatched upon booking confirmation (#${booking.id}). Check-in: ${booking.check_in} | Check-out: ${booking.check_out}. Full turnover clean & fresh linens required.`,
      owner_id: user.id, // Ties dispatch task to logged-in owner
    };

    const { error: dispatchError } = await supabase
      .from("tasks")
      .insert([autoTask]);

    if (dispatchError) {
      alert("DISPATCH TABLE ERROR: " + dispatchError.message);
      setApprovingId(null);
      return;
    }

    // 3. Resolve property_id from properties table using property_name
    let resolvedPropertyId = null;
    const { data: propData } = await supabase
      .from("properties")
      .select("id")
      .eq("title", booking.property_name)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (propData) {
      resolvedPropertyId = propData.id;
    }

    // 4. Automatically record the revenue entry in the financial ledger
    const financeRecord = {
      id: crypto.randomUUID(),
      property_id: resolvedPropertyId,
      type: "Income",
      category: "Accommodation Revenue",
      amount: stay.total,
      transaction_date: new Date().toISOString().split("T")[0],
      description: `Direct booking revenue for guest ${booking.guest_name} (${stay.nights} nights)`,
      owner_id: user.id, // Ties financial record to logged-in owner
    };

    const { error: financeError } = await supabase
      .from("financial_ledger")
      .insert([financeRecord]);

    if (financeError) {
      alert("FINANCIAL LEDGER ERROR: " + financeError.message);
      setApprovingId(null);
      return;
    }

    // 5. Update UI state immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: "Confirmed", total_amount: stay.total } : b))
    );
    setApprovingId(null);
    alert("Success! Booking confirmed, turnover cleaning dispatched, and revenue logged into your financial ledger.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking card permanently?")) return;
    if (!supabase) return;

    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("Failed to delete booking: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 px-4 sm:px-8">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Bookings & Reservations</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Incoming direct reservations and guest demographic profiles.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          🔄 Refresh Bookings
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-xs">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-400 text-xs">
          No bookings received yet for your account portfolio. When travelers submit inquiries on your website, cards will appear here instantly.
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const stay = calculateStayDetails(booking.check_in, booking.check_out, booking.nightly_rate || 100);
            const isConfirmed = booking.status === "Confirmed" || booking.status === "Approved";
            const whatsappUrl = `https://wa.me/${booking.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hello ${booking.guest_name}, regarding your booking at ${booking.property_name} from ${booking.check_in} to ${booking.check_out}: `
            )}`;

            return (
              <div
                key={booking.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5 transition"
              >
                {/* Top Header: Property Title & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    {booking.property_name || "La Estancia Property"}
                  </h2>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-lg w-fit ${
                      isConfirmed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {isConfirmed ? "CONFIRMED & DISPATCHED" : "PENDING APPROVAL"}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">👤</span>
                    <span>
                      <strong className="text-white">Guest Name:</strong> {booking.guest_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">💬</span>
                    <span>
                      <strong className="text-white">WhatsApp:</strong> {booking.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">👥</span>
                    <span>
                      <strong className="text-white">Demographic:</strong> {booking.purpose_of_stay || "Leisure / Vacation"} ({booking.nationality || "Standard"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">👥</span>
                    <span>
                      <strong className="text-white">Guests:</strong> {booking.guests_count || 1} ({booking.adults_count || 1} Adults, {booking.children_count || 0} Kids)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className="text-neutral-400">📅</span>
                    <span>
                      <strong className="text-white">Dates:</strong> {booking.check_in || "TBD"} &rarr; {booking.check_out || "TBD"} ({stay.nights} nights)
                    </span>
                  </div>
                </div>

                {/* Financial Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs">
                    <span className="text-neutral-400">Total Stay: </span>
                    <span className="font-bold text-amber-400">${stay.total}</span>
                  </div>
                  <div className="bg-neutral-950 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-medium">
                    30% Deposit Due: ${stay.deposit}
                  </div>
                </div>

                {/* Guest Notes Box */}
                <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3.5 flex items-start gap-2.5">
                  <span className="text-neutral-400 text-xs mt-0.5">📄</span>
                  <div className="text-xs">
                    <strong className="text-white">GUEST NOTES:</strong>{" "}
                    <span className="text-neutral-300">
                      {booking.special_requests || "No special requests provided."}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-800/80">
                  {isConfirmed ? (
                    <button
                      disabled
                      className="w-full sm:w-auto flex-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <span>✓</span>
                      <span>Payment Approved & Dispatched</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprovePayment(booking)}
                      disabled={approvingId === booking.id}
                      className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                    >
                      <span>⚡</span>
                      <span>
                        {approvingId === booking.id ? "Processing..." : "Approve Cash / MoMo"}
                      </span>
                    </button>
                  )}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="w-full sm:w-auto bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 font-medium px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}