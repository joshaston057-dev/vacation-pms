'use client';

import { useState } from 'react';
import CalendarSyncModal from '../components/CalendarSyncModal';

export default function PropertiesPage() {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & iCal Sync Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            La Estancia Portfolio
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Managed Properties
          </h1>
        </div>

        {/* iCal Sync Button */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Sync iCal Calendars</span>
        </button>
      </div>

      {/* Active Listings Counter Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="text-sm text-slate-400">Active Listings</div>
        <div className="text-2xl font-bold text-amber-400 mt-1">0</div>
      </div>

      {/* Empty State Card */}
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center sm:p-12">
        <h3 className="text-base font-medium text-slate-300">
          No properties found in your database.
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Add properties via your Supabase database or connect your iCal feeds to populate your portfolio dashboard.
        </p>
      </div>

      {/* iCal Sync Modal Component */}
      <CalendarSyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />
    </div>
  );
}