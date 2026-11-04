import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { bookingId, amountPaid, paymentMethod, guestName, phone, propertyTitle, checkIn, checkOut, demographic } = await req.json()

    // 1. Generate unique 4-digit guest check-in code
    const doorCode = Math.floor(1000 + Math.random() * 9000).toString()

    // 2. Update booking status to CONFIRMED with door code
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'Confirmed',
        paid_amount: amountPaid,
        notes: `Door Code: ${doorCode} | Method: ${paymentMethod}`
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    // 3. Auto-Log Revenue into Financial Ledger Table
    await supabase.from('ledger').insert([
      {
        description: `Booking Revenue (${paymentMethod}) - ${guestName}`,
        amount: `+$${amountPaid}`,
        status: 'Received',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    ])

    // 4. Auto-Create Housekeeping & Turnover Task for Staff
    await supabase.from('tasks').insert([
      {
        title: `Clean Turnover & Inspection - ${propertyTitle}`,
        priority: 'High',
        status: 'Pending',
        assigned_to: 'Housekeeping',
        due_date: checkOut
      }
    ])

    // 5. Build Automated WhatsApp Message Payload
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
    const whatsappText = encodeURIComponent(
      `🎉 Payment Approved!\n\n` +
      `Hello ${guestName}, your booking for ${propertyTitle} is fully CONFIRMED.\n\n` +
      `📅 Stay Dates: ${checkIn} → ${checkOut}\n` +
      `👥 Occupancy: ${demographics}\n` +
      `💳 Paid: $${amountPaid} via ${paymentMethod}\n` +
      `🔑 Access Code: ${doorCode} (Active at 2:00 PM on ${checkIn})\n\n` +
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