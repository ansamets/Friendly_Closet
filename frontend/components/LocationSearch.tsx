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
      // UPDATED: Now points to the new location-service route
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
            // UPDATED: Now points to the new location-service route
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length < 3) return;
      performSearch(query, userCoords?.lat, userCoords?.lng);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, userCoords]);

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
          className="w-full pr-10 p-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-stone-200"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (userCoords) setUserCoords(null);
            onSelect(e.target.value, null, null);
          }}
        />

        {loading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="w-5 h-5 m-1.5 animate-spin text-stone-400" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className={`mt-2 text-xs underline underline-offset-4 transition-colors ${
          userCoords ? "text-blue-600 font-medium" : "text-stone-500 hover:text-stone-700"
        }`}
      >
        {userCoords ? "✓ Using your location" : "Use my location for better results"}
      </button>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-stone-200 shadow-lg max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                setQuery(item.name);
                setIsOpen(false);
                onSelect(item.label, item.lat, item.lng);
              }}
              className="p-3 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0 flex flex-col"
            >
              <p className="text-sm font-medium text-stone-900">{item.name}</p>
              <p className="text-[10px] text-stone-500 truncate">{item.label}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
