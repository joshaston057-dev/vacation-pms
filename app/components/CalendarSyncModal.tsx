'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface PropertyItem {
  id: string;
  title: string;
  airbnb_ical_url?: string;
  bookingcom_ical_url?: string;
}

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarSyncModal({ isOpen, onClose }: CalendarSyncModalProps) {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [bookingComUrl, setBookingComUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch properties belonging to the logged-in owner when modal opens
  useEffect(() => {
    async function loadProperties() {
      if (!supabase || !isOpen) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, airbnb_ical_url, bookingcom_ical_url')
        .eq('owner_id', user.id);

      if (!error && data && data.length > 0) {
        setProperties(data);
        setSelectedPropertyId(data[0].id);
        setAirbnbUrl(data[0].airbnb_ical_url || '');
        setBookingComUrl(data[0].bookingcom_ical_url || '');
      }
    }
    loadProperties();
  }, [isOpen]);

  // Update URL inputs when property selection changes
  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      setAirbnbUrl(prop.airbnb_ical_url || '');
      setBookingComUrl(prop.bookingcom_ical_url || '');
    }
  };

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSyncedCount(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      const targetProp = properties.find((p) => p.id === selectedPropertyId);
      if (!targetProp) throw new Error('Please select a valid property');

      const res = await fetch('/api/ical/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: targetProp.id,
          propertyTitle: targetProp.title,
          ownerId: user.id,
          airbnbUrl,
          bookingComUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setSyncedCount(data.importedCount);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error syncing calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">
              Channel Sync
            </span>
            <h2 className="text-lg font-bold text-white">Import & Sync iCal Feeds</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Airbnb iCal Feed Link (.ics URL)
            </label>
            <input
              type="url"
              placeholder="https://www.airbnb.com/calendar/ical/..."
              value={airbnbUrl}
              onChange={(e) => setAirbnbUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Booking.com iCal Feed Link (.ics URL)
            </label>
            <input
              type="url"
              placeholder="https://admin.booking.com/hotel/hoteladmin/ical.ics..."
              value={bookingComUrl}
              onChange={(e) => setBookingComUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Paste your channel calendar export links to auto-import external bookings and block dates.
            </span>
          </div>

          {syncedCount !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl p-3">
              ✓ Successfully synced! Imported <strong>{syncedCount}</strong> new booking(s).
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3">
              ⚠ {errorMessage}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || properties.length === 0}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Syncing Feeds...' : 'Save & Sync Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}