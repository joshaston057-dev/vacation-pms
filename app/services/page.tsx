'use client';

import { useState } from 'react';

interface ServiceItem {
  id: string;
  title: string;
  category: 'Transport' | 'Flexibility' | 'Hospitality' | 'Rentals';
  priceUSD: number;
  priceUGX: number;
  description: string;
  icon: string;
  available: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: '1',
      title: 'Entebbe Airport Pickup / Dropoff',
      category: 'Transport',
      priceUSD: 40,
      priceUGX: 150000,
      description: 'Private comfortable transport directly between Entebbe Airport and your villa/apartment.',
      icon: '🚗',
      available: true,
    },
    {
      id: '2',
      title: 'Early Check-In / Late Check-Out',
      category: 'Flexibility',
      priceUSD: 25,
      priceUGX: 95000,
      description: 'Flexible timing to match your flight schedule (subject to property availability).',
      icon: '⏰',
      available: true,
    },
    {
      id: '3',
      title: 'In-House Private Chef Dining',
      category: 'Hospitality',
      priceUSD: 60,
      priceUGX: 225000,
      description: 'Custom organic breakfast or 3-course dinner prepared directly in your vacation home.',
      icon: '👨‍🍳',
      available: true,
    },
    {
      id: '4',
      title: '4x4 SUV / Vehicle Rental',
      category: 'Rentals',
      priceUSD: 80,
      priceUGX: 300000,
      description: 'Chauffeur-driven or self-drive SUV for city errands or safari road trips.',
      icon: '🚘',
      available: true,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [guestName, setGuestName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Form State for Adding New Upsells
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Transport' | 'Flexibility' | 'Hospitality' | 'Rentals'>('Transport');
  const [priceUSD, setPriceUSD] = useState('');
  const [priceUGX, setPriceUGX] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('✨');

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceUSD) return;

    const newService: ServiceItem = {
      id: Date.now().toString(),
      title,
      category,
      priceUSD: parseFloat(priceUSD) || 0,
      priceUGX: parseFloat(priceUGX) || (parseFloat(priceUSD) * 3750),
      description: description || 'Premium guest addon service.',
      icon: icon || '✨',
      available: true,
    };

    setServices([...services, newService]);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Transport');
    setPriceUSD('');
    setPriceUGX('');
    setDescription('');
    setIcon('✨');
  };

  const toggleAvailability = (id: string) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, available: !s.available } : s))
    );
  };

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !guestName || !propertyName) return;

    const message = `*NEW GUEST SERVICE REQUEST*%0A%0A` +
      `*Service:* ${selectedService.title} (${selectedService.icon})%0A` +
      `*Price:* $${selectedService.priceUSD} / ${selectedService.priceUGX.toLocaleString()} UGX%0A` +
      `*Guest Name:* ${guestName}%0A` +
      `*Property:* ${propertyName}%0A` +
      `*Requested Date:* ${serviceDate || 'Flexible'}%0A` +
      `*Notes:* ${specialNotes || 'None'}`;

    window.open(`https://wa.me/256757386946?text=${message}`, '_blank');
    setSelectedService(null);
    setGuestName('');
    setPropertyName('');
    setServiceDate('');
    setSpecialNotes('');
  };

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-1">
            Revenue Expansion
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Guest Upsell Services & Experiences
          </h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-slate-300 text-sm font-medium">
          Active Offerings: <span className="text-amber-400 font-bold">{services.filter(s => s.available).length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Service Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md h-fit space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            ➕ Add New Service Offering
          </h2>

          <form onSubmit={handleAddService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Housekeeping Extra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Transport">Transport</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Rentals">Rentals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emoji Icon</label>
                <input
                  type="text"
                  placeholder="e.g. 🧹"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD $)</label>
                <input
                  type="number"
                  required
                  placeholder="30"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price (UGX)</label>
                <input
                  type="number"
                  placeholder="115000"
                  value={priceUGX}
                  onChange={(e) => setPriceUGX(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Brief summary of what is included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
            >
              Save Service Offering
            </button>
          </form>
        </div>

        {/* Services Showcase Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-4 border border-slate-800 rounded-2xl backdrop-blur-md">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filter Services</span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(['All', 'Transport', 'Flexibility', 'Hospitality', 'Rentals'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((s) => (
              <div
                key={s.id}
                className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl transition flex flex-col justify-between space-y-4 relative ${
                  s.available ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                      {s.icon}
                    </div>
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-amber-400 font-bold text-[10px] rounded-lg">
                      {s.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-white">${s.priceUSD}</span>
                    <span className="text-xs font-medium text-slate-500 ml-1.5">
                      (~{s.priceUGX.toLocaleString()} UGX)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAvailability(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        s.available
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {s.available ? 'Active' : 'Disabled'}
                    </button>

                    {s.available && (
                      <button
                        onClick={() => setSelectedService(s)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                      >
                        🛍️ Book Add-On
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Order Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedService.icon}</span>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedService.title}</h2>
                  <p className="text-xs text-amber-400 font-bold">${selectedService.priceUSD} (~{selectedService.priceUGX.toLocaleString()} UGX)</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Property Staying At</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kololo Serviced Apartment"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Service Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flight # search details or dietary preferences..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  📲 Send Order via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}