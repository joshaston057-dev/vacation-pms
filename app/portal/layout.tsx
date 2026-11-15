"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [counts, setCounts] = useState({
    properties: 0,
    bookings: 0,
    dispatch: 0,
    cohosting: 0,
  });

  // Public auth routes inside /portal that shouldn't require a logged-in session
  const isPublicAuthRoute =
    pathname === "/portal/login" ||
    pathname === "/portal/forgot-password" ||
    pathname === "/portal/reset-password";

  // Real-time Auth Guard & Listener
  useEffect(() => {
    if (isPublicAuthRoute) {
      setCheckingAuth(false);
      return;
    }

    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        router.replace("/portal/login");
      } else {
        setCheckingAuth(false);
      }
    });

    // 2. Listen for sign-out or session expiration in real time
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/portal/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, isPublicAuthRoute, router]);

  // Fetch counts when authenticated
  useEffect(() => {
    if (isPublicAuthRoute || checkingAuth) return;

    const fetchCounts = async () => {
      const [propsRes, bookingsRes, dispatchRes, cohostRes] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("cohosts").select("*", { count: "exact", head: true }),
      ]);

      setCounts({
        properties: propsRes.count || 0,
        bookings: bookingsRes.count || 0,
        dispatch: dispatchRes.count || 0,
        cohosting: cohostRes.count || 0,
      });
    };

    fetchCounts();
  }, [pathname, isPublicAuthRoute, checkingAuth]);

  // Secure Lock / Log Out Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/portal/login");
  };

  if (isPublicAuthRoute) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center text-xs">
        Verifying personal unlock session...
      </div>
    );
  }

  const navItems = [
    { name: "Properties", href: "/portal/properties", icon: "🏠", count: counts.properties },
    { name: "Bookings", href: "/portal/bookings", icon: "📅", count: counts.bookings },
    { name: "Dispatch", href: "/portal/dispatch", icon: "🧹", count: counts.dispatch },
    { name: "Ledger", href: "/portal/financials", icon: "💰", count: null },
    { name: "Upsells", href: "/portal/upsells", icon: "✨", count: null },
    { name: "Co-Hosts", href: "/portal/cohosting", icon: "🤝", count: counts.cohosting },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="font-bold text-white text-xl tracking-tight">La Estancia</span>
            <span className="font-bold text-amber-500 text-xl tracking-tight">Vacation Homes</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400 font-medium">Host Portal</span>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-neutral-900 hover:bg-red-950/50 text-neutral-200 hover:text-red-300 border border-neutral-800 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
            >
              🔒 Lock / Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar & Module Pills Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-8 pb-6 space-y-5">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-neutral-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Quick search properties, guests, or tasks..."
            className="w-full bg-neutral-900/70 border border-neutral-800/80 rounded-xl pl-11 pr-4 py-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>

        {/* Sleek Navigation Pills */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/10"
                    : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800/80"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? "bg-neutral-950/20 text-neutral-950"
                        : "bg-neutral-800 text-amber-400 border border-neutral-700/50"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 pb-12 flex-1">
        {children}
      </main>
    </div>
  );
}