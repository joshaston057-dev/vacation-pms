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

interface PropertyOption {
  id: string;
  title: string;
  price_per_night: number;
}

export default function BookingsPortalPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Editable custom rates per booking ID during negotiation
  const [customRates, setCustomRates] = useState<{ [key: string]: number }>({});

  // Manual Booking Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualPropertyName, setManualPropertyName] = useState("");
  const [manualGuestName, setManualGuestName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualCheckIn, setManualCheckIn] = useState("");
  const [manualCheckOut, setManualCheckOut] = useState("");
  const [manualNationality, setManualNationality] = useState("Ugandan");
  const [manualAgeGroup, setManualAgeGroup] = useState("25-34");
  const [manualPurpose, setManualPurpose] = useState("Vacation / Leisure");
  const [manualAdults, setManualAdults] = useState(1);
  const [manualChildren, setManualChildren] = useState(0);
  const [manualChildAge, setManualChildAge] = useState("None / No Children");
  const [manualNotes, setManualNotes] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchBookingsAndProperties = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch bookings belonging to this owner
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!bookingsError && bookingsData) {
      setBookings(bookingsData);
      // Initialize custom rates default from nightly_rate or 100
      const initialRates: { [key: string]: number } = {};
      bookingsData.forEach((b: Booking) => {
        initialRates[b.id] = b.nightly_rate || 100;
      });
      setCustomRates(initialRates);
    }

    // 2. Fetch properties for manual booking dropdown
    const { data: propsData, error: propsError } = await supabase
      .from("properties")
      .select("id, title, price_per_night")
      .eq("owner_id", user.id);

    if (!propsError && propsData) {
      setProperties(propsData);
      if (propsData.length > 0 && !manualPropertyName) {
        setManualPropertyName(propsData[0].title);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookingsAndProperties();
  }, []);

  const calculateStayDetails = (checkIn: string, checkOut: string, rate: number) => {
    if (!checkIn || !checkOut) return { nights: 1, total: rate, deposit: Math.round(rate * 0.3) };
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const total = nights * rate;
    return { nights, total, deposit: Math.round(total * 0.3) };
  };

  const handleRateChange = (bookingId: string, val: number) => {
    setCustomRates((prev) => ({ ...prev, [bookingId]: val }));
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setManualSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in.");
      setManualSubmitting(false);
      return;
    }

    const totalGuests = Number(manualAdults) + Number(manualChildren);
    const childInfo = Number(manualChildren) > 0 ? ` | Children Age: ${manualChildAge}` : "";

    const newManualBooking = {
      id: crypto.randomUUID(),
      property_name: manualPropertyName,
      guest_name: manualGuestName,
      phone: manualPhone,
      nationality: manualNationality,
      age_group: manualAgeGroup,
      purpose_of_stay: `${manualPurpose}${childInfo}`,
      check_in: manualCheckIn,
      check_out: manualCheckOut,
      guests_count: totalGuests,
      adults_count: Number(manualAdults),
      children_count: Number(manualChildren),
      special_requests: manualNotes || "Manual entry from host portal",
      status: "Pending",
      owner_id: user.id,
    };

    const { error } = await supabase.from("bookings").insert([newManualBooking]);

    if (!error) {
      alert("Manual booking successfully logged into the portal!");
      setShowManualModal(false);
      setManualGuestName("");
      setManualPhone("");
      setManualCheckIn("");
      setManualCheckOut("");
      setManualNotes("");
      fetchBookingsAndProperties();
    } else {
      alert("Failed to insert manual booking: " + error.message);
    }
    setManualSubmitting(false);
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
    const activeRate = customRates[booking.id] || booking.nightly_rate || 100;
    const stay = calculateStayDetails(booking.check_in, booking.check_out, activeRate);

    // 1. Confirm booking, save total amount & nightly rate
    const { error } = await supabase
      .from("bookings")
      .update({ 
        status: "Confirmed",
        nightly_rate: activeRate,
        total_amount: stay.total 
      })
      .eq("id", booking.id);

    if (error) {
      alert("BOOKINGS TABLE ERROR: " + error.message);
      setApprovingId(null);
      return;
    }

    // 2. Automatically dispatch pre-arrival cleaning task anchored to the incoming guest's check-in date
    const autoTask = {
      id: crypto.randomUUID(),
      title: `Pre-Arrival Prep & Cleaning (${booking.property_name})`,
      property_name: booking.property_name || "La Estancia Property",
      cleaner_name: "Sarah Namukasa",
      cleaner_whatsapp: "+256780564778",
      scheduled_date: booking.check_in, // Anchored to incoming guest's check-in date
      status: "Pending",
      notes: `Pre-arrival prep for guest ${booking.guest_name}. Check-in: ${booking.check_in} | Check-out: ${booking.check_out}. Full turnover clean & fresh linens required before arrival.`,
      owner_id: user.id,
    };

    const { error: dispatchError } = await supabase
      .from("tasks")
      .insert([autoTask]);

    if (dispatchError) {
      alert("DISPATCH TABLE ERROR: " + dispatchError.message);
      setApprovingId(null);
      return;
    }

    // 3. Resolve property_id from properties table
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

    // 4. Record 30% deposit / revenue entry in financial ledger
    const financeRecord = {
      id: crypto.randomUUID(),
      property_id: resolvedPropertyId,
      type: "Income",
      category: "Accommodation Revenue (30% Deposit)",
      amount: stay.deposit,
      transaction_date: new Date().toISOString().split("T")[0],
      description: `Secured deposit revenue for guest ${booking.guest_name} (${stay.nights} nights @ $${activeRate}/nt)`,
      owner_id: user.id,
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
      prev.map((b) => (b.id === booking.id ? { ...b, status: "Confirmed", total_amount: stay.total, nightly_rate: activeRate } : b))
    );
    setApprovingId(null);
    alert("Success! Booking secured, pre-arrival cleaning scheduled for check-in day, and deposit recorded in ledger.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Bookings & Reservations</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage inquiries, negotiated custom quotes, and active guest pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
          >
            + Manual Booking Entry
          </button>
          <button
            onClick={fetchBookingsAndProperties}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* MANUAL BOOKING MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-5 right-5 bg-neutral-800 hover:bg-neutral-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                OFFLINE / EXTERNAL RESERVATION
              </span>
              <h2 className="text-lg font-bold text-white">Log Manual Booking</h2>
              <p className="text-xs text-neutral-400">
                Add a booking from WhatsApp, phone calls, or walk-ins to integrate it into your portal workflow.
              </p>
            </div>

            <form onSubmit={handleManualBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-neutral-400 mb-1">Select Property</label>
                <select
                  value={manualPropertyName}
                  onChange={(e) => setManualPropertyName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title} (${p.price_per_night}/nt)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-neutral-400 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={manualGuestName}
                    onChange={(e) => setManualGuestName(e.target.value)}
                    placeholder="e.g. David Mugisha"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-neutral-400 mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="text"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+256..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-neutral-400 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={manualCheckIn}
                    onChange={(e) => setManualCheckIn(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-neutral-400 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={manualCheckOut}
                    onChange={(e) => setManualCheckOut(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={manualSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {manualSubmitting ? "Logging Booking..." : "Save Manual Booking"}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-xs">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-400 text-xs">
          No bookings received yet for your account portfolio.
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const activeRate = customRates[booking.id] || booking.nightly_rate || 100;
            const stay = calculateStayDetails(booking.check_in, booking.check_out, activeRate);
            const isConfirmed = booking.status === "Confirmed" || booking.status === "Approved";

            // Negotiated Quote WhatsApp Link
            const quoteWhatsAppUrl = `https://wa.me/${booking.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hello ${booking.guest_name}, here is your custom quote for *${booking.property_name}*:\n\n📅 Dates: ${booking.check_in} to ${booking.check_out} (${stay.nights} nights)\n💰 Negotiated Rate: $${activeRate}/night\n🏷️ Total Stay: $${stay.total}\n💵 30% Deposit Required: $${stay.deposit}\n\n*Note: This custom quote expires in 6 hours. Reply to confirm and secure your dates!*`
            )}`;

            return (
              <div
                key={booking.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5 transition"
              >
                {/* Header */}
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
                    {isConfirmed ? "SECURED & PREP DISPATCHED" : "NEGOTIATING / PENDING DEPOSIT"}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">👤</span>
                    <span><strong className="text-white">Guest:</strong> {booking.guest_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">💬</span>
                    <span><strong className="text-white">WhatsApp:</strong> {booking.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">📅</span>
                    <span><strong className="text-white">Dates:</strong> {booking.check_in} &rarr; {booking.check_out} ({stay.nights} nights)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">👥</span>
                    <span><strong className="text-white">Guests:</strong> {booking.guests_count || 1}</span>
                  </div>
                </div>

                {/* Negotiable Nightly Rate Input & Totals */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-xs text-neutral-400 font-medium whitespace-nowrap">Negotiated Rate ($/nt):</label>
                    <input
                      type="number"
                      value={activeRate}
                      onChange={(e) => handleRateChange(booking.id, Number(e.target.value))}
                      disabled={isConfirmed}
                      className="w-28 bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
                    <div>
                      <span className="text-neutral-400">Total: </span>
                      <span className="font-bold text-amber-400">${stay.total}</span>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400">
                      30% Deposit: ${stay.deposit}
                    </div>
                  </div>
                </div>

                {/* Guest Notes */}
                <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3 text-xs flex items-start gap-2">
                  <span className="text-neutral-400">📄</span>
                  <div>
                    <strong className="text-white">NOTES:</strong> <span className="text-neutral-300">{booking.special_requests || "None"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-800/80">
                  {isConfirmed ? (
                    <button
                      disabled
                      className="w-full sm:w-auto flex-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <span>✓</span>
                      <span>Deposit Secured & Cleaning Anchored to Check-in</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprovePayment(booking)}
                      disabled={approvingId === booking.id}
                      className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                    >
                      <span>⚡</span>
                      <span>{approvingId === booking.id ? "Securing..." : "Approve 30% Deposit & Lock Dates"}</span>
                    </button>
                  )}

                  <a
                    href={quoteWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>💬</span>
                    <span>Send Quote via WhatsApp (6h Expiry)</span>
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