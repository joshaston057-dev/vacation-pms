import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  const resolvedParams = await params
  const token = resolvedParams.token

  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('ical_token', token)
    .single()

  if (propError || !property) {
    return new NextResponse('Calendar not found', { status: 404 })
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_title', property.title)
    .eq('status', 'confirmed')

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Estancia Vacation Homes//Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ]

  bookings?.forEach((b) => {
    const start = b.check_in.replace(/-/g, '')
    const end = b.check_out.replace(/-/g, '')
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:booking-${b.id}@laestancia.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:Reserved - ${b.guest_name}`,
      `DESCRIPTION:Direct booking via La Estancia OS. Phone: ${b.guest_phone || 'N/A'}`,
      'END:VEVENT'
    )
  })

  icsLines.push('END:VCALENDAR')

  return new NextResponse(icsLines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${property.title.replace(/\s+/g, '_')}_calendar.ics"`
    }
  })
}