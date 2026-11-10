'use client'

import { useState } from 'react'

interface Property {
  id: string
  name: string
  type: string
  location: string
  price: number
  description: string
  amenities: string[]
  photoUrl: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Entebbe Lakeside Villa',
      type: 'Villa',
      location: 'Entebbe',
      price: 250,
      description: 'Stunning luxury villa overlooking the lake.',
      amenities: ['Pool', 'WiFi', 'Kitchen', 'AC'],
      photoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      name: 'Kisaasi Executive Suite',
      type: 'Apartment',
      location: 'Kisaasi',
      price: 80,
      description: 'Modern, secure 1-bedroom apartment in a prime neighborhood.',
      amenities: ['Security', 'WiFi', 'Parking', 'Smart TV'],
      photoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Apartment',
    location: '',
    price: 100,
    description: '',
    amenities: 'WiFi, AC, Kitchen',
    photoUrl: ''
  })

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault()
    const newProperty: Property = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      location: formData.location,
      price: Number(formData.price),
      description: formData.description,
      amenities: formData.amenities.split(',').map(a => a.trim()),
      photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    }
    setProperties([newProperty, ...properties])
    setIsModalOpen(false)
    setFormData({ name: '', type: 'Apartment', location: '', price: 100, description: '', amenities: '', photoUrl: '' })
  }

  const handleDelete = (id: string) => {
    setProperties(properties.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Properties Management</h1>
            <p className="text-neutral-400 text-sm mt-1">Manage your villas, mansions, and apartments.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Property
          </button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
              <img src={property.photoUrl} alt={property.name} className="h-48 w-full object-cover" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase tracking-wider bg-neutral-800 text-emerald-400 px-2.5 py-1 rounded-md font-semibold">
                      {property.type}
                    </span>
                    <span className="text-lg font-bold text-emerald-400">${property.price} <span className="text-xs text-neutral-400 font-normal">/ night</span></span>
                  </div>
                  <h3 className="text-xl font-bold">{property.name}</h3>
                  <p className="text-sm text-neutral-400 mb-3">{property.location}</p>
                  <p className="text-sm text-neutral-300 mb-4 line-clamp-2">{property.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {property.amenities.map((amenity, idx) => (
                      <span key={idx} className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
                  <button onClick={() => handleDelete(property.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add New Property</h2>
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Munyonyo Luxury Mansion"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Villa">Villa</option>
                      <option value="Mansion">Mansion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Entebbe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Price per Night ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Describe the property highlights..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Pool, WiFi, AC"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Save Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}