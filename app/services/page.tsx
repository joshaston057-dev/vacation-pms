'use client'

import { useEffect, useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface ConciergeService {
  id: string
  title: string
  category: string
  price: number
  description: string
  image_url?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<ConciergeService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('concierge_services')
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
              Luxury Concierge Services
            </h1>
            <p className="text-neutral-400 max-w-2xl">
              Elevate your stay with premium add-on services curated by La Estancia for guests and host partners worldwide.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-neutral-400 animate-pulse">
              Loading concierge services...
            </div>
          ) : services.length === 0 ? (
            <div className="py-20 text-center bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <p className="text-xl text-neutral-300 font-semibold mb-2">No concierge services added yet</p>
              <p className="text-neutral-500 text-sm">
                Add services like VIP Airport Transfer or Private Chef from your Host OS Operations portal to display them here live!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/50 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/25">
                        {service.category}
                      </span>
                      <span className="text-lg font-bold text-amber-500">
                        ${service.price}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                      {service.description || 'Custom tailored luxury service upon request.'}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/256757386946?text=Hi!%20I%20am%20interested%20in%20reserving%20the%20${encodeURIComponent(service.title)}%20concierge%20service.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition text-center block mt-4"
                  >
                    Inquire via WhatsApp
                  </a>
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