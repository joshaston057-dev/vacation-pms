'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HeaderNav() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // 1. Terminate host auth session in Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // 2. Redirect to login page and refresh routing cache
      router.push('/login')
      router.refresh()
    } catch (err: any) {
      alert('Error logging out: ' + err.message)
    }
  }

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight">
            La Estancia <span className="text-amber-500 font-extrabold">PMS</span>
          </span>
        </a>

        {/* NAV ACTIONS */}
        <div className="flex items-center gap-3">
          <a
            href="/operations"
            className="text-xs font-extrabold text-neutral-300 hover:text-white px-3 py-2 rounded-lg transition"
          >
            Dashboard
          </a>

          {/* LOG OUT BUTTON */}
          <button
            onClick={handleLogout}
            className="text-xs font-black bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            🚪 Log Out
          </button>
        </div>

      </div>
    </header>
  )
}