'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data } = await supabase.from('properties').select('*')
    if (data) setProperties(data)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h1 className="text-2xl font-extrabold text-white">Our Short-Stay Properties</h1>
            <p className="text-xs text-neutral-400 mt-1">Explore our verified vacation homes and furnished apartments.</p>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-500 py-6">Loading properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6">No properties listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-white text-base">{prop.title}</h3>
                    <span className="text-amber-500 font-extrabold text-sm">${prop.price_per_night}/night</span>
                  </div>
                  <p className="text-xs text-neutral-400">📍 {prop.location || 'Kampala'}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                      prop.is_occupied 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {prop.is_occupied ? '🔴 Occupied' : '🟢 Available'}
                    </span>

                    <a
                      href={`https://wa.me/256757386946?text=${encodeURIComponent(`Hello, I am interested in reserving ${prop.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow"
                    >
                      💬 Reserve via WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}