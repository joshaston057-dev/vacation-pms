'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  name: string;
  owner_name: string;
  price_per_night: number;
  commission_rate: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [commissionRate, setCommissionRate] = useState('20');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    
      const { data, error } = await supabase.from('properties').select('*').order('name', { ascending: true });

    if (error) console.error('Error fetching properties:', error);
    else setProperties(data || []);
    setLoading(false);
  }

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('properties').insert([
      {
        name,
        owner_name: ownerName,
        price_per_night: parseFloat(pricePerNight),
        commission_rate: parseFloat(commissionRate),
      },
    ]);

    if (error) {
      alert('Error creating property: ' + error.message);
    } else {
      setName('');
      setOwnerName('');
      setPricePerNight('');
      setCommissionRate('20');
      fetchProperties();
    }
    setLoading(false);
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000) return `UGX ${val.toLocaleString()}`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <main className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen text-black">
      <nav className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm mb-8">
        <span className="font-bold text-lg text-blue-700">La Estancia PMS</span>
        <div className="flex gap-6 font-semibold text-sm">
          <Link href="/properties" className="text-blue-600 border-b-2 border-blue-600 pb-1">
            Properties
          </Link>
          <Link href="/bookings" className="text-gray-600 hover:text-blue-600 transition">
            Bookings
          </Link>
          <Link href="/reports" className="text-gray-600 hover:text-blue-600 transition">
            Owner Reports
          </Link>
        </div>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Property Inventory & Portfolio</h1>
        <p className="text-gray-600">Manage your apartments, houses, mansions, and villas</p>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm mb-10">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Add New Property</h2>
        <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Property Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. La Estancia Villa"
              required
              className="w-full border p-2 rounded text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Owner Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              className="w-full border p-2 rounded text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Price Per Night (UGX or $)</label>
            <input
              type="number"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="e.g. 350000"
              required
              className="w-full border p-2 rounded text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Agency Commission Rate (%)</label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="20"
              required
              className="w-full border p-2 rounded text-black bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Portfolio ({properties.length})</h2>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-xs uppercase font-semibold text-gray-600">
              <th className="p-3">Property Name</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Price / Night</th>
              <th className="p-3">Commission Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading properties...</td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No properties added yet.</td></tr>
            ) : (
              properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                  <td className="p-3 text-gray-700">{p.owner_name}</td>
                  <td className="p-3 font-semibold text-gray-900">{formatCurrency(p.price_per_night)}</td>
                  <td className="p-3 text-green-700 font-medium">{p.commission_rate}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}