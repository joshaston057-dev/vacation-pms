'use client'

import { useEffect, useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  title: string
  location: string
  price_per_night: number
  bedrooms: number
  bathrooms: number
  guests: number
  image_url: string
  description?: string
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
        console.error('Unexpected error:', err)
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
              Our Exclusive Stays
            </h1>
            <p className="text-neutral-400 max-w-2xl">
              Discover curated luxury apartments, villas, and stand-alone vacation homes across Uganda.
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
                Add your first property from the host management portal or Supabase dashboard to see it appear here live!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition duration-300"
                >
                  <div className="h-56 bg-neutral-800 relative">
                    {property.image_url ? (
                      <img 
                        src={property.image_url} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{property.title}</h3>
                    <p className="text-neutral-400 text-sm mb-4">📍 {property.location}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-400 border-t border-b border-neutral-800 py-3 mb-6">
                      <span>🛏️ {property.bedrooms} Beds</span>
                      <span>🚿 {property.bathrooms} Baths</span>
                      <span>👥 {property.guests} Guests</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-amber-500">${property.price_per_night}</span>
                        <span className="text-xs text-neutral-500"> / night</span>
                      </div>
                      <a 
                        href={`https://wa.me/256757386946?text=Hi!%20I%20am%20interested%20in%20booking%20${encodeURIComponent(property.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition"
                      >
                        Inquire
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}