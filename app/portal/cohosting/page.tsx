"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface CoHostOwner {
  id: string;
  owner_name: string;
  property_title: string;
  owner_whatsapp: string;
  commission_split: string; // e.g. "80% Host / 20% Owner"
  total_earnings: number;
  payout_status: "Paid" | "Pending Payout";
  owner_id?: string;
}

export default function CoHostingModulePage() {
  const [owners, setOwners] = useState<CoHostOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newOwner, setNewOwner] = useState({
    owner_name: "",
    property_title: "",
    owner_whatsapp: "+256",
    commission_split: "80% Host / 20% Owner",
    total_earnings: 0,
    payout_status: "Pending Payout" as const,
  });

  const fetchCoHosts = async () => {
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

    // 2. Fetch ONLY co-host records belonging to this specific logged-in owner account
    const { data, error } = await supabase
      .from("cohosts")
      .select("*")
      .eq("owner_id", user.id)
      .order("owner_name", { ascending: true });

    if (!error && data) {
      setOwners(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoHosts();
  }, []);

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to add partner owners.");
      return;
    }

    const created = {
      ...newOwner,
      id: crypto.randomUUID(),
      owner_id: user.id, // Ties co-host record to logged-in owner account
    };

    const { data, error } = await supabase.from("cohosts").insert([created]).select();

    if (error) {
      alert("Failed to save property owner: " + error.message);
    } else {
      if (data) {
        setOwners((prev) => [data[0], ...prev]);
      }
      setShowModal(false);
      setNewOwner({
        owner_name: "",
        property_title: "",
        owner_whatsapp: "+256",
        commission_split: "80% Host / 20% Owner",
        total_earnings: 0,
        payout_status: "Pending Payout",
      });
    }
  };

  const handleDeleteOwner = async (id: string) => {
    if (!confirm("Are you sure you want to remove this partner record?")) return;
    if (!supabase) return;

    const { error } = await supabase.from("cohosts").delete().eq("id", id);
    if (!error) {
      setOwners((prev) => prev.filter((o) => o.id !== id));
    } else {
      alert("Failed to delete partner record: " + error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 px-4 sm:px-8 text-neutral-100 pb-20">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Co-Hosting & Partner Management</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage third-party property owner agreements, commission splits, and partner revenue payouts for your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoHosts}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            + Add Property Owner
          </button>
        </div>
      </div>

      {/* Owners Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-xs">Loading co-host partners...</div>
      ) : owners.length === 0 ? (
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400">No property owners registered yet for your account portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                      {owner.commission_split}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">{owner.owner_name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">🏡 {owner.property_title}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded ${
                        owner.payout_status === "Paid"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {owner.payout_status}
                    </span>
                    <button
                      onClick={() => handleDeleteOwner(owner.id)}
                      className="text-neutral-500 hover:text-red-400 text-xs cursor-pointer ml-1"
                      title="Delete partner"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="mt-4 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Owner WhatsApp:</span>
                  <span className="text-emerald-400 font-mono">{owner.owner_whatsapp}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Accumulated Earnings:</span>
                  <p className="text-sm font-bold text-white">${owner.total_earnings}</p>
                </div>

                <a
                  href={`https://wa.me/${owner.owner_whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${owner.owner_name}, here is the co-hosting statement update for ${owner.property_title}. Total earnings to date: $${owner.total_earnings}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  WhatsApp Statement &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Property Owner */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 text-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Register Co-Hosting Property Owner</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOwner} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Robert Kigozi"
                  value={newOwner.owner_name}
                  onChange={(e) => setNewOwner({ ...newOwner, owner_name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Managed Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Luxury Villa in Munyonyo"
                  value={newOwner.property_title}
                  onChange={(e) => setNewOwner({ ...newOwner, property_title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Owner WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+2567..."
                    value={newOwner.owner_whatsapp}
                    onChange={(e) => setNewOwner({ ...newOwner, owner_whatsapp: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Commission Split *</label>
                  <input
                    type="text"
                    required
                    value={newOwner.commission_split}
                    onChange={(e) => setNewOwner({ ...newOwner, commission_split: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-5 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Save Partner Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}