import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // If no query and no coords, return empty
  if (!q && (!lat || !lon)) return NextResponse.json({ results: [] });

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      limit: "10",
      addressdetails: "1",
    });

    // LOGIC: If we have coordinates but NO text, do a "Reverse Geocode" (Find city name)
    if (!q && lat && lon) {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(reverseUrl, {
        headers: { "User-Agent": "WardrobeApp/1.0" },
      });
      const data = await res.json();

      return NextResponse.json({
        results: [{
          label: data.display_name,
          name: data.address.city || data.address.town || data.address.village || "Current Location",
          lat: Number(data.lat),
          lng: Number(data.lon)
        }]
      });
    }

    // LOGIC: Standard Text Search (two-pass: biased first, then global)
    if (q) {
      params.append("q", q);
    }

    const searchOnce = async (extraParams?: URLSearchParams) => {
      const merged = new URLSearchParams(params);
      if (extraParams) {
        extraParams.forEach((value, key) => merged.set(key, value));
      }
      const url = `https://nominatim.openstreetmap.org/search?${merged.toString()}`;
      const r = await fetch(url, {
        headers: { "User-Agent": "WardrobeApp/1.0" },
      });
      if (!r.ok) throw new Error("OSM Error");
      return r.json();
    };

    let data: any[] = [];

    // Pass 1: bias near user if coords are available
    if (q && lat && lon) {
      const d = 1.0; // roughly 60 miles box
      const viewbox = `${Number(lon) - d},${Number(lat) + d},${Number(lon) + d},${Number(lat) - d}`;
      data = await searchOnce(new URLSearchParams({ viewbox }));
    }

    // Pass 2: global search if biased results are empty
    if (!data || data.length === 0) {
      data = await searchOnce();
    }

    const results = (data || []).map((x) => ({
      label: x.display_name,
      name: x.name || x.display_name.split(",")[0],
      lat: Number(x.lat),
      lng: Number(x.lon),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ results: [] });
  }
}
