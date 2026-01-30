import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Math for distance
const haversineMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  // FORCE convert to numbers immediately
  const userLat = parseFloat(searchParams.get("lat") || "");
  const userLon = parseFloat(searchParams.get("lon") || "");
  const hasLocation = !isNaN(userLat) && !isNaN(userLon);

  if (!q && !hasLocation) return NextResponse.json({ results: [] });

  try {
    // 1. REVERSE SEARCH (If no query, just location)
    if (!q && hasLocation) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${userLat}&lon=${userLon}`;
      const res = await fetch(url, { headers: { "User-Agent": "FriendlyCloset/1.2" } });
      const data = await res.json();
      return NextResponse.json({
        results: [{
          label: data.display_name,
          name: data.address.city || data.address.town || "Current Location",
          lat: Number(data.lat),
          lng: Number(data.lon)
        }]
      });
    }

    // 2. TEXT SEARCH
    // We ask for 50 results (limit=50) to make sure we "catch" the local Boston store
    const params = new URLSearchParams({
      format: "jsonv2",
      q: q || "",
      limit: "50",
      addressdetails: "1"
    });

    // Add a bias box if we have location (helps OSM rank them slightly better)
    if (hasLocation) {
      const d = 2.0;
      params.append("viewbox", `${userLon - d},${userLat + d},${userLon + d},${userLat - d}`);
      params.append("bounded", "0");
    }

    console.log(`SERVER LOG: Searching for "${q}" with bias at ${userLat}, ${userLon}`);

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const res = await fetch(url, { headers: { "User-Agent": "FriendlyCloset/1.2" } });
    const rawData: any[] = await res.json();

    // 3. MAP AND CALCULATE DISTANCES
    let results = (rawData || []).map((item) => {
      const itemLat = parseFloat(item.lat);
      const itemLng = parseFloat(item.lon);
      let dist = 999999; // Default for things with no location context

      if (hasLocation) {
        dist = haversineMiles(userLat, userLon, itemLat, itemLng);
      }

      return {
        label: item.display_name,
        name: item.name || item.display_name.split(",")[0],
        lat: itemLat,
        lng: itemLng,
        distance: dist
      };
    });

    // 4. THE CRITICAL SORT
    // This forces the closest items to the top regardless of what OSM thinks
    if (hasLocation) {
      results.sort((a, b) => a.distance - b.distance);
    }

    // Return the top 10 results (now guaranteed to be the 10 closest ones)
    return NextResponse.json({ results: results.slice(0, 10) });

  } catch (error) {
    console.error("Geocode Error:", error);
    return NextResponse.json({ results: [] });
  }
}
