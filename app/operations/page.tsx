'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

export default function OperationsPage() {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Financial Metrics state
  const [metrics, setMetrics] = useState({
    grossRevenue: 0,
    netCommission: 0,
    conciergeProfit: 0,
    totalExpenses: 0,
    netIncome: 0
  })

  // Form states for Property
  const [propTitle, setPropTitle] = useState('')
  const [propLocation, setPropLocation] = useState('')
  const [propPrice, setPropPrice] = useState('')
  const [propBeds, setPropBeds] = useState('1')
  const [propBaths, setPropBaths] = useState('1')
  const [propGuests, setPropGuests] = useState('2')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form states for Expense
  const [expCategory, setExpCategory] = useState('Maintenance')
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')

  // Lists for preview
  const [propertiesList, setPropertiesList] = useState<any[]>([])
  const [expensesList, setExpensesList] = useState<any[]>([])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === 'estancia2026') {
      setIsAuthenticated(true)
      setErrorMsg('')
      fetchDashboardData()
    } else {
      setErrorMsg('Invalid passcode. Access denied.')
    }
  }

  const fetchDashboardData = async () => {
    // Fetch Properties
    const { data: propsData } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (propsData) setPropertiesList(propsData)

    // Fetch Expenses
    const { data: expData } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
    if (expData) setExpensesList(expData)

    // Calculate Financial Metrics
    const { data: bookings } = await supabase.from('bookings').select('total_price')
    const grossRev = bookings?.reduce((acc, b) => acc + (b.total_price || 0), 0) || 0
    const netComm = grossRev * 0.15 // 15% co-hosting standard fee

    const { data: concierge } = await supabase.from('concierge_orders').select('price, cost')
    const conciergeProf = concierge?.reduce((acc, c) => acc + ((c.price || 0) - (c.cost || 0)), 0) || 0

    const totalExp = expData?.reduce((acc, e) => acc + (e.amount || 0), 0) || 0
    const netInc = netComm + conciergeProf - totalExp

    setMetrics({
      grossRevenue: grossRev,
      netCommission: netComm,
      conciergeProfit: conciergeProf,
      totalExpenses: totalExp,
      netIncome: netInc
    })
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `properties/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      let publicImageUrl = ''
      if (imageFile) {
        publicImageUrl = await uploadImage(imageFile)
      }

      const { error } = await supabase.from('properties').insert([
        {
          title: propTitle,
          location: propLocation,
          price_per_night: parseFloat(propPrice),
          bedrooms: parseInt(propBeds),
          bathrooms: parseInt(propBaths),
          guests: parseInt(propGuests),
          image_url: publicImageUrl
        }
      ])

      if (error) throw error

      alert('Property created successfully!')
      setPropTitle('')
      setPropLocation('')
      setPropPrice('')
      setImageFile(null)
      fetchDashboardData()
    } catch (err: any) {
      alert(`Error saving property: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('expenses').insert([
        {
          category: expCategory,
          description: expDesc,
          amount: parseFloat(expAmount)
        }
      ])

      if (error) throw error

      alert('Expense recorded successfully!')
      setExpDesc('')
      setExpAmount('')
      fetchDashboardData()
    } catch (err: any) {
      alert(`Error recording expense: ${err.message}`)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchDashboardData()
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return
    await supabase.from('expenses').delete().eq('id', id)
    fetchDashboardData()
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h1 className="text-2xl font-bold text-amber-500 mb-2">Host OS Operations</h1>
            <p className="text-sm text-neutral-400 mb-6">Enter your administrative passcode to manage properties and financials.</p>
            
            <input 
              type="password" 
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg mb-4 text-white focus:outline-none focus:border-amber-500"
            />
            
            {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}
            
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition">
              Unlock Portal
            </button>
          </form>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />
        
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-neutral-800">
            <div>
              <h1 className="text-3xl font-extrabold text-amber-500">EstanciaOS Financial & Operations Portal</h1>
              <p className="text-neutral-400 text-sm mt-1">Track revenue, management commissions, OpEx, and property listings.</p>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="mt-4 md:mt-0 px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white rounded-lg text-sm"
            >
              🔒 Lock Portal
            </button>
          </div>

          {/* FINANCIAL SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Gross Booking Volume</p>
              <p className="text-3xl font-extrabold text-white mt-2">${metrics.grossRevenue.toLocaleString()}</p>
              <span className="text-xs text-neutral-500">Total guest bookings</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Co-Hosting Revenue</p>
              <p className="text-3xl font-extrabold text-amber-500 mt-2">${metrics.netCommission.toLocaleString()}</p>
              <span className="text-xs text-neutral-500">Estimated 15% commission</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Operating Expenses</p>
              <p className="text-3xl font-extrabold text-red-400 mt-2">${metrics.totalExpenses.toLocaleString()}</p>
              <span className="text-xs text-neutral-500">Recorded OpEx</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Net Operating Income</p>
              <p className={`text-3xl font-extrabold mt-2 ${metrics.netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${metrics.netIncome.toLocaleString()}
              </p>
              <span className="text-xs text-neutral-500">After expense deduction</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* PROPERTY FORM */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Add New Property</h2>
              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Property Title</label>
                  <input required type="text" placeholder="e.g. Kololo Luxury Apartment" value={propTitle} onChange={e=>setPropTitle(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Location</label>
                  <input required type="text" placeholder="e.g. Kololo, Kampala" value={propLocation} onChange={e=>setPropLocation(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Price per Night ($)</label>
                    <input required type="number" placeholder="150" value={propPrice} onChange={e=>setPropPrice(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Max Guests</label>
                    <input required type="number" value={propGuests} onChange={e=>setPropGuests(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Bedrooms</label>
                    <input required type="number" value={propBeds} onChange={e=>setPropBeds(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Bathrooms</label>
                    <input required type="number" value={propBaths} onChange={e=>setPropBaths(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Property Photo (Supabase Storage)</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700" />
                </div>
                <button disabled={uploading} type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition disabled:opacity-50">
                  {uploading ? 'Uploading Photo & Saving...' : 'Publish Property'}
                </button>
              </form>
            </div>

            {/* EXPENSE LOGGER FORM */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Log Operating Expense</h2>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Expense Category</label>
                  <select value={expCategory} onChange={e=>setExpCategory(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white">
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Cleaning">Cleaning & Supplies</option>
                    <option value="Utilities">Utilities (Power/Water/Internet)</option>
                    <option value="Marketing">Marketing & Advertising</option>
                    <option value="Software">Software & Subscriptions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Amount ($)</label>
                  <input required type="number" placeholder="75" value={expAmount} onChange={e=>setExpAmount(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Description / Notes</label>
                  <input type="text" placeholder="e.g. AC servicing for Kololo Villa" value={expDesc} onChange={e=>setExpDesc(e.target.value)} className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" />
                </div>
                <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition">
                  Record Expense
                </button>
              </form>
            </div>
          </div>

          {/* TABLES */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Active Properties ({propertiesList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                  <thead className="text-xs uppercase bg-neutral-950 text-neutral-500">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Price/Night</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertiesList.map(p => (
                      <tr key={p.id} className="border-b border-neutral-800">
                        <td className="p-3 font-semibold text-white">{p.title}</td>
                        <td className="p-3 text-amber-500">${p.price_per_night}</td>
                        <td className="p-3">
                          <button onClick={()=>handleDeleteProperty(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Recorded Expenses ({expensesList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                  <thead className="text-xs uppercase bg-neutral-950 text-neutral-500">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesList.map(e => (
                      <tr key={e.id} className="border-b border-neutral-800">
                        <td className="p-3 font-semibold text-white">{e.category}</td>
                        <td className="p-3 text-xs">{e.description || '-'}</td>
                        <td className="p-3 text-red-400 font-semibold">${e.amount}</td>
                        <td className="p-3">
                          <button onClick={()=>handleDeleteExpense(e.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}