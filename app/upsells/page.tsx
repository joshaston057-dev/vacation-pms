'use client'

import { useState } from 'react'

interface UpsellService {
  id: string
  title: string
  category: string
  price: number
  description: string
}

export default function UpsellsPage() {
  const [services, setServices] = useState<UpsellService[]>([
    { id: '1', title: 'Airport Pickup / Dropoff', category: 'Transport', price: 40, description: 'Comfortable private vehicle airport transfer.' },
    { id: '2', title: 'Private Chef Experience', category: 'Dining', price: 75, description: 'Professional chef prepares a 3-course local or international meal.' },
    { id: '3', title: 'Mid-Stay Deep Cleaning', category: 'Housekeeping', price: 30, description: 'Full linen change and deep room sanitization.' }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: 'Transport', price: 25, description: '' })

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()
    const newService: UpsellService = {
      id: Date.now().toString(),
      ...formData,
      price: Number(formData.price)
    }
    setServices([newService, ...services])
    setIsModalOpen(false)
    setFormData({ title: '', category: 'Transport', price: 25, description: '' })
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upsell & Guest Services</h1>
            <p className="text-neutral-400 text-sm mt-1">Configure add-on services offered to guests during booking or stay.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Upsell Service
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-neutral-800 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-semibold">
                    {service.category}
                  </span>
                  <span className="text-xl font-bold text-emerald-400">${service.price}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm text-neutral-400 mb-4">{service.description}</p>
              </div>
              <div className="flex justify-end pt-4 border-t border-neutral-800">
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-medium"
                >
                  Remove Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add Upsell Service</h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Guided City Tour"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Transport">Transport</option>
                      <option value="Dining">Dining</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Tours">Tours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
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
                    placeholder="Briefly describe what is included..."
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
                    Save Service
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