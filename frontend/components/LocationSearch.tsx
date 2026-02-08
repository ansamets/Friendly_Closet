"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface LocationResult {
  label: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  onSelect: (location: string, lat: number | null, lng: number | null) => void;
  storeName?: string;
}

export default function LocationSearch({ onSelect, storeName }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // SEARCH FUNCTION
  const performSearch = async (searchTerm: string, userLat?: number, userLng?: number) => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 3 && !userLat && !userLng) return;

    setLoading(true);
    try {
      // Points to the custom Next.js route to bypass the /api rewrite
      let url = "/location-service";
      const params = new URLSearchParams();

      if (trimmed.length > 0) {
        params.append("q", trimmed);
      }

      const lat = userLat ?? userCoords?.lat;
      const lng = userLng ?? userCoords?.lng;

      if (lat && lng) {
        params.append("lat", lat.toString());
        params.append("lon", lng.toString());
      }

      const res = await fetch(`${url}?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(true);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE GPS CLICK
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setUserCoords(newCoords);

        if (query.trim().length >= 3) {
          await performSearch(query, latitude, longitude);
        }
        else {
          try {
            const res = await fetch(`/location-service?lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const first = data?.results?.[0];
            if (first?.name) {
              setQuery(first.name);
              onSelect(first.name, latitude, longitude);
            } else {
              onSelect("Current Location", latitude, longitude);
            }
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      },
      (err) => {
        alert("Could not get location. Please type manually.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Debounce typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length < 3) return;
      performSearch(query, userCoords?.lat, userCoords?.lng);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, userCoords]);

  // Click Outside logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={storeName ? `Find ${storeName} location...` : "Search City or Address..."}
          // Solid background, mint border, brand text
          className="w-full pr-10 p-3 bg-white rounded-2xl outline-none border border-pastel-mint focus:ring-4 focus:ring-pastel-mint/50 focus:border-brand-primary transition-all text-brand-text placeholder:text-stone-400"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (userCoords) setUserCoords(null);
            onSelect(e.target.value, null, null);
          }}
        />

        {loading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="w-5 h-5 m-1.5 animate-spin text-brand-primary" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className={`mt-2 text-xs underline underline-offset-4 transition-colors ${
          userCoords ? "text-brand-primary font-bold" : "text-brand-text/60 hover:text-brand-text"
        }`}
      >
        {userCoords ? "✓ Using your location" : "Use my location for better results"}
      </button>

      {/* DROPDOWN RESULTS */}
      {/* Changed bg-white/95 to solid bg-white */}
      {isOpen && results.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-2 rounded-2xl border border-pastel-mint shadow-xl shadow-brand-text/10 max-h-60 overflow-y-auto"
          style={{ backgroundColor: "#ffffff" }}
        >
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                setQuery(item.name);
                setIsOpen(false);
                onSelect(item.label, item.lat, item.lng);
              }}
              // Clean transitions and mint highlights
              className="p-3 hover:bg-pastel-mint/30 cursor-pointer border-b border-pastel-mint/20 last:border-0 flex flex-col transition-colors"
              style={{ backgroundColor: "#ffffff" }}
            >
              <p className="text-sm font-semibold text-brand-text">{item.name}</p>
              <p className="text-[10px] text-brand-text/60 truncate">{item.label}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
