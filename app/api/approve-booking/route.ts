import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { bookingId, amountPaid, paymentMethod, guestName, phone, propertyTitle, checkIn, checkOut, demographic } = await req.json()

    // 1. Generate unique 4-digit guest check-in code
    const doorCode = Math.floor(1000 + Math.random() * 9000).toString()

    // 2. Update booking status safely without crashing on paid_amount column
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'Confirmed',
        notes: `Paid: $${amountPaid} (${paymentMethod}) | Code: ${doorCode}`
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    // 3. Build Automated WhatsApp Confirmation
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
    const whatsappText = encodeURIComponent(
      `🎉 Payment Approved!\n\n` +
      `Hello ${guestName}, your reservation for ${propertyTitle} is fully CONFIRMED.\n\n` +
      `📅 Stay Dates: ${checkIn} → ${checkOut}\n` +
      `👥 Guests: ${demographic}\n` +
      `💳 Payment: $${amountPaid} (${paymentMethod})\n` +
      `🔑 Door Access Code: ${doorCode}\n\n` +
      `We look forward to welcoming you to La Estancia Vacation Homes!`
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