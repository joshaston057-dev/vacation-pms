import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseICSBlocks(icsText: string) {
  const events: { uid: string; start: string; end: string; summary: string }[] = [];
  const blocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const uidMatch = block.match(/UID:(.*)/);
    const startMatch = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
    const endMatch = block.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/);
    const summaryMatch = block.match(/SUMMARY:(.*)/);

    if (startMatch && endMatch) {
      const formatISO = (raw: string) =>
        `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;

      events.push({
        uid: uidMatch ? uidMatch[1].trim() : crypto.randomUUID(),
        start: formatISO(startMatch[1]),
        end: formatISO(endMatch[1]),
        summary: summaryMatch ? summaryMatch[1].trim() : "External Channel Block",
      });
    }
  }
  return events;
}

export async function POST(request: Request) {
  try {
    const { propertyId, propertyTitle, ownerId, airbnbUrl, bookingComUrl } = await request.json();

    // 1. Save URLs on property
    await supabase
      .from("properties")
      .update({
        airbnb_ical_url: airbnbUrl || null,
        bookingcom_ical_url: bookingComUrl || null,
        last_ical_sync: new Date().toISOString(),
      })
      .eq("id", propertyId);

    const sources = [
      { name: "Airbnb iCal", url: airbnbUrl },
      { name: "Booking.com iCal", url: bookingComUrl },
    ].filter((s) => s.url && s.url.startsWith("http"));

    let importedCount = 0;

    for (const src of sources) {
      const res = await fetch(src.url);
      if (!res.ok) continue;
      const text = await res.text();
      const events = parseICSBlocks(text);

      for (const ev of events) {
        // Check if already synced
        const { data: existing } = await supabase
          .from("bookings")
          .select("id")
          .eq("external_uid", ev.uid)
          .maybeSingle();

        if (!existing) {
          await supabase.from("bookings").insert([
            {
              id: crypto.randomUUID(),
              property_name: propertyTitle,
              guest_name: `${ev.summary} (${src.name})`,
              phone: "External Sync",
              check_in: ev.start,
              check_out: ev.end,
              guests_count: 1,
              status: "Blocked",
              source: src.name,
              external_uid: ev.uid,
              owner_id: ownerId,
            },
          ]);
          importedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}