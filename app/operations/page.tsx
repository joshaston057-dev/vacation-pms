'use client';
import { useState } from 'react';

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('properties');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  // Managed Properties Catalog pre-loaded with images
  const [properties, setProperties] = useState<any[]>([
    {
      id: 1,
      title: '1 bedroom fully furnished apartment for rent in kisaasi',
      category: 'Apartment',
      location: 'kisaasi',
      price: '45',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 2,
      title: '5 bedroom fully furnished Mansion for rent in Entebbe',
      category: 'Mansion',
      location: 'Entebbe',
      price: '500',
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 3,
      title: '3 bedroom fully furnished Mansion for rent in Munyonyo',
      category: 'Mansion',
      location: 'munyonyo',
      price: '150',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ]);

  // Form state for adding a new property
  const [addFormData, setAddFormData] = useState({
    title: '',
    category: 'Apartment',
    price: '',
    location: '',
    images: ['', '', '', '', ''],
  });

  // Helper to handle image array input for Add form
  const handleAddImageChange = (index: number, value: string) => {
    const newImages = [...addFormData.images];
    newImages[index] = value;
    setAddFormData({ ...addFormData, images: newImages });
  };

  // Helper to handle image array input for Edit form
  const handleEditImageChange = (index: number, value: string) => {
    if (!editingProperty) return;
    const newImages = [...editingProperty.images];
    newImages[index] = value;
    setEditingProperty({ ...editingProperty, images: newImages });
  };

  // Submit new property
  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp = {
      id: Date.now(),
      ...addFormData,
      images: addFormData.images.filter((img) => img.trim() !== ''),
    };
    setProperties([newProp, ...properties]);
    setIsAddModalOpen(false);
    setAddFormData({
      title: '',
      category: 'Apartment',
      price: '',
      location: '',
      images: ['', '', '', '', ''],
    });
  };

  // Submit edited property updates
  const handleEditPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedImages = editingProperty.images.filter((img: string) => img.trim() !== '');
    setProperties(
      properties.map((p) =>
        p.id === editingProperty.id
          ? { ...editingProperty, images: updatedImages.length > 0 ? updatedImages : p.images }
          : p
      )
    );
    setEditingProperty(null);
  };

  // Delete property listing
  const handleDeleteProperty = (id: number) => {
    if (confirm('Are you sure you want to remove this property listing?')) {
      setProperties(properties.filter((p) => p.id !== id));
      setEditingProperty(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xl">La Estancia</span>
            <span className="text-gray-300 font-medium text-xl">Vacation Homes</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="/properties" className="hover:text-amber-400 transition">Property Category</a>
            <a href="#" className="hover:text-amber-400 transition">Services</a>
            <a href="#" className="hover:text-amber-400 transition">Blog</a>
            <a href="#" className="px-3 py-1.5 border border-neutral-700 rounded-full hover:bg-neutral-800 transition">About Us</a>
            <a href="/operations" className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-full hover:bg-amber-400 transition flex items-center gap-1.5">
              ⚙️ Host Operations
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white">La Estancia Host Operations Portal</h1>
          <p className="text-gray-400 mt-2 text-base">
            Centralized PMS: Manage Properties, Bookings, Staff, Finances, and Upsell Services.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-neutral-800 pb-4">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-gray-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            🏡 Properties & Photos ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-neutral-900 text-gray-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            📅 Bookings & iCal (3)
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-neutral-900 text-gray-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            🧹 Tasks & Staff
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              activeTab === 'financials'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-neutral-900 text-gray-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            💰 Financials & Ledger
          </button>
          <button
            onClick={() => setActiveTab('upsell')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              activeTab === 'upsell'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-neutral-900 text-gray-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            ✨ Upsell Services (0)
          </button>
        </div>

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Managed Properties Catalog</h2>
              <div className="flex items-center gap-4">
                <a href="/properties" className="text-amber-400 text-xs hover:underline flex items-center gap-1">
                  View Public Catalog →
                </a>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg transition text-sm flex items-center gap-2 shadow-md shadow-amber-500/10"
                >
                  <span>+</span> Add New Property
                </button>
              </div>
            </div>

            {/* Properties Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Display Main Image & Count */}
                    <div className="relative h-48 w-full bg-neutral-800">
                      <img
                        src={
                          prop.images[0] ||
                          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
                        📷 {prop.images.length} Photo{prop.images.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base font-bold text-white leading-snug">{prop.title}</h3>
                      <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                        📍 <span>{prop.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Operational Host Controls */}
                  <div className="p-5 pt-0 flex justify-between items-center mt-2">
                    <span className="text-amber-400 font-bold text-base">
                      ${prop.price} <span className="text-xs text-gray-400 font-normal">/ night</span>
                    </span>
                    <button
                      onClick={() => {
                        // Populate 5 slots for editing
                        const existingImages = [...prop.images];
                        while (existingImages.length < 5) existingImages.push('');
                        setEditingProperty({ ...prop, images: existingImages });
                      }}
                      className="bg-neutral-800 border border-amber-500/40 text-amber-400 hover:bg-neutral-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      ✏️ Edit Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD NEW PROPERTY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Add Short-Stay Property</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2 bedroom fully furnished apartment in Kololo"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                  value={addFormData.title}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">Stand-alone House</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Price / Night ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                    value={addFormData.price}
                    onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Location / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kisaasi, Entebbe, Munyonyo"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                  value={addFormData.location}
                  onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Photo URLs (Up to 5 Images)
                </label>
                {addFormData.images.map((img, idx) => (
                  <input
                    key={idx}
                    type="url"
                    placeholder={`Image URL ${idx + 1}`}
                    className="w-full mb-2 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:border-amber-500 outline-none"
                    value={img}
                    onChange={(e) => handleAddImageChange(idx, e.target.value)}
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

      {/* MODAL 2: EDIT EXISTING PROPERTY & MANAGE PHOTOS */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Edit Property & Photos</h2>
              <button onClick={() => setEditingProperty(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleEditPropertySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                    value={editingProperty.category}
                    onChange={(e) => setEditingProperty({ ...editingProperty, category: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">Stand-alone House</option>
                    <option value="Villa">Villa</option>
                    <option value="Mansion">Mansion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Price / Night ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                    value={editingProperty.price}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Location / Area</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                  value={editingProperty.location}
                  onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Update Photo URLs (Up to 5 Images)
                </label>
                {editingProperty.images.map((img: string, idx: number) => (
                  <input
                    key={idx}
                    type="url"
                    placeholder={`Image URL ${idx + 1}`}
                    className="w-full mb-2 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:border-amber-500 outline-none"
                    value={img}
                    onChange={(e) => handleEditImageChange(idx, e.target.value)}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleDeleteProperty(editingProperty.id)}
                  className="px-3 py-2 text-red-400 hover:text-red-300 text-xs font-semibold"
                >
                  🗑️ Delete Property
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="px-4 py-2 border border-neutral-700 rounded-lg text-gray-300 text-sm hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400"
                  >
                    Update Property
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 px-6 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p><span className="text-gray-300 font-semibold">La Estancia Vacation Homes</span> | Global Short-Stay & Co-Hosting Platform</p>
          <div className="flex gap-4">
            <a href="/properties" className="hover:text-gray-300">Properties</a>
            <a href="#" className="hover:text-gray-300">Blog</a>
            <a href="#" className="hover:text-gray-300">About Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}