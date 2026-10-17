import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">La Estancia PMS</h2>
          <span className="text-xs text-gray-500 font-medium">Host & Co-Host SaaS</span>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link
            href="/admin/bookings"
            className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            📅 Bookings Pipeline
          </Link>
          <Link
            href="/admin/properties"
            className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            🏢 Property Portfolio
          </Link>
          <Link
            href="/admin/reports"
            className="block px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            💰 Owner Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}