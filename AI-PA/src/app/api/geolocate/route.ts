import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use a simple public IP geolocation service as a fallback.
    const resp = await fetch("https://ipapi.co/json/");
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("ipapi.co error:", resp.status, txt);
      return NextResponse.json({ error: "Failed to geolocate" }, { status: 502 });
    }

    const data = await resp.json();
    const lat = data.latitude ?? data.lat ?? null;
    const lon = data.longitude ?? data.lon ?? null;
    const city = data.city ?? null;

    if (!lat || !lon) {
      return NextResponse.json({ error: "No location available" }, { status: 502 });
    }

    return NextResponse.json({ lat, lon, city });
  } catch (err) {
    console.error("/api/geolocate error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
