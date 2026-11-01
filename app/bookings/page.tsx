'use client'

import { useEffect } from 'react'

export default function BookingsRedirect() {
  useEffect(() => {
    window.location.href = '/operations'
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center text-sm font-bold">
      Loading Operations Hub...
    </div>
  )
}