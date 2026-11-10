import type { Metadata } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Estancia Vacation Homes | Host Portal',
  description: 'International Property Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 antialiased min-h-screen flex`}>
        
        {/* Persistent Sidebar Navigation */}
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-lg font-bold tracking-tight text-white">La Estancia</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Host Portal & PMS</p>
            </div>
            <nav className="p-4 space-y-1.5 text-sm font-medium">
              <Link href="/properties" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition">
                🏠 Properties
              </Link>
              <Link href="/bookings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition">
                📅 Bookings & iCal
              </Link>
              <Link href="/financials" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition">
                💰 Financial Ledger
              </Link>
              <Link href="/co-hosting" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition">
                🤝 Co-Hosting
              </Link>
              <Link href="/upsells" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition">
                ⭐ Upsell Services
              </Link>
              <Link href="/tasks" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition">
                📋 Tasks & Dispatch
              </Link>
            </nav>
          </div>
          <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500">
            <p>Environment: Production</p>
            <p className="mt-1 text-emerald-400">● Live Synced</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </body>
    </html>
  )
}