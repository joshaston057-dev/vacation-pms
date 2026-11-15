"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface UpsellService {
  id: string;
  title: string;
  category: string;
  price: number;
  billing_unit: string;
  description?: string;
  status: string;
  image_url?: string;
  owner_id?: string;
}

export default function UpsellsModulePage() {
  const [upsells, setUpsells] = useState<UpsellService[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<UpsellService, "id">>({
    title: "",
    category: "Transport",
    price: 25,
    billing_unit: "Per Stay",
    description: "",
    status: "Active",
    image_url: "",
  });

  const loadUpsells = async () => {
    if (!supabase) return;

    // 1. Get logged-in owner session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Fetch ONLY upsells belonging to this specific owner
    const { data, error } = await supabase
      .from("upsell_services")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUpsells(data);
    }
  };

  useEffect(() => {
    loadUpsells();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("upsell_services")
        .update(formData)
        .eq("id", editingId)
        .eq("owner_id", user.id);

      if (!error) {
        setUpsells(upsells.map((u) => (u.id === editingId ? { ...u, ...formData } : u)));
      }
    } else {
      const newId = crypto.randomUUID();
      const newRecord = {
        id: newId,
        ...formData,
        owner_id: user.id, // Ties upsell service to logged-in owner
      };

      const { error } = await supabase
        .from("upsell_services")
        .insert([newRecord]);

      if (!error) {
        setUpsells([newRecord, ...upsells]);
      }
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({
      title: "",
      category: "Transport",
      price: 25,
      billing_unit: "Per Stay",
      description: "",
      status: "Active",
      image_url: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this upsell service?")) return;
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("upsell_services")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id);

    if (!error) {
      setUpsells(upsells.filter((u) => u.id !== id));
    }
  };

  const filteredUpsells = filterCategory === "All"
    ? upsells
    : upsells.filter((u) => u.category === filterCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 px-4 sm:px-8 text-neutral-100 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Upsell Services Manager</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure extra hospitality add-ons offered to guests across your portfolio.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              category: "Transport",
              price: 25,
              billing_unit: "Per Stay",
              description: "",
              status: "Active",
              image_url: "",
            });
            setShowModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
        >
          + Add New Upsell
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", "Transport", "Culinary", "Wellness", "Housekeeping"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer font-medium ${
              filterCategory === cat
                ? "bg-amber-500 text-neutral-950 font-bold"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upsell Cards Grid */}
      {filteredUpsells.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-400 text-xs">
          No upsell services found for your account portfolio. Click "+ Add New Upsell" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredUpsells.map((service) => (
            <div
              key={service.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-neutral-950 text-amber-400 border border-neutral-800 px-2.5 py-1 rounded-md">
                    {service.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      service.status === "Active"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2">{service.title}</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {service.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400">
                  ${service.price} / {service.billing_unit}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingId(service.id);
                      setFormData({
                        title: service.title,
                        category: service.category,
                        price: service.price,
                        billing_unit: service.billing_unit,
                        description: service.description || "",
                        status: service.status,
                        image_url: service.image_url || "",
                      });
                      setShowModal(true);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-950 text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 text-neutral-100 shadow-2xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                {editingId ? "Edit Upsell Service" : "Add New Upsell Service"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Airport VIP Transfer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Culinary">Culinary</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Billing Unit</label>
                  <input
                    type="text"
                    placeholder="Per Stay, Per Day, Trip"
                    value={formData.billing_unit}
                    onChange={(e) => setFormData({ ...formData, billing_unit: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
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
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-lg text-xs cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}