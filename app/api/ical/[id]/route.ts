import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (propError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', id);

    if (bookError) {
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//La Estancia Vacation Homes//PMS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    if (bookings) {
      bookings.forEach((booking) => {
        const dtstart = booking.check_in ? booking.check_in.replace(/-/g, '') : '';
        const dtend = booking.check_out ? booking.check_out.replace(/-/g, '') : '';

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:booking-${booking.id}@laestancia.com`,
          `DTSTAMP:${dtstart}T000000Z`,
          `DTSTART;VALUE=DATE:${dtstart}`,
          `DTEND;VALUE=DATE:${dtend}`,
          `SUMMARY:Reserved - La Estancia Guest`,
          'END:VEVENT'
        );
      });
    }

    icsContent.push('END:VCALENDAR');

    return new NextResponse(icsContent.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="property-${id}.ics"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}