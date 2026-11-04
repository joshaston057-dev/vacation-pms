import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { bookingId, amountPaid, paymentMethod, guestName, phone, propertyTitle, checkIn, checkOut, demographic } = await req.json()

    // 1. Generate unique 4-digit check-in access code
    const doorCode = Math.floor(1000 + Math.random() * 9000).toString()

    // 2. Fetch booking record to retrieve host_id
    const { data: bookingRecord } = await supabase
      .from('bookings')
      .select('host_id')
      .eq('id', bookingId)
      .maybeSingle()

    const hostId = bookingRecord?.host_id || null

    // 3. Update booking status safely
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'Confirmed',
        notes: `Paid: $${amountPaid} (${paymentMethod}) | Access Code: ${doorCode}`
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    // 4. Auto-toggle property status to Occupied
    if (propertyTitle) {
      await supabase
        .from('properties')
        .update({ status: 'Occupied' })
        .ilike('title', `%${propertyTitle}%`)
    }

    // 5. Auto-inject housekeeping turnover task tagged with host_id
    await supabase.from('tasks').insert([
      {
        title: `Clean Turnover - ${propertyTitle}`,
        priority: 'High',
        status: 'Pending',
        assigned_to: 'Housekeeping',
        due_date: checkOut,
        host_id: hostId
      }
    ])

    // 6. Build pre-formatted WhatsApp message URL
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
    const whatsappText = encodeURIComponent(
      `🎉 Payment Approved!\n\n` +
      `Hello ${guestName}, your reservation for ${propertyTitle} is fully CONFIRMED.\n\n` +
      `📅 Stay Dates: ${checkIn} → ${checkOut}\n` +
      `👥 Group: ${demographic}\n` +
      `💳 Payment Received: $${amountPaid} (${paymentMethod})\n` +
      `🔑 Access Code: ${doorCode} (Active at 2:00 PM on check-in day)\n\n` +
      `We look forward to hosting you at La Estancia Vacation Homes!`
    )

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${whatsappText}`

    return NextResponse.json({
      success: true,
      doorCode,
      whatsappUrl
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}