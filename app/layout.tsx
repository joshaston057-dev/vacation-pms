"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased">
        {/* Top Navbar for Public Pages */}
        {!isPortal && (
          <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="font-bold text-white text-lg">
                La Estancia <span className="text-amber-500 font-normal">Vacation Homes</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/portal/properties"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  Host Portal &rarr;
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}