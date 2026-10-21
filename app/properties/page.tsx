'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pop-up Modal State
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [icalUrl, setIcalUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          setErrorMsg(error.message);
        } else if (data) {
          setProperties(data);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !icalUrl) return;

    setSyncStatus('Syncing calendar feed...');
    try {
      const { error } = await supabase
        .from('properties')
        .update({ ical_url: icalUrl })
        .eq('id', selectedProperty.id);

      if (error) {
        setSyncStatus(`Error: ${error.message}`);
      } else {
        setSyncStatus('iCal feed synced successfully!');
        setTimeout(() => {
          setSelectedProperty(null);
          setIcalUrl('');
          setSyncStatus(null);
        }, 1500);
      }
    } catch (err: any) {
      setSyncStatus(`Failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-1">
            La Estancia Portfolio
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Managed Properties
          </h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-slate-300 text-sm font-medium">
          Active Listings: <span className="text-amber-400 font-bold">{properties.length}</span>
        </div>
      </div>

      {/* Property Cards List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading your property portfolio...</div>
      ) : errorMsg ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          Failed to load properties: {errorMsg}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl space-y-2">
          <p className="text-slate-300 text-base font-medium">No properties found in your database.</p>
          <p className="text-slate-500 text-xs">Add properties via your Supabase database to populate your portfolio dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <div
              key={property.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {property.title || 'Luxury Vacation Home'}
                  </h3>
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {property.property_type || 'Villa'}
                  </span>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2">
                  {property.description || 'Managed under La Estancia Vacation Homes portfolio.'}
                </p>

                <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800/80">
                  <p>📍 Location: <span className="text-white font-medium">{property.location || 'Kampala, Uganda'}</span></p>
                  <p>💰 Nightly Rate: <span className="text-amber-400 font-bold">${property.price_per_night || '0'}</span></p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedProperty(property);
                    setIcalUrl(property.ical_url || '');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl flex items-center space-x-1.5 transition"
                >
                  <span>📅 iCal Sync</span>
                </button>

                <a
                  href={`https://wa.me/256757386946?text=Hello%2C%20I%20am%20inquiring%20about%20${encodeURIComponent(property.title || 'Property')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
                >
                  <span>WhatsApp Link</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POP-UP MODAL (Hidden until "iCal Sync" is clicked) */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📅 Calendar & iCal Sync</span>
                </h2>
                <p className="text-xs text-amber-400 font-medium mt-0.5">
                  {selectedProperty.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProperty(null);
                  setSyncStatus(null);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSync} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property ID
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedProperty.id}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Airbnb / VRBO iCal URL (.ics)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {syncStatus && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  syncStatus.includes('Error') || syncStatus.includes('Failed')
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {syncStatus}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProperty(null);
                    setSyncStatus(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Sync iCal Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}