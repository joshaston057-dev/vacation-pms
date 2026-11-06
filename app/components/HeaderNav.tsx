'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HeaderNav() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isPrivateDashboard = pathname === '/operations'

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight">
            La Estancia <span className="text-amber-400">Vacation Homes</span>
          </span>
        </Link>

        {user && isPrivateDashboard ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-400 hidden sm:inline">
              Host Portal
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-400 hover:bg-rose-900/50 transition cursor-pointer"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-amber-500 hover:text-amber-400 transition"
            >
              Host Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}