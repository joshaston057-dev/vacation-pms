'use client';

import Link from 'next/link';

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">
              Overview of revenue, property performance, and booking activity.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-amber-500 font-semibold hover:text-amber-400 transition"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Revenue
            </span>
            <p className="text-2xl font-extrabold text-emerald-400">$0.00</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Bookings
            </span>
            <p className="text-2xl font-extrabold text-white">0</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Occupancy Rate
            </span>
            <p className="text-2xl font-extrabold text-amber-400">0%</p>
          </div>
        </div>

        {/* Placeholder Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
          No reports available yet. Incoming property bookings will populate here automatically.
        </div>
      </div>
    </main>
  );
}