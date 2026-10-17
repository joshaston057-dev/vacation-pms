'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Booking {
  id: string;
  guest_name: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  property_name?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp Inquiry Helper Function
  const openWhatsAppBooking = (
    propertyName: string, 
    guestName: string, 
    phone: string = "256757386946"
  ) => {
    const cleanPhone = phone.replace('+', '').trim();
    const message = encodeURIComponent(
      `Hello La Estancia team, I would like to confirm booking details for ${guestName} at ${propertyName}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) {
        console.error('Error fetching bookings:', error.message);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    }

    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations & Inquiries Pipeline</h1>
          <p className="text-sm text-gray-500">Manage booking leads, review check-in timelines, and action WhatsApp client conversations.</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          + New Booking
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading reservations...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No reservations found matching the selected filter.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{booking.guest_name}</td>
                  <td className="px-6 py-4">{booking.guest_phone}</td>
                  <td className="px-6 py-4">{booking.check_in}</td>
                  <td className="px-6 py-4">{booking.check_out}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">${booking.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700 capitalize">
                      {booking.status || 'Confirmed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openWhatsAppBooking(booking.property_name || 'La Estancia Property', booking.guest_name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition"
                    >
                      💬 Contact via WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}