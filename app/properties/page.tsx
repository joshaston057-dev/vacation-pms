'use client';
import { useState, useEffect } from 'react';

export default function PublicPropertiesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Default initial properties list so it never stucks on loading
  const [properties, setProperties] = useState<any[]>([
    {
      id: 1,
      title: 'Modern Kololo Apartment',
      category: 'Apartment',
      price: 120,
      location: 'Kololo, Kampala',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      ],
      whatsapp: '+256757386946',
    },
    {
      id: 2,
      title: 'Luxury Naguru Hill Villa',
      category: 'Villa',
      price: 350,
      location: 'Naguru, Kampala',
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
      ],
      whatsapp: '+256757386946',
    },
  ]);

  // Form state for adding property
  const [formData, setFormData] = useState({
    title: '',
    category: 'Apartment',
    price: '',
    location: '',
    images: ['', '', '', '', ''],
  });

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp = {
      id: Date.now(),
      ...formData,
      price: Number(formData.price),
      images: formData.images.filter((img) => img.trim() !== ''),
      whatsapp: '+256757386946',
    };
    setProperties([newProp, ...properties]);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      category: 'Apartment',
      price: '',
      location: '',
      images: ['', '', '', '', ''],
    });
  };

  const filteredProperties =
    selectedCategory === 'All'
      ? properties
      : properties.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      {/* Header Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xl">La Estancia</span>
            <span className="text-gray-300 font-medium text-xl">Vacation Homes</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="/properties" className="text-amber-400 font-semibold">
              Property Category
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              Services
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              Blog
            </a>
            <a
              href="#"
              className="px-3 py-1.5 border border-neutral-700 rounded-full hover:bg-neutral-800 transition"
            >
              About Us
            </a>
            <a
              href="/operations"
              className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-full hover:bg-amber-400 transition flex items-center gap-1.5"
            >
              ⚙️ Host Operations
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Exclusive Short-Stay Properties in Uganda
          </h1>
          <p className="text-gray-400 mt-3 text-base">
            Apartments, standalone houses, mansions, and villas with premium guest concierge services.
          </p>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['All', 'Apartment', 'Standalone House', 'Mansion', 'Villa'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-neutral-900 border border-neutral-800 text-gray-300 hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6 pt-6 border-t border-neutral-900">
          <h2 className="text-2xl font-bold text-white">Featured Properties</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
          >
            + Add Property Listing
          </button>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading available properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center my-6">
            <p className="text-gray-400">No properties found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col"
              >
                <img
                  src={
                    prop.images[0] ||
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={prop.title}
                  className="w-full h-52 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md inline-block mb-2">
                      {prop.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">{prop.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{prop.location}</p>
                  </div>

                  <div className="mt-6 flex justify-between items-center pt-4 border-t border-neutral-800">
                    <div>
                      <span className="text-xs text-gray-400 block">From</span>
                      <span className="text-xl font-bold text-white">
                        ${prop.price}{' '}
                        <span className="text-xs font-normal text-gray-400">/ night</span>
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/+256757386946?text=Hello%20La%20Estancia,%20I%20am%20inquiring%20about%20${encodeURIComponent(
                        prop.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                    >
                      WhatsApp Inquiry
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Add Short-Stay Property</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Luxury Kololo Heights Villa"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Standalone House">Standalone House</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Price / Night ($)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Location / Area
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kampala, Uganda"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Photo URLs (Up to 5 Images)
                </label>
                {formData.images.map((img, idx) => (
                  <input
                    key={idx}
                    type="url"
                    placeholder={`Image URL ${idx + 1}`}
                    className="w-full mb-2 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:border-amber-500 outline-none"
                    value={img}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 rounded-lg text-gray-300 text-sm hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-6 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p>
            <span className="text-gray-300 font-semibold">La Estancia Vacation Homes</span> | Global
            Short-Stay & Co-Hosting Platform
          </p>
          <div className="flex gap-4">
            <a href="/properties" className="hover:text-gray-300">
              Properties
            </a>
            <a href="#" className="hover:text-gray-300">
              Blog
            </a>
            <a href="#" className="hover:text-gray-300">
              About Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}