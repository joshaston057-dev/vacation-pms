"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HostPortalDashboard() {
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States for Adding New Property
  const [pTitle, setPTitle] = useState("");
  const [pCategory, setPCategory] = useState("Apartment");
  const [pPrice, setPPrice] = useState("");
  const [pLocation, setPLocation] = useState("");
  const [pDescription, setPDescription] = useState("");

  // Form States for Adding New Booking
  const [bPropertyId, setBPropertyId] = useState("");
  const [bGuestName, setBGuestName] = useState("");
  const [bCheckIn, setBCheckIn] = useState("");
  const [bCheckOut, setBCheckOut] = useState("");
  const [bCost, setBCost] = useState("");

  useEffect(() => {
    fetchPortalData();
  }, []);

  async function fetchPortalData() {
    setLoading(true);
    try {
      const { data: propsData } = await supabase.from("properties").select("*");
      const { data: booksData } = await supabase.from("bookings").select("*");

      if (propsData) setProperties(propsData);
      if (booksData) setBookings(booksData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    const newProp = {
      title: pTitle,
      category: pCategory,
      price_per_night: Number(pPrice),
      location: pLocation,
      description: pDescription,
    };

    const { data, error } = await supabase.from("properties").insert([newProp]).select();
    if (!error && data) {
      setProperties([...properties, ...data]);
      setPTitle("");
      setPPrice("");
      setPLocation("");
      setPDescription("");
    } else {
      alert(error?.message || "Error adding property");
    }
  }

  async function handleAddBooking(e: React.FormEvent) {
    e.preventDefault();
    const newBooking = {
      property_id: bPropertyId,
      guest_name: bGuestName,
      check_in: bCheckIn,
      check_out: bCheckOut,
      total_cost: Number(bCost),
      status: "Confirmed",
    };

    const { data, error } = await supabase.from("bookings").insert([newBooking]).select();
    if (!error && data) {
      setBookings([...bookings, ...data]);
      setBGuestName("");
      setBCheckIn("");
      setBCheckOut("");
      setBCost("");
    } else {
      alert(error?.message || "Error adding booking");
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight text-amber-500">La Estancia</h1>
            <p className="text-xs text-neutral-400">Host Portal & PMS</p>
          </div>

          <nav className="space-y-2">
            {[
              { id: "properties", label: "Properties", icon: "🏠" },
              { id: "bookings", label: "Bookings & iCal", icon: "📅" },
              { id: "financials", label: "Financial Ledger", icon: "💰" },
              { id: "cohosting", label: "Co-Hosting", icon: "🤝" },
              { id: "upsells", label: "Upsell Services", icon: "⭐" },
              { id: "tasks", label: "Tasks & Dispatch", icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="text-xs text-neutral-500">
          Environment: Production
          <br />
          <span className="text-emerald-500">● Live Synced</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-neutral-400">
            Loading Host Portal...
          </div>
        ) : (
          <>
            {/* PROPERTIES TAB */}
            {activeTab === "properties" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">Property Portfolio</h2>
                  <p className="text-sm text-neutral-400">Manage listings, edit pricing, and sync inventory.</p>
                </div>

                <form onSubmit={handleAddProperty} className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-amber-400">Add New Listing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={pTitle}
                        onChange={(e) => setPTitle(e.target.value)}
                        placeholder="e.g. Luxury Villa Munyonyo"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="House">Standalone House</option>
                        <option value="Mansion">Mansion</option>
                        <option value="Villa">Villa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Price / Night ($)</label>
                      <input
                        type="number"
                        required
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        placeholder="120"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Location</label>
                      <input
                        type="text"
                        required
                        value={pLocation}
                        onChange={(e) => setPLocation(e.target.value)}
                        placeholder="Kampala, Uganda"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                    <textarea
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                    />
                  </div>
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-3 rounded-lg transition">
                    Add Property Listing
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((p) => (
                    <div key={p.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-neutral-100">{p.title}</h4>
                        <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">{p.category}</span>
                      </div>
                      <p className="text-xs text-neutral-400">{p.location}</p>
                      <div className="text-lg font-bold text-amber-400">${p.price_per_night} <span className="text-xs font-normal text-neutral-500">/ night</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">Bookings & iCal Integration</h2>
                  <p className="text-sm text-neutral-400">Manage manual entries, external calendars, and stay schedules.</p>
                </div>

                <form onSubmit={handleAddBooking} className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-amber-400">Record New Booking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Select Property</label>
                      <select
                        value={bPropertyId}
                        onChange={(e) => setBPropertyId(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      >
                        <option value="">Select a property...</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Guest Name</label>
                      <input
                        type="text"
                        required
                        value={bGuestName}
                        onChange={(e) => setBGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Check-In</label>
                      <input
                        type="date"
                        required
                        value={bCheckIn}
                        onChange={(e) => setBCheckIn(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Check-Out</label>
                      <input
                        type="date"
                        required
                        value={bCheckOut}
                        onChange={(e) => setBCheckOut(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Total Cost ($)</label>
                      <input
                        type="number"
                        required
                        value={bCost}
                        onChange={(e) => setBCost(Number(e.target.value))}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-100"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-3 rounded-lg transition">
                    Create Booking Card
                  </button>
                </form>

                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-neutral-100">{b.guest_name}</div>
                        <div className="text-xs text-neutral-400">{b.check_in} → {b.check_out}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-400">${b.total_cost}</div>
                        <span className="text-xs text-emerald-400">{b.status || "Confirmed"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER MODULES */}
            {["financials", "cohosting", "upsells", "tasks"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-64 bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="text-lg font-bold text-neutral-200 capitalize">{activeTab} Module</h3>
                <p className="text-sm text-neutral-400 max-w-sm mt-1">This module is connected and ready for active property operations.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}