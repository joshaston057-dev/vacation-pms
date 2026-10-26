'use client'

import { useEffect, useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Service {
  id: string
  title: string
  category: string
  price: number
  price_type: string // e.g., 'per trip', 'per day', 'per stay'
  description: string
  image_url?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching services:', error.message)
        } else if (data) {
          setServices(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching services:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-amber-500 mb-3">
              Concierge Services & Upsells
            </h1>
            <p className="text-neutral-400 max-w-2xl">
              Elevate your guest experience with airport transfers, private chef services, safari bookings, and bespoke luxury addons across Kampala.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-neutral-400 animate-pulse">
              Loading concierge services from database...
            </div>
          ) : services.length === 0 ? (
            <div className="py-20 text-center bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <p className="text-xl text-neutral-300 font-semibold mb-2">No concierge services added yet</p>
              <p className="text-neutral-500 text-sm">
                Add your first service offer from your database or admin portal to see it appear here live!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition duration-300 flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">
                        {service.category || 'Concierge'}
                      </span>
                      <span className="text-lg font-bold text-amber-500">
                        ${service.price} <span className="text-xs font-normal text-neutral-400">/ {service.price_type}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>

                  <div className="p-6 pt-0 border-t border-neutral-800/50 mt-4 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">La Estancia Guarantee</span>
                    <a 
                      href={`https://wa.me/256757386946?text=Hi!%20I%20would%20like%20to%20book%20the%20${encodeURIComponent(service.title)}%20service`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition"
                    >
                      Book Addon
                    </a>
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