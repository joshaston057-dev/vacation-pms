'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PublicUpsells({ onSelectUpsells }: { onSelectUpsells: (selected: any[]) => void }) {
  const [upsells, setUpsells] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    fetchUpsells()
  }, [])

  const fetchUpsells = async () => {
    const { data } = await supabase.from('upsell_services').select('*').order('id', { ascending: true })
    if (data) setUpsells(data)
  }

  const toggleService = (id: number) => {
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id]
    
    setSelectedIds(updated)
    const selectedObjects = upsells.filter((u) => updated.includes(u.id))
    onSelectUpsells(selectedObjects)
  }

  if (upsells.length === 0) return null

  return (
    <div className="space-y-3 bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
      <div>
        <h4 className="text-white font-black text-sm">✨ Enhance Your Stay (Optional Add-Ons)</h4>
        <p className="text-xs text-neutral-400">Select premium services to include with your reservation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {upsells.map((u) => {
          const isSelected = selectedIds.includes(u.id)
          return (
            <div
              key={u.id}
              onClick={() => toggleService(u.id)}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                isSelected ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{u.icon || '✨'}</span>
                <div>
                  <h5 className="font-extrabold text-xs">{u.title}</h5>
                  <p className="text-[10px] text-neutral-400 line-clamp-1">{u.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-amber-400 text-xs">${u.price || u.price_usd || 0}</span>
                <span className={`block text-[9px] font-bold ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`}>
                  {isSelected ? '✓ Selected' : '+ Add'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}