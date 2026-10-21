'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GuestGuide {
  propertyName: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
  wifiName: string;
  wifiPass: string;
  lockboxPin: string;
  houseRules: string[];
  amenities: string[];
}

export default function GuestWelcomePage() {
  const [selectedProperty, setSelectedProperty] = useState<'kololo' | 'naguru'>('kololo');

  const guides: Record<'kololo' | 'naguru', GuestGuide> = {
    kololo: {
      propertyName: 'Kololo Serviced Apartment',
      address: 'Plot 14 Acacia Avenue, Kololo, Kampala',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      wifiName: 'LaEstancia_Kololo_5G',
      wifiPass: 'KampalaStay2026',
      lockboxPin: '4821',
      houseRules: [
        'No smoking indoors.',
        'Quiet hours between 10:00 PM and 7:00 AM.',
        'Please turn off AC units when leaving the property.',
        'Maximum 4 registered overnight guests.',
      ],
      amenities: ['High-Speed Fiber Wi-Fi', '24/7 Security & Perimeter Fence', 'In-Unit Washer', 'Dedicated Parking'],
    },
    naguru: {
      propertyName: 'Naguru Heights Villa',
      address: 'Naguru Drive, Hilltop View, Kampala',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      wifiName: 'Naguru_Heights_Guest',
      wifiPass: 'HilltopVilla2026',
      lockboxPin: '9102',
      houseRules: [
        'No parties or unannounced events.',
        'No smoking inside bedrooms or common living areas.',
        'Ensure main gate remains closed after entering.',
        'Dispose of food waste in the designated kitchen bins.',
      ],
      amenities: ['Private Garden & Terrace', 'Generator Backup', 'Housekeeping Service', 'Chauffeur Accessible'],
    },
  };

  const currentGuide = guides[selectedProperty];
  const [copiedWifi, setCopiedWifi] = useState(false);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText(currentGuide.wifiPass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Property Switcher Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-4">
        <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block">
          La Estancia Guest Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Welcome to Your Kampala Home
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          Here is everything you need for a seamless arrival and comfortable stay.
        </p>

        {/* Property Selector Buttons */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setSelectedProperty('kololo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedProperty === 'kololo'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Kololo Serviced Apartment
          </button>
          <button
            onClick={() => setSelectedProperty('naguru')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedProperty === 'naguru'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Naguru Heights Villa
          </button>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lockbox & Self Check-In Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-2xl">🔑</span>
            <div>
              <h2 className="text-base font-bold text-white">Self Check-In & Access</h2>
              <p className="text-xs text-slate-400">Lockbox Code & Timings</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Lockbox Code</p>
                <p className="text-2xl font-black text-amber-400 font-mono tracking-widest mt-1">
                  {currentGuide.lockboxPin}
                </p>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl font-bold">
                Front Door
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                <p className="text-slate-500 font-medium">Check-In</p>
                <p className="text-white font-bold mt-0.5">{currentGuide.checkInTime}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                <p className="text-slate-500 font-medium">Check-Out</p>
                <p className="text-white font-bold mt-0.5">{currentGuide.checkOutTime}</p>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950/50 rounded-xl p-3 border border-slate-800/60">
              <span className="font-bold text-slate-300">📍 Address:</span> {currentGuide.address}
            </div>
          </div>
        </div>

        {/* Wi-Fi & Internet Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-2xl">📶</span>
            <div>
              <h2 className="text-base font-bold text-white">Wi-Fi Connection</h2>
              <p className="text-xs text-slate-400">High-Speed Fiber Internet</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Network Name (SSID)</p>
                <p className="text-sm font-bold text-white mt-0.5">{currentGuide.wifiName}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Password</p>
                  <p className="text-sm font-mono font-bold text-amber-400 mt-0.5">{currentGuide.wifiPass}</p>
                </div>
                <button
                  onClick={copyWifiPassword}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {copiedWifi ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <span>⚡</span>
              <span className="font-medium">Unlimited high-speed internet included throughout your stay.</span>
            </div>
          </div>
        </div>
      </div>

      {/* House Rules & Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* House Rules */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <span>📜</span>
            <span>House Guidelines</span>
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {currentGuide.houseRules.map((rule, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct Action Hub */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <span>🛎️</span>
              <span>Need Extra Services?</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Order airport pickups, extra cleaning, late check-out, or an in-house private chef directly from our services menu.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/services"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>🛍️</span>
              <span>Browse Services & Add-Ons</span>
            </Link>

            <a
              href="https://wa.me/256757386946?text=Hello!%20I%20am%20a%20guest%20at%20La%20Estancia%20Vacation%20Homes%20and%20need%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer block text-center"
            >
              <span>📲</span>
              <span>Contact Concierge on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}