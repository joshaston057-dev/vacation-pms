import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { propertyId } = params

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // 1. Fetch confirmed bookings for this specific property
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'CONFIRMED')

    if (error) throw error

    // 2. Format iCalendar (.ics) header standards
    let icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//La Estancia Vacation Homes//PMS Calendar Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]

    // 3. Loop through confirmed stays and create VEVENT blocks
    bookings?.forEach((b) => {
      // Format YYYY-MM-DD to YYYYMMDD for iCal compliance
      const start = b.check_in ? b.check_in.replace(/-/g, '') : ''
      const end = b.check_out ? b.check_out.replace(/-/g, '') : ''
      const uid = `booking-${b.id}@laestancia.com`
      const summary = `Reserved - ${b.guest_name || 'Guest'}`

      if (start && end) {
        icsLines.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${start}T000000Z`,
          `DTSTART;VALUE=DATE:${start}`,
          `DTEND;VALUE=DATE:${end}`,
          `SUMMARY:${summary}`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        )
      }
    })

    icsLines.push('END:VCALENDAR')

    // 4. Return as text/calendar file stream
    return new NextResponse(icsLines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="property-${propertyId}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}