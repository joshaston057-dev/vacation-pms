import { NextResponse } from 'next/server';
import ical from 'node-ical';

// 1. Manual Sync (POST request)
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'iCal URL is required' }, { status: 400 });
    }

    const events = await ical.async.fromURL(url);
    const bookings = [];

    for (const key in events) {
      if (!Object.prototype.hasOwnProperty.call(events, key)) continue;
      const event = events[key];

      if (event && event.type === 'VEVENT') {
        bookings.push({
          id: event.uid || key,
          summary: event.summary || 'Imported Booking',
          startDate: event.start ? new Date(event.start).toISOString().split('T')[0] : '',
          endDate: event.end ? new Date(event.end).toISOString().split('T')[0] : '',
          source: url.includes('airbnb') ? 'Airbnb' : url.includes('booking') ? 'Booking.com' : 'iCal',
        });
      }
    }

    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to parse iCal', details: error.message }, { status: 500 });
  }
}

// 2. Automated Vercel Cron Sync (GET request)
export async function GET() {
  try {
    const activeFeeds = [
      process.env.KOLOLO_ICAL_URL,
      process.env.NAGURU_ICAL_URL,
    ].filter(Boolean);

    if (activeFeeds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Cron triggered, but no property iCal URLs are configured in environment variables yet.',
      });
    }

    const results = [];
    for (const url of activeFeeds) {
      if (!url) continue;
      const events = await ical.async.fromURL(url);
      const count = Object.values(events).filter((e: any) => e && e.type === 'VEVENT').length;
      results.push({ url, count });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      syncedProperties: results.length,
      details: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Cron job failed', details: error.message }, { status: 500 });
  }
}