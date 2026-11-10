'lib/client'
'use client'

import { useState } from 'react'

interface CoHostClient {
  id: string
  ownerName: string
  propertyName: string
  commissionRate: number
  contactPhone: string
  status: 'Active' | 'Pending Setup' | 'Paused'
}

export default function CoHostingPage() {
  const [clients, setClients] = useState<CoHostClient[]>([
    {
      id: '1',
      ownerName: 'Sarah Jenkins',
      propertyName: 'Entebbe Lakefront Mansion',
      commissionRate: 20,
      contactPhone: '+256 700 123456',
      status: 'Active'
    },
    {
      id: '2',
      ownerName: 'David Mugisha',
      propertyName: 'Kisaasi Furnished Duplex',
      commissionRate: 15,
      contactPhone: '+256 772 987654',
      status: 'Active'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    ownerName: '',
    propertyName: '',
    commissionRate: 15,
    contactPhone: '',
    status: 'Active' as const
  })

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    const newClient: CoHostClient = {
      id: Date.now().toString(),
      ...formData,
      commissionRate: Number(formData.commissionRate)
    }
    setClients([newClient, ...clients])
    setIsModalOpen(false)
    setFormData({ ownerName: '', propertyName: '', commissionRate: 15, contactPhone: '', status: 'Active' })
  }

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Co-Host Services Management</h1>
            <p className="text-neutral-400 text-sm mt-1">Manage partner property owners, contracts, and commission rates.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Co-Host Client
          </button>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-md font-semibold">
                    {client.status}
                  </span>
                  <span className="text-sm font-bold text-neutral-300">{client.commissionRate}% Commission</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{client.propertyName}</h3>
                <p className="text-sm text-neutral-400 mb-4">Owner: <span className="text-neutral-200 font-medium">{client.ownerName}</span></p>
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 mb-4 text-xs text-neutral-300">
                  <p>Contact: {client.contactPhone}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-medium"
                >
                  Remove Client
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add Co-Host Client</h2>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    value={formData.propertyName}
                    onChange={e => setFormData({ ...formData, propertyName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Munyonyo Luxury Villa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Commission (%)</label>
                    <input
                      type="number"
                      required
                      value={formData.commissionRate}
                      onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="+256..."
                    />
                  </div>
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
                    Save Client
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