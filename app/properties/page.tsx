'use client'

import { useEffect, useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  title: string
  location: string
  price_per_night?: number
  price?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  baths?: number
  guests?: number
  max_guests?: number
  image_url?: string
  image?: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching properties:', error.message)
        } else if (data) {
          setProperties(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching properties:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-amber-500 mb-3">
              Global Luxury Vacation Stays
            </h1>
            <p className="text-neutral-400 max-w-2xl">
              Explore our hand-picked portfolio of premium vacation apartments, stand-alone houses, and luxury villas worldwide.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-neutral-400 animate-pulse">
              Loading properties from database...
            </div>
          ) : properties.length === 0 ? (
            <div className="py-20 text-center bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <p className="text-xl text-neutral-300 font-semibold mb-2">No properties listed yet</p>
              <p className="text-neutral-500 text-sm">
                Add your first property from your EstanciaOS Operations portal to see it appear here live!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => {
                // Handle key variations & fallback values gracefully
                const price = property.price_per_night ?? property.price ?? 0
                const beds = property.bedrooms ?? property.beds ?? 0
                const baths = property.bathrooms ?? property.baths ?? 0
                const maxGuests = property.guests ?? property.max_guests ?? 0
                const imageUrl = property.image_url || property.image

                return (
                  <div 
                    key={property.id} 
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {imageUrl ? (
                        <div className="h-56 w-full overflow-hidden relative">
                          <img 
                            src={imageUrl} 
                            alt={property.title} 
                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-56 w-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm">
                          No image provided
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/25">
                            {property.location || 'Uganda'}
                          </span>
                          <span className="text-lg font-bold text-amber-500">
                            ${price} <span className="text-xs font-normal text-neutral-400">/ night</span>
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3">{property.title}</h3>
                        
                        <div className="flex items-center gap-4 text-xs text-neutral-400 border-t border-neutral-800 pt-4 mb-2">
                          <span>🛏️ {beds} Beds</span>
                          <span>🛁 {baths} Baths</span>
                          <span>👥 {maxGuests} Guests</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-neutral-800/50 mt-4 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">La Estancia Verified</span>
                      <a 
                        href={`https://wa.me/256757386946?text=Hi!%20I%20would%20like%20to%20book%20or%20inquire%20about%20${encodeURIComponent(property.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition"
                      >
                        Book via WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}