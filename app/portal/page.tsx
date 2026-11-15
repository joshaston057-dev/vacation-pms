"use client";

import Link from "next/link";

export default function PortalDashboardPage() {
  const quickActions = [
    {
      title: "Manage Properties",
      desc: "Add listings, update rates, and sync external iCal calendars.",
      href: "/portal/properties",
      icon: "🏠",
    },
    {
      title: "Reservations & Bookings",
      desc: "Review incoming inquiries, guest notes, and check-in dates.",
      href: "/portal/bookings",
      icon: "📅",
    },
    {
      title: "Housekeeping & Dispatch",
      desc: "Assign turnover cleaning and property maintenance tasks.",
      href: "/portal/dispatch",
      icon: "🧹",
    },
    {
      title: "Financial Ledger",
      desc: "Track rental payouts, expenses, and co-host commissions.",
      href: "/portal/financials",
      icon: "💰",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-lg font-bold text-white">Host Operations Overview</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Welcome back to La Estancia Vacation Homes. Select a module below or use the top navigation bar to manage daily operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-5 transition flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-amber-500/10 flex items-center justify-center text-lg shrink-0">
              {card.icon}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                {card.title}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}