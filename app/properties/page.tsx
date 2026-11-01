'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function PublicPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicProperties()
  }, [])

  const fetchPublicProperties = async () => {
    const { data } = await supabase.from('properties').select('*')
    if (data && data.length > 0) {
      setProperties(data)
    } else {
      setProperties([
        {
          id: '1',
          title: '1 bedroom fully furnished apartment for rent in kisaasi',
          price_per_night: 45,
          location: 'kisaasi',
          is_occupied: false,
          images: []
        },
        {
          id: '2',
          title: '5 bedroom fully furnished Mansion for rent in Entebbe',
          price_per_night: 500,
          location: 'Entebbe',
          is_occupied: false,
          images: []
        }
      ])
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-amber-500 font-extrabold text-xs tracking-widest uppercase">LA ESTANCIA VACATION HOMES</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Exclusive Short-Stay Stays in Uganda</h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Browse fully furnished apartments, standalone houses, mansions, and villas with direct host booking.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-neutral-500 font-bold text-sm">
              Loading available properties...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const whatsappMsg = encodeURIComponent(
                  `Hello La Estancia, I am interested in reserving "${p.title}" located in ${p.location}. Is it available?`
                )
                const whatsappUrl = `https://wa.me/256757386946?text=${whatsappMsg}`

                // Parse images safely
                let imgList: string[] = []
                if (Array.isArray(p.images)) {
                  imgList = p.images
                } else if (typeof p.images === 'string' && p.images.startsWith('[')) {
                  try { imgList = JSON.parse(p.images) } catch (e) { imgList = [p.images] }
                } else if (typeof p.images === 'string' && p.images.length > 0) {
                  imgList = [p.images]
                }

                return (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition">
                    
                    {/* IMAGE DISPLAY CONTAINER */}
                    <div className="relative w-full h-52 bg-neutral-950 flex items-center justify-center overflow-hidden">
                      {imgList.length > 0 ? (
                        <img 
                          src={imgList[0]} 
                          alt={p.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-3xl">🏠</span>
                          <p className="text-[10px] text-neutral-500 mt-1">La Estancia Managed Property</p>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow">
                        ${p.price_per_night} / night
                      </div>

                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${p.is_occupied ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                          {p.is_occupied ? 'Occupied' : 'Available Now'}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS CONTAINER */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">📍 {p.location || 'Kampala'}</span>
                        <h3 className="font-extrabold text-white text-sm line-clamp-2">{p.title}</h3>
                      </div>

                      {/* THUMBNAILS ROW */}
                      {imgList.length > 1 && (
                        <div className="flex gap-1 overflow-x-auto pt-2">
                          {imgList.slice(0, 5).map((img: string, idx: number) => (
                            <img key={idx} src={img} className="w-10 h-10 object-cover rounded-lg border border-neutral-800" alt="Thumbnail" />
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-neutral-800">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                        >
                          💬 Inquire / Book via WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}