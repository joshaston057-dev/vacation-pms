import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // 1. Fetch property by export token
    const { data: property, error: pErr } = await supabase
      .from('properties')
      .select('id, title')
      .eq('ical_export_token', token)
      .single()

    if (pErr || !property) {
      return new NextResponse('Calendar Not Found', { status: 404 })
    }

    // 2. Fetch all confirmed/paid bookings for this property
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, guest_name')
      .eq('property_id', property.id)
      .neq('status', 'CANCELLED')

    // 3. Build iCal formatted text
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//La Estancia Vacation Homes//PMS Calendar 1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${property.title} Availability`
    ]

    if (bookings) {
      bookings.forEach((b) => {
        const startDate = b.check_in.replace(/-/g, '')
        const endDate = b.check_out.replace(/-/g, '')

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:booking-${b.id}@laestancia.app`,
          `DTSTART;VALUE=DATE:${startDate}`,
          `DTEND;VALUE=DATE:${endDate}`,
          `SUMMARY:Reserved - ${b.guest_name || 'Guest'}`,
          `DESCRIPTION:La Estancia Vacation Homes Direct Reservation`,
          'END:VEVENT'
        )
      })
    }

    icsContent.push('END:VCALENDAR')

    return new NextResponse(icsContent.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="property-${property.id}.ics"`
      }
    })
  } catch (err: any) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}