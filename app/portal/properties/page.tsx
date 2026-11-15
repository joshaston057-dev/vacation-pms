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
  rate?: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  guests?: number;
  image_url: string;
  images?: string[];
  amenities?: string[];
  owner_id?: string;
  owner_name?: string;
  owner_whatsapp?: string;
  description?: string;
  is_active: boolean;
}

export default function PortalPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeIcalProperty, setActiveIcalProperty] = useState<Property | null>(null);

  // Form state for add/edit
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Apartment");
  const [formPrice, setFormPrice] = useState(100);
  const [formLocation, setFormLocation] = useState("Kampala, Uganda");
  const [formBedrooms, setFormBedrooms] = useState(1);
  const [formBathrooms, setFormBathrooms] = useState(1);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formAmenities, setFormAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const fetchProperties = async () => {
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

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", user.id)
      .order("title", { ascending: true });

    if (!error && data) {
      setProperties(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setFormTitle(prop.title);
    setFormCategory(prop.category || "Apartment");
    setFormPrice(prop.price ?? prop.rate ?? 100);
    setFormLocation(prop.location || "Kampala");
    setFormBedrooms(prop.bedrooms || 1);
    setFormBathrooms(prop.bathrooms || 1);
    setFormImageUrl(prop.image_url || "");
    setFormImages(prop.images || (prop.image_url ? [prop.image_url] : []));
    setFormAmenities(Array.isArray(prop.amenities) ? prop.amenities : []);
    setAmenityInput("");
    setFormDescription(prop.description || "");
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setFormTitle("");
    setFormCategory("Apartment");
    setFormPrice(100);
    setFormLocation("Kampala, Uganda");
    setFormBedrooms(1);
    setFormBathrooms(1);
    setFormImageUrl("");
    setFormImages([]);
    setFormAmenities([]);
    setAmenityInput("");
    setFormDescription("");
    setIsCreating(true);
  };

  const handleAddAmenity = (value?: string) => {
    const clean = (value ?? amenityInput).trim();
    if (!clean) return;
    if (!formAmenities.includes(clean)) {
      setFormAmenities([...formAmenities, clean]);
    }
    if (!value) setAmenityInput("");
  };

  const handleRemoveAmenity = (item: string) => {
    setFormAmenities(formAmenities.filter((a) => a !== item));
  };

  const handlePhoneImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !supabase) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, file);

      if (!uploadError) {
        const { data } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);
        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      } else {
        alert("Image upload failed: " + uploadError.message);
      }
    }

    if (uploadedUrls.length > 0) {
      const updatedImages = [...formImages, ...uploadedUrls];
      setFormImages(updatedImages);
      setFormImageUrl(updatedImages[0]);
    }
    setUploading(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = formImages.filter((_, idx) => idx !== indexToRemove);
    setFormImages(updated);
    setFormImageUrl(updated[0] || "");
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to save properties.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, whatsapp_number")
      .eq("id", user.id)
      .single();

    const primaryImage = formImageUrl || formImages[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80";

    const payload = {
      title: formTitle,
      category: formCategory,
      price: Number(formPrice),
      location: formLocation,
      bedrooms: Number(formBedrooms),
      bathrooms: Number(formBathrooms),
      image_url: primaryImage,
      images: formImages.length > 0 ? formImages : [primaryImage],
      amenities: formAmenities,
      owner_id: user.id,
      owner_name: profile?.full_name || "Host",
      owner_whatsapp: profile?.whatsapp_number || "256757386946",
      description: formDescription,
      is_active: true,
    };

    if (isCreating) {
      const { error } = await supabase.from("properties").insert([payload]);
      if (error) {
        alert("Error creating property: " + error.message);
        return;
      }
    } else if (editingProperty) {
      const { error } = await supabase.from("properties").update(payload).eq("id", editingProperty.id);
      if (error) {
        alert("Error updating property: " + error.message);
        return;
      }
    }

    setIsCreating(false);
    setEditingProperty(null);
    fetchProperties();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    if (!supabase) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      fetchProperties();
    } else {
      alert("Failed to delete property: " + error.message);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 px-4 sm:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Properties Portfolio ({properties.length})</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your short-stay apartments, standalone houses, mansions, and villas.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-1.5 w-fit"
        >
          <span>＋</span> Add New Property
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-xs">Loading properties portfolio...</div>
      ) : properties.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-400 text-xs space-y-3">
          <p>No properties found in your account portfolio.</p>
          <button
            onClick={handleOpenCreate}
            className="bg-amber-500 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Create Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-neutral-950">
                  <img
                    src={prop.image_url || prop.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md text-amber-400 border border-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {prop.category || "Property"}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-bold text-white line-clamp-1">{prop.title}</h2>
                    <span className="text-sm font-black text-amber-400 shrink-0">
                      ${prop.price ?? prop.rate ?? 100}/nt
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">📍 {prop.location}</p>
                  <div className="flex gap-3 text-[11px] text-neutral-400 pt-1">
                    <span>🛏️ {prop.bedrooms} Beds</span>
                    <span>🚿 {prop.bathrooms} Baths</span>
                  </div>
                  {Array.isArray(prop.amenities) && prop.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {prop.amenities.map((am, i) => (
                        <span key={i} className="bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-300 px-2 py-0.5 rounded-md">
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(prop)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Edit Property
                  </button>
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
                <button
                  onClick={() => setActiveIcalProperty(prop)}
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-neutral-800 font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📅</span> iCal Sync & Feed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Property Modal */}
      {(isCreating || editingProperty) && (
        <div
          onClick={() => {
            setIsCreating(false);
            setEditingProperty(null);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold text-white">
                {isCreating ? "Add New Property" : "Edit Property Details"}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingProperty(null);
                }}
                className="bg-neutral-800 text-neutral-200 text-xs px-3 py-1.5 rounded-xl cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  placeholder="e.g. Luxury 2-Bedroom Apartment in Kira"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Stand-Alone House">Stand-Alone House</option>
                    <option value="Mansion">Mansion</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Nightly Rate ($) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  placeholder="e.g. Kira, Kampala"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={formBedrooms}
                    onChange={(e) => setFormBedrooms(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={formBathrooms}
                    onChange={(e) => setFormBathrooms(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Amenities Input Section */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 block">Amenities (Only what you add will display)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="Type amenity (e.g. Unlimited WiFi, Netflix)..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAmenity()}
                    className="bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["Unlimited WiFi", "Netflix & DStv", "Equipped Kitchen", "24/7 Security", "Free Parking", "Air Conditioning", "Swimming Pool", "Standby Generator"].map((preset) => (
                    !formAmenities.includes(preset) && (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddAmenity(preset)}
                        className="text-[10px] bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 px-2 py-0.5 rounded-md cursor-pointer transition"
                      >
                        + {preset}
                      </button>
                    )
                  ))}
                </div>

                {/* Selected Amenities Badges */}
                {formAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formAmenities.map((item) => (
                      <span
                        key={item}
                        className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span>✓ {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(item)}
                          className="text-amber-400 hover:text-white font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Compact Phone Gallery Image Upload Section */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 block">Property Images (Phone Gallery)</label>
                <label className="block w-full bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 font-semibold py-2 px-3 rounded-xl text-xs text-center cursor-pointer transition">
                  {uploading ? "Uploading..." : "📁 Select Photos from Phone"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhoneImageUpload}
                    className="hidden"
                  />
                </label>

                {formImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {formImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-12 h-12 shrink-0 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
                        <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white"
                  placeholder="Describe views, neighborhood, extra features..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProperty(null);
                  }}
                  className="bg-neutral-800 text-neutral-300 px-4 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/10"
                >
                  {isCreating ? "Save & Publish Property" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* iCal Modal */}
      {activeIcalProperty && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setActiveIcalProperty(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">iCal Channel Sync</h2>
              <p className="text-xs text-neutral-400">
                Sync availability for <span className="text-white font-semibold">{activeIcalProperty.title}</span> with Airbnb, Booking.com, and VRBO.
              </p>
            </div>
            <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-300">Export iCal Link (.ics)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${origin}/api/ical/export/${activeIcalProperty.id}`}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-[11px] text-amber-400 font-mono select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${origin}/api/ical/export/${activeIcalProperty.id}`);
                    alert("iCal link copied to clipboard!");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-2.5 rounded-lg text-xs transition whitespace-nowrap cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Paste this link into Airbnb, Booking.com, or any other calendar platform under "Import Calendar" to automatically block out reserved dates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}