'use client';

import { useState } from 'react';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarSyncModal({ isOpen, onClose }: CalendarSyncModalProps) {
  const [icalUrl, setIcalUrl] = useState('');
  const [propertyName, setPropertyName] = useState('Kololo Serviced Apartment');
  const [loading, setLoading] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSyncedCount(null);

    try {
      const res = await fetch('/api/ical/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: icalUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setSyncedCount(data.count);
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
            <h2 className="text-lg font-bold text-white">Import iCal Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Property</label>
            <select
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Kololo Serviced Apartment">Kololo Serviced Apartment</option>
              <option value="Naguru Heights Villa">Naguru Heights Villa</option>
              <option value="Bugolobi Modern Suite">Bugolobi Modern Suite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              iCal Feed Link (.ics URL)
            </label>
            <input
              type="url"
              required
              placeholder="https://www.airbnb.com/calendar/ical/..."
              value={icalUrl}
              onChange={(e) => setIcalUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Paste the export calendar URL from Airbnb, Booking.com, or VRBO.
            </span>
          </div>

          {syncedCount !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl p-3">
              ✓ Successfully fetched <strong>{syncedCount}</strong> external bookings!
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
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}