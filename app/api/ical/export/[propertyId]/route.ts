import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;

  // 1. Fetch property title
  const { data: property } = await supabase
    .from("properties")
    .select("title")
    .eq("id", propertyId)
    .single();

  if (!property) {
    return new NextResponse("Property not found", { status: 404 });
  }

  // 2. Fetch confirmed bookings for this property
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, guest_name, check_in, check_out, status")
    .eq("property_name", property.title)
    .in("status", ["Confirmed", "Approved", "Blocked"]);

  // 3. Build standard iCalendar (.ics) string
  const formatICSDate = (dateStr: string) => dateStr.replace(/-/g, "");
  const nowStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Estancia Vacation Homes//PMS Calendar Sync//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  (bookings || []).forEach((booking) => {
    if (!booking.check_in || !booking.check_out) return;
    icsLines.push(
      "BEGIN:VEVENT",
      `UID:laestancia-${booking.id}@vacation-pms.vercel.app`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${formatICSDate(booking.check_in)}`,
      `DTEND;VALUE=DATE:${formatICSDate(booking.check_out)}`,
      `SUMMARY:Reserved (${booking.guest_name || "Direct Booking"})`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  icsLines.push("END:VCALENDAR");

  return new NextResponse(icsLines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="laestancia-${propertyId}.ics"`,
    },
  });
}