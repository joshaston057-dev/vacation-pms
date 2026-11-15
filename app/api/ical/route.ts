import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function GET() {
  if (!supabase) {
    return new NextResponse("Supabase client not configured", { status: 500 });
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .in("status", ["Confirmed", "Approved"]);

  if (error) {
    return new NextResponse("Error fetching bookings for iCal", { status: 500 });
  }

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Estancia Vacation Homes//Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const booking of bookings || []) {
    if (!booking.check_in || !booking.check_out) continue;
    const dtstart = booking.check_in.replace(/-/g, "");
    const dtend = booking.check_out.replace(/-/g, "");

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${booking.id}@laestancia.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:Booked - ${booking.property_name || "Property"} (${booking.guest_name})`,
      `DESCRIPTION:Guest: ${booking.guest_name}\\nPhone: ${booking.phone}\\nStatus: ${booking.status}`,
      "END:VEVENT"
    );
  }

  icsContent.push("END:VCALENDAR");

  return new NextResponse(icsContent.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="la-estancia-bookings.ics"',
    },
  });
}