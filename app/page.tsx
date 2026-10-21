'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProperties(data);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden border-b border-slate-800 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950" />

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6 py-20 z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs tracking-wider uppercase backdrop-blur-md">
            ✨ Premium Serviced Apartments & Mansions
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Luxury Staycation Homes <br className="hidden sm:inline" /> Made Effortless.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Experience hand-picked short-stay apartments and houses. Reserve directly via WhatsApp with zero extra booking fees.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#listings"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5"
            >
              Explore Available Stays
            </a>
            <a
              href="https://wa.me/256757386946?text=Hello%20La%20Estancia%2C%20I%20would%20like%20to%20inquire%20about%20your%20co-hosting%20and%20listing%20services."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 backdrop-blur-md transition"
            >
              List Your Property With Us
            </a>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-1">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Properties
            </h2>
          </div>
          <p className="text-slate-400 text-sm">
            {properties.length} homes available for direct booking
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading homes...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-400 text-base font-medium">No properties listed yet.</p>
            <p className="text-slate-500 text-xs mt-1">Visit /properties to add your first listing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => {
              const waMessage = encodeURIComponent(
                `Hello La Estancia, I want to inquire about booking "${property.title}" in ${property.location || 'Kampala'}.`
              );
              const waLink = `https://wa.me/256757386946?text=${waMessage}`;

              return (
                <div
                  key={property.id}
                  className="group bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl hover:border-amber-500/50 transition duration-300 flex flex-col"
                >
                  <div className="relative h-64 w-full bg-slate-800 overflow-hidden">
                    <img
                      src={
                        property.image_url ||
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={property.title || 'Property Image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    
                    <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-800 shadow-md">
                      {property.category || 'Vacation Home'}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-2 flex items-center gap-1 font-medium">
                        📍 {property.location || 'Kampala, Uganda'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-amber-400">
                          ${property.nightly_price || property.price || '0'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium"> / night</span>
                      </div>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
                      >
                        <span>💬 Book WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}